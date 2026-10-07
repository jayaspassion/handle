"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isHttpUrl, normalizeUrl } from "@/lib/url";

const MAX_TESTIMONIALS = 20;

const testimonialSchema = z.object({
  quote: z.string().trim().min(1, "Quote is required").max(1000, "Max 1000 characters"),
  authorName: z.string().trim().min(1, "Author name is required").max(100, "Max 100 characters"),
  authorRole: z.string().trim().max(100, "Max 100 characters"),
  authorCompany: z.string().trim().max(100, "Max 100 characters"),
  authorAvatarUrl: z
    .string()
    .max(2048, "Max 2048 characters")
    .refine(isHttpUrl, "Enter a valid web address, like https://example.com"),
});

export type TestimonialField =
  | "quote"
  | "authorName"
  | "authorRole"
  | "authorCompany"
  | "authorAvatarUrl";

export type TestimonialValues = Record<TestimonialField, string>;

export type TestimonialFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<TestimonialField, string>>;
  values?: TestimonialValues;
};

// Creates a new testimonial, or updates one when the form sends a hidden "id"
export async function saveTestimonial(
  _prev: TestimonialFormState,
  formData: FormData,
): Promise<TestimonialFormState> {
  const { userId } = await auth();
  if (!userId) return { status: "error", message: "You must be signed in." };

  const id = String(formData.get("id") ?? "");

  const raw: TestimonialValues = {
    quote: String(formData.get("quote") ?? ""),
    authorName: String(formData.get("authorName") ?? ""),
    authorRole: String(formData.get("authorRole") ?? ""),
    authorCompany: String(formData.get("authorCompany") ?? ""),
    authorAvatarUrl: String(formData.get("authorAvatarUrl") ?? ""),
  };

  const parsed = testimonialSchema.safeParse({
    ...raw,
    authorAvatarUrl: normalizeUrl(raw.authorAvatarUrl),
  });

  if (!parsed.success) {
    const errors: Partial<Record<TestimonialField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as TestimonialField;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: "error", errors, values: raw };
  }

  const d = parsed.data;
  const data = {
    quote: d.quote,
    authorName: d.authorName,
    authorRole: d.authorRole || null,
    authorCompany: d.authorCompany || null,
    authorAvatarUrl: d.authorAvatarUrl || null,
  };

  if (id) {
    // Edit: the ownership check lives in the query itself
    const result = await prisma.testimonial.updateMany({
      where: { id, profile: { user: { clerkId: userId } } },
      data,
    });
    if (result.count === 0) {
      return { status: "error", message: "Testimonial not found.", values: raw };
    }
    revalidatePath("/dashboard");
    return { status: "success", message: "Testimonial updated." };
  }

  // Add: find the profile through the logged-in user
  const profile = await prisma.profile.findFirst({
    where: { user: { clerkId: userId } },
    select: { id: true },
  });
  if (!profile) {
    return { status: "error", message: "Profile not found.", values: raw };
  }

  const stats = await prisma.testimonial.aggregate({
    where: { profileId: profile.id },
    _count: true,
    _max: { order: true },
  });
  if (stats._count >= MAX_TESTIMONIALS) {
    return {
      status: "error",
      message: `You can add up to ${MAX_TESTIMONIALS} testimonials.`,
      values: raw,
    };
  }

  // New testimonials go to the end of the list
  const order = (stats._max.order ?? -1) + 1;

  await prisma.testimonial.create({
    data: { profileId: profile.id, order, ...data },
  });

  revalidatePath("/dashboard");
  return { status: "success", message: "Testimonial added." };
}

export async function deleteTestimonial(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.testimonial.deleteMany({
    where: { id, profile: { user: { clerkId: userId } } },
  });

  revalidatePath("/dashboard");
}