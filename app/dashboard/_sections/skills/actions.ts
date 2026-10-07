"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MAX_SKILLS = 50;

const categorySchema = z.string().trim().max(50, "Max 50 characters");

// Adding: a list of names from one comma-separated box
const addSchema = z.object({
  names: z
    .array(z.string().max(50, "Each skill must be 50 characters or fewer"))
    .min(1, "Enter at least one skill")
    .max(20, "Add up to 20 skills at a time"),
  category: categorySchema,
});

// Editing: exactly one name
const editSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required")
    .max(50, "Max 50 characters")
    .refine((v) => !v.includes(","), "Edit one skill at a time (no commas)"),
  category: categorySchema,
});

export type SkillField = "name" | "category";
export type SkillValues = Record<SkillField, string>;

export type SkillFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<SkillField, string>>;
  values?: SkillValues;
};

// "React, TypeScript, react" -> ["React", "TypeScript"]
function parseNames(value: string) {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of value.split(",")) {
    const name = part.trim();
    const key = name.toLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      names.push(name);
    }
  }
  return names;
}

function toErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Partial<Record<SkillField, string>> = {};
  for (const issue of issues) {
    const key: SkillField = issue.path[0] === "category" ? "category" : "name";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

async function editSkill(
  userId: string,
  id: string,
  raw: SkillValues,
): Promise<SkillFormState> {
  const parsed = editSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", errors: toErrors(parsed.error.issues), values: raw };
  }

  // Ownership: this finds the skill only if it belongs to the logged-in user
  const current = await prisma.skill.findFirst({
    where: { id, profile: { user: { clerkId: userId } } },
    select: { profileId: true },
  });
  if (!current) {
    return { status: "error", message: "Skill not found.", values: raw };
  }

  // Don't allow renaming to a skill the user already has
  const others = await prisma.skill.findMany({
    where: { profileId: current.profileId, NOT: { id } },
    select: { name: true },
  });
  const wanted = parsed.data.name.toLowerCase();
  if (others.some((s) => s.name.toLowerCase() === wanted)) {
    return {
      status: "error",
      errors: { name: "You already have this skill." },
      values: raw,
    };
  }

  await prisma.skill.updateMany({
    where: { id, profile: { user: { clerkId: userId } } },
    data: {
      name: parsed.data.name,
      category: parsed.data.category || null,
    },
  });

  revalidatePath("/dashboard");
  return { status: "success", message: "Skill updated." };
}

async function addSkills(
  userId: string,
  raw: SkillValues,
): Promise<SkillFormState> {
  const parsed = addSchema.safeParse({
    names: parseNames(raw.name),
    category: raw.category,
  });
  if (!parsed.success) {
    return { status: "error", errors: toErrors(parsed.error.issues), values: raw };
  }

  const profile = await prisma.profile.findFirst({
    where: { user: { clerkId: userId } },
    select: { id: true },
  });
  if (!profile) {
    return { status: "error", message: "Profile not found.", values: raw };
  }

  const existing = await prisma.skill.findMany({
    where: { profileId: profile.id },
    select: { name: true, order: true },
  });

  // Skip skills the user already has
  const have = new Set(existing.map((s) => s.name.toLowerCase()));
  const fresh = parsed.data.names.filter((n) => !have.has(n.toLowerCase()));

  if (fresh.length === 0) {
    return {
      status: "error",
      errors: { name: "You already have these skills." },
      values: raw,
    };
  }
  if (existing.length + fresh.length > MAX_SKILLS) {
    return {
      status: "error",
      errors: { name: `You can have up to ${MAX_SKILLS} skills.` },
      values: raw,
    };
  }

  // New skills go to the end of the list
  const start = existing.reduce((max, s) => Math.max(max, s.order), -1) + 1;

  await prisma.skill.createMany({
    data: fresh.map((name, i) => ({
      profileId: profile.id,
      name,
      category: parsed.data.category || null,
      order: start + i,
    })),
  });

  revalidatePath("/dashboard");
  return { status: "success", message: "Skills added." };
}

// Adds one or more skills, or edits one when the form sends a hidden "id"
export async function saveSkill(
  _prev: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const { userId } = await auth();
  if (!userId) return { status: "error", message: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  const raw: SkillValues = {
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? ""),
  };

  return id ? editSkill(userId, id, raw) : addSkills(userId, raw);
}

export async function deleteSkill(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.skill.deleteMany({
    where: { id, profile: { user: { clerkId: userId } } },
  });

  revalidatePath("/dashboard");
}