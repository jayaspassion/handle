"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isHttpUrl, normalizeUrl } from "@/lib/url";

const MAX_CERTIFICATIONS = 50;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

const optionalMonth = z
  .string()
  .refine((v) => v === "" || MONTH.test(v), "Choose a valid month");

const certificationSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(150, "Max 150 characters"),
    issuer: z.string().trim().min(1, "Issuer is required").max(100, "Max 100 characters"),
    issueDate: optionalMonth,
    expiryDate: optionalMonth,
    credentialUrl: z
      .string()
      .max(2048, "Max 2048 characters")
      .refine(isHttpUrl, "Enter a valid web address, like https://example.com"),
  })
  .superRefine((d, ctx) => {
    if (d.issueDate && d.expiryDate && d.expiryDate < d.issueDate) {
      ctx.addIssue({
        code: "custom",
        path: ["expiryDate"],
        message: "Expiry must be after the issue date",
      });
    }
  });

export type CertificationField =
  | "name"
  | "issuer"
  | "issueDate"
  | "expiryDate"
  | "credentialUrl";

export type CertificationValues = Record<CertificationField, string>;

export type CertificationFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<CertificationField, string>>;
  values?: CertificationValues;
};

// "2023-06" -> Date (first of that month, UTC)
function monthToDate(value: string) {
  return new Date(`${value}-01T00:00:00.000Z`);
}

// Creates a new certification, or updates one when the form sends a hidden "id"
export async function saveCertification(
  _prev: CertificationFormState,
  formData: FormData,
): Promise<CertificationFormState> {
  const { userId } = await auth();
  if (!userId) return { status: "error", message: "You must be signed in." };

  const id = String(formData.get("id") ?? "");

  const raw: CertificationValues = {
    name: String(formData.get("name") ?? ""),
    issuer: String(formData.get("issuer") ?? ""),
    issueDate: String(formData.get("issueDate") ?? ""),
    expiryDate: String(formData.get("expiryDate") ?? ""),
    credentialUrl: String(formData.get("credentialUrl") ?? ""),
  };

  const parsed = certificationSchema.safeParse({
    ...raw,
    credentialUrl: normalizeUrl(raw.credentialUrl),
  });

  if (!parsed.success) {
    const errors: Partial<Record<CertificationField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as CertificationField;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: "error", errors, values: raw };
  }

  const d = parsed.data;
  const data = {
    name: d.name,
    issuer: d.issuer,
    issueDate: d.issueDate ? monthToDate(d.issueDate) : null,
    expiryDate: d.expiryDate ? monthToDate(d.expiryDate) : null,
    credentialUrl: d.credentialUrl || null,
  };

  if (id) {
    // Edit: the ownership check lives in the query itself
    const result = await prisma.certification.updateMany({
      where: { id, profile: { user: { clerkId: userId } } },
      data,
    });
    if (result.count === 0) {
      return { status: "error", message: "Certification not found.", values: raw };
    }
    revalidatePath("/dashboard");
    return { status: "success", message: "Certification updated." };
  }

  // Add: find the profile through the logged-in user
  const profile = await prisma.profile.findFirst({
    where: { user: { clerkId: userId } },
    select: { id: true },
  });
  if (!profile) {
    return { status: "error", message: "Profile not found.", values: raw };
  }

  const stats = await prisma.certification.aggregate({
    where: { profileId: profile.id },
    _count: true,
    _max: { order: true },
  });
  if (stats._count >= MAX_CERTIFICATIONS) {
    return {
      status: "error",
      message: `You can add up to ${MAX_CERTIFICATIONS} certifications.`,
      values: raw,
    };
  }

  // New certifications go to the end of the list
  const order = (stats._max.order ?? -1) + 1;

  await prisma.certification.create({
    data: { profileId: profile.id, order, ...data },
  });

  revalidatePath("/dashboard");
  return { status: "success", message: "Certification added." };
}

export async function deleteCertification(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.certification.deleteMany({
    where: { id, profile: { user: { clerkId: userId } } },
  });

  revalidatePath("/dashboard");
}