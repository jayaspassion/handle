"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isHttpUrl, normalizeUrl } from "@/lib/url";


// "React, TypeScript, react" -> ["React", "TypeScript"]
function parseTags(value: string) {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of value.split(",")) {
    const tag = part.trim();
    const key = tag.toLowerCase();
    if (tag && !seen.has(key)) {
      seen.add(key);
      tags.push(tag);
    }
  }
  return tags;
}

const urlField = z
  .string()
  .max(2048, "Max 2048 characters")
  .refine(isHttpUrl, "Enter a valid web address, like https://example.com");

const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Max 100 characters"),
  description: z.string().trim().max(2000, "Max 2000 characters"),
  liveUrl: urlField,
  repoUrl: urlField,
  coverImageUrl: urlField,
  tags: z
    .array(z.string().max(30, "Each tag must be 30 characters or fewer"))
    .max(10, "Max 10 tags"),
});

export type ProjectField =
  | "title"
  | "description"
  | "tags"
  | "liveUrl"
  | "repoUrl"
  | "coverImageUrl";

export type ProjectValues = Record<ProjectField, string>;

export type ProjectFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<ProjectField, string>>;
  values?: ProjectValues;
};

// Creates a new project, or updates one when the form sends a hidden "id"
export async function saveProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const { userId } = await auth();
  if (!userId) return { status: "error", message: "You must be signed in." };

  const id = String(formData.get("id") ?? "");

  // Exactly what the user typed, so we can show it back if validation fails
  const raw: ProjectValues = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    tags: String(formData.get("tags") ?? ""),
    liveUrl: String(formData.get("liveUrl") ?? ""),
    repoUrl: String(formData.get("repoUrl") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
  };

  const parsed = projectSchema.safeParse({
    title: raw.title,
    description: raw.description,
    tags: parseTags(raw.tags),
    liveUrl: normalizeUrl(raw.liveUrl),
    repoUrl: normalizeUrl(raw.repoUrl),
    coverImageUrl: normalizeUrl(raw.coverImageUrl),
  });

  if (!parsed.success) {
    const errors: Partial<Record<ProjectField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ProjectField;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: "error", errors, values: raw };
  }

  const d = parsed.data;
  const data = {
    title: d.title,
    description: d.description || null,
    tags: d.tags,
    liveUrl: d.liveUrl || null,
    repoUrl: d.repoUrl || null,
    coverImageUrl: d.coverImageUrl || null,
  };

  if (id) {
    // Edit: the ownership check lives in the query itself
    const result = await prisma.project.updateMany({
      where: { id, profile: { user: { clerkId: userId } } },
      data,
    });
    if (result.count === 0) {
      return { status: "error", message: "Project not found.", values: raw };
    }
    revalidatePath("/dashboard");
    return { status: "success", message: "Project updated." };
  }

  // Add: find the profile through the logged-in user
  const profile = await prisma.profile.findFirst({
    where: { user: { clerkId: userId } },
    select: { id: true },
  });
  if (!profile) {
    return { status: "error", message: "Profile not found.", values: raw };
  }

  // New projects go to the end of the list
  const last = await prisma.project.aggregate({
    where: { profileId: profile.id },
    _max: { order: true },
  });
  const order = (last._max.order ?? -1) + 1;

  await prisma.project.create({
    data: { profileId: profile.id, order, ...data },
  });

  revalidatePath("/dashboard");
  return { status: "success", message: "Project added." };
}

export async function deleteProject(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.project.deleteMany({
    where: { id, profile: { user: { clerkId: userId } } },
  });

  revalidatePath("/dashboard");
}