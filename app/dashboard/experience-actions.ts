"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

const experienceSchema = z
  .object({
    company: z.string().trim().min(1, "Company is required").max(100, "Max 100 characters"),
    role: z.string().trim().min(1, "Role is required").max(100, "Max 100 characters"),
    location: z.string().trim().max(100, "Max 100 characters"),
    startDate: z.string().regex(MONTH, "Start date is required"),
    endDate: z.string(),
    current: z.boolean(),
    description: z.string().trim().max(2000, "Max 2000 characters"),
  })
  .superRefine((d, ctx) => {
    if (d.current) return;
    if (!MONTH.test(d.endDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Add an end date, or tick 'I currently work here'",
      });
    } else if (MONTH.test(d.startDate) && d.endDate < d.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after the start date",
      });
    }
  });

export type ExperienceField =
  | "company"
  | "role"
  | "location"
  | "startDate"
  | "endDate"
  | "description";

export type ExperienceFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<ExperienceField, string>>;
  values?: Record<ExperienceField, string> & { current: string };
};

// "2023-06" -> Date (first of that month, UTC)
function monthToDate(value: string) {
  return new Date(`${value}-01T00:00:00.000Z`);
}

export async function addExperience(
  _prev: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  const { userId } = await auth();
  if (!userId) return { status: "error", message: "You must be signed in." };

  const raw = {
    company: String(formData.get("company") ?? ""),
    role: String(formData.get("role") ?? ""),
    location: String(formData.get("location") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    description: String(formData.get("description") ?? ""),
    current: formData.get("current") === "on" ? "on" : "",
  };

  const parsed = experienceSchema.safeParse({
    ...raw,
    current: raw.current === "on",
  });

  if (!parsed.success) {
    const errors: Partial<Record<ExperienceField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ExperienceField;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: "error", errors, values: raw };
  }

  // Ownership: find the profile through the logged-in user
  const profile = await prisma.profile.findFirst({
    where: { user: { clerkId: userId } },
    select: { id: true },
  });
  if (!profile) {
    return { status: "error", message: "Profile not found.", values: raw };
  }

  const d = parsed.data;
  await prisma.experience.create({
    data: {
      profileId: profile.id,
      company: d.company,
      role: d.role,
      location: d.location || null,
      startDate: monthToDate(d.startDate),
      endDate: d.current ? null : monthToDate(d.endDate),
      description: d.description || null,
    },
  });

  revalidatePath("/dashboard");
  return { status: "success", message: "Experience added." };
}

export async function deleteExperience(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // The ownership check lives in the query itself
  await prisma.experience.deleteMany({
    where: { id, profile: { user: { clerkId: userId } } },
  });

  revalidatePath("/dashboard");
}