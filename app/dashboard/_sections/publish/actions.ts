"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Web addresses we need ourselves, so no profile can take them
const RESERVED = new Set([
  "about", "account", "admin", "api", "app", "assets", "billing", "blog",
  "contact", "dashboard", "delete", "docs", "edit", "explore", "favicon",
  "handle", "help", "home", "inbox", "login", "logout", "mail", "me",
  "messages", "new", "notifications", "null", "onboarding", "pricing",
  "privacy", "profile", "profiles", "public", "robots", "root", "search",
  "settings", "sign-in", "sign-out", "sign-up", "signin", "signout",
  "signup", "sitemap", "static", "support", "terms", "undefined", "user",
  "users", "webhooks", "www",
]);

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters")
  .max(30, "Use at most 30 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use only letters, numbers and single hyphens, and don't start or end with a hyphen",
  )
  .refine((v) => !RESERVED.has(v), "This username is reserved");

export type PublishState = {
  status: "idle" | "success" | "error";
  message?: string;
  usernameError?: string;
  values?: { username: string };
};

export async function publishProfile(
  _prev: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const { userId } = await auth();
  if (!userId) return { status: "error", message: "You must be signed in." };

  const raw = String(formData.get("username") ?? "");
  const values = { username: raw };

  const parsed = usernameSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      usernameError: parsed.error.issues[0]?.message ?? "Invalid username",
      values,
    };
  }
  const username = parsed.data;

  // Ownership: find the profile through the logged-in user
  const profile = await prisma.profile.findFirst({
    where: { user: { clerkId: userId } },
    select: { id: true, fullName: true, isPublished: true },
  });
  if (!profile) {
    return { status: "error", message: "Profile not found.", values };
  }
  if (profile.isPublished) {
    return { status: "error", message: "Your profile is already published.", values };
  }
  if (!profile.fullName?.trim()) {
    return {
      status: "error",
      message: "Add your name in the Profile section before publishing.",
      values,
    };
  }

  try {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { username, isPublished: true },
    });
  } catch (error) {
    // The database's unique rule is the final judge of "taken"
    if ((error as { code?: string }).code === "P2002") {
      return {
        status: "error",
        usernameError: "That username is taken. Try another.",
        values,
      };
    }
    console.error("Publish failed:", error);
    return { status: "error", message: "Could not publish. Please try again.", values };
  }

  revalidatePath("/dashboard");
  return { status: "success", message: "Your profile is published." };
}

export async function unpublishProfile() {
  const { userId } = await auth();
  if (!userId) return;

  // The ownership check lives in the query itself. The username stays reserved.
  await prisma.profile.updateMany({
    where: { user: { clerkId: userId } },
    data: { isPublished: false },
  });

  revalidatePath("/dashboard");
}