"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isHttpUrl, normalizeUrl } from "@/lib/url";

const MAX_LINKS = 20;

const linkSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(50, "Max 50 characters"),
  url: z
    .string()
    .min(1, "Link is required")
    .max(2048, "Max 2048 characters")
    .refine(isHttpUrl, "Enter a valid web address, like https://example.com"),
});

export type LinkField = "label" | "url";
export type LinkValues = Record<LinkField, string>;

export type LinkFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<LinkField, string>>;
  values?: LinkValues;
};

// Creates a new link, or updates one when the form sends a hidden "id"
export async function saveLink(
  _prev: LinkFormState,
  formData: FormData,
): Promise<LinkFormState> {
  const { userId } = await auth();
  if (!userId) return { status: "error", message: "You must be signed in." };

  const id = String(formData.get("id") ?? "");

  const raw: LinkValues = {
    label: String(formData.get("label") ?? ""),
    url: String(formData.get("url") ?? ""),
  };

  const parsed = linkSchema.safeParse({
    label: raw.label,
    url: normalizeUrl(raw.url),
  });

  if (!parsed.success) {
    const errors: Partial<Record<LinkField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as LinkField;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: "error", errors, values: raw };
  }

  const data = { label: parsed.data.label, url: parsed.data.url };

  if (id) {
    // Edit: the ownership check lives in the query itself
    const result = await prisma.link.updateMany({
      where: { id, profile: { user: { clerkId: userId } } },
      data,
    });
    if (result.count === 0) {
      return { status: "error", message: "Link not found.", values: raw };
    }
    revalidatePath("/dashboard");
    return { status: "success", message: "Link updated." };
  }

  // Add: find the profile through the logged-in user
  const profile = await prisma.profile.findFirst({
    where: { user: { clerkId: userId } },
    select: { id: true },
  });
  if (!profile) {
    return { status: "error", message: "Profile not found.", values: raw };
  }

  const stats = await prisma.link.aggregate({
    where: { profileId: profile.id },
    _count: true,
    _max: { order: true },
  });
  if (stats._count >= MAX_LINKS) {
    return {
      status: "error",
      message: `You can add up to ${MAX_LINKS} links.`,
      values: raw,
    };
  }

  // New links go to the end of the list
  const order = (stats._max.order ?? -1) + 1;

  await prisma.link.create({
    data: { profileId: profile.id, order, ...data },
  });

  revalidatePath("/dashboard");
  return { status: "success", message: "Link added." };
}

export async function deleteLink(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.link.deleteMany({
    where: { id, profile: { user: { clerkId: userId } } },
  });

  revalidatePath("/dashboard");
}