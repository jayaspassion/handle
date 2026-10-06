import { Webhook } from "svix";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type ClerkEvent = {
  type: string;
  data: { id?: string };
};

// Clerk throws an error with a 404 status when a user doesn't exist
function isNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { status?: number }).status === 404
  );
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return new Response("Webhook not configured", { status: 500 });
  }

  // 1. Verify the request really came from Clerk
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  let event: ClerkEvent;
  try {
    event = new Webhook(secret).verify(await req.text(), {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const clerkId = event.data?.id;
  if (!clerkId) {
    return new Response("Missing Clerk user ID", { status: 400 });
  }

  const client = await clerkClient();

  // 2. Account deleted in Clerk -> hard delete everything in our database.
  // deleteMany doesn't fail if the row is already gone, so retries are safe.
  // Cascade deletes remove the profile and all its sections too.
  if (event.type === "user.deleted") {
    await prisma.user.deleteMany({ where: { clerkId } });
    console.info("User deleted:", clerkId);
    return new Response("OK", { status: 200 });
  }

  // Ignore any other event types
  if (event.type !== "user.created") {
    return new Response("OK", { status: 200 });
  }

  // 3. Ask Clerk if this user still exists. A retried event can arrive
  // for an account that was deleted since, and that's safe to ignore.
  let email: string | undefined;
  try {
    const clerkUser = await client.users.getUser(clerkId);
    email = clerkUser.emailAddresses.find(
      (a) => a.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress;
  } catch (error) {
    if (isNotFound(error)) {
      console.info("Ignored event for deleted Clerk user:", clerkId);
      return new Response("OK", { status: 200 });
    }
    // Clerk unreachable: return an error so Clerk retries later
    return new Response("Clerk lookup failed", { status: 503 });
  }

  if (!email) {
    return new Response("Primary email required", { status: 422 });
  }

  // 4. Already synced (duplicate delivery): just make sure a profile exists
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) {
    await prisma.profile.upsert({
      where: { userId: existing.id },
      update: {},
      create: { userId: existing.id },
    });
    return new Response("OK", { status: 200 });
  }

  // 5. Same email but a different clerkId: is the old account stale?
  const emailOwner = await prisma.user.findUnique({ where: { email } });
  if (emailOwner) {
    try {
      await client.users.getUser(emailOwner.clerkId);
      // The old account still exists in Clerk, so this is a real conflict
      console.error("Email conflict, needs manual review:", { clerkId, email });
      return new Response("Email already belongs to another account", {
        status: 409,
      });
    } catch (error) {
      if (!isNotFound(error)) {
        return new Response("Clerk lookup failed", { status: 503 });
      }
      // Old account is gone from Clerk: the row is leftover, so remove it
      await prisma.user.delete({ where: { id: emailOwner.id } });
      console.info("Removed stale user row:", emailOwner.clerkId);
    }
  }

  // 6. Create the user and an empty profile together
  try {
    await prisma.user.create({
      data: { clerkId, email, profile: { create: {} } },
    });
  } catch (error) {
    // Two deliveries raced; return an error so the retry sees the new row
    if ((error as { code?: string }).code === "P2002") {
      return new Response("Retry", { status: 503 });
    }
    console.error("User sync failed:", clerkId, error);
    return new Response("User sync failed", { status: 500 });
  }

  console.info("User and empty profile created:", clerkId);
  return new Response("OK", { status: 200 });
}