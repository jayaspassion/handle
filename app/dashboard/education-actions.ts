"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

const educationSchema = z
  .object({
    institution: z.string().trim().min(1, "Institution is required").max(150, "Max 150 characters"),
    degree: z.string().trim().min(1, "Degree is required").max(100, "Max 100 characters"),
    fieldOfStudy: z.string().trim().max(100, "Max 100 characters"),
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
        message: "Add an end date, or tick 'I'm currently studying here'",
      });
    } else if (MONTH.test(d.startDate) && d.endDate < d.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after the start date",
      });
    }
  });

export type EducationField =
  | "institution"
  | "degree"
  | "fieldOfStudy"
  | "startDate"
  | "endDate"
  | "description";

export type EducationFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<EducationField, string>>;
  values?: Record<EducationField, string> & { current: string };
};

// "2023-06" -> Date (first of that month, UTC)
function monthToDate(value: string) {
  return new Date(`${value}-01T00:00:00.000Z`);
}

export async function addEducation(
  _prev: EducationFormState,
  formData: FormData,
): Promise<EducationFormState> {
  const { userId } = await auth();
  if (!userId) return { status: "error", message: "You must be signed in." };

  const raw = {
    institution: String(formData.get("institution") ?? ""),
    degree: String(formData.get("degree") ?? ""),
    fieldOfStudy: String(formData.get("fieldOfStudy") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    description: String(formData.get("description") ?? ""),
    current: formData.get("current") === "on" ? "on" : "",
  };

  const parsed = educationSchema.safeParse({
    ...raw,
    current: raw.current === "on",
  });

  if (!parsed.success) {
    const errors: Partial<Record<EducationField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as EducationField;
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
  await prisma.education.create({
    data: {
      profileId: profile.id,
      institution: d.institution,
      degree: d.degree,
      fieldOfStudy: d.fieldOfStudy || null,
      startDate: monthToDate(d.startDate),
      endDate: d.current ? null : monthToDate(d.endDate),
      description: d.description || null,
    },
  });

  revalidatePath("/dashboard");
  return { status: "success", message: "Education added." };
}

export async function deleteEducation(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // The ownership check lives in the query itself
  await prisma.education.deleteMany({
    where: { id, profile: { user: { clerkId: userId } } },
  });

  revalidatePath("/dashboard");
}