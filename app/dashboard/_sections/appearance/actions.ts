"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { FONT_IDS, THEME_IDS } from "@/lib/appearance";

export type AppearanceResult = { ok: boolean; message?: string };

const appearanceSchema = z.object({
  theme: z.enum(THEME_IDS),
  font: z.enum(FONT_IDS),
});

export async function saveAppearance(input: {
  theme: string;
  font: string;
}): Promise<AppearanceResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "You must be signed in." };

  const parsed = appearanceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Choose a theme and a font from the list." };

  try {
    const { count } = await prisma.profile.updateMany({
      where: { user: { clerkId: userId } },
      data: parsed.data,
    });
    if (count === 0) return { ok: false, message: "Profile not found." };
  } catch {
    return { ok: false, message: "Could not save. Please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

async function saveSwitch(
  field: "openToWork" | "chatEnabled",
  value: boolean,
): Promise<AppearanceResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "You must be signed in." };

  const parsed = z.boolean().safeParse(value);
  if (!parsed.success) return { ok: false, message: "Invalid value." };

  try {
    const { count } = await prisma.profile.updateMany({
      where: { user: { clerkId: userId } },
      data: { [field]: parsed.data },
    });
    if (count === 0) return { ok: false, message: "Profile not found." };
  } catch {
    return { ok: false, message: "Could not save. Please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function saveOpenToWork(value: boolean) {
  return saveSwitch("openToWork", value);
}

export async function saveChatEnabled(value: boolean) {
  return saveSwitch("chatEnabled", value);
}
