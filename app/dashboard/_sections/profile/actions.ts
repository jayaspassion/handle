"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100, "Max 100 characters"),
  headline: z.string().trim().max(150, "Max 150 characters"),
  bio: z.string().trim().max(2000, "Max 2000 characters"),
  location: z.string().trim().max(100, "Max 100 characters"),
});

type Field = "fullName" | "headline" | "bio" | "location";

export type ProfileFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<Field, string>>;
  values?: Record<Field, string>;
};

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  // 1. Who is logged in?
  const { userId } = await auth();
  if (!userId) return { status: "error", message: "You must be signed in." };

  // 2. Validate on the server
  const raw: Record<Field, string> = {
    fullName: String(formData.get("fullName") ?? ""),
    headline: String(formData.get("headline") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    location: String(formData.get("location") ?? ""),
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Partial<Record<Field, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as Field;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: "error", errors, values: raw };
  }

  // 3. Ownership: find the profile through the logged-in user, never via a form ID
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) {
    return { status: "error", message: "Account not found.", values: raw };
  }

  // 4. Write (empty strings become null in the database)
  const { fullName, headline, bio, location } = parsed.data;
  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      fullName,
      headline: headline || null,
      bio: bio || null,
      location: location || null,
    },
  });

  revalidatePath("/dashboard");
  return { status: "success", message: "Profile saved." };
}