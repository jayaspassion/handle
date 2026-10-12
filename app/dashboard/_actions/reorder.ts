"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SECTION_KEYS } from "@/lib/sections";

const MODELS = ["link", "project", "certification", "testimonial"] as const;
export type ReorderModel = (typeof MODELS)[number];
export type ReorderResult = { ok: boolean; message?: string };

type Delegate = {
  count(args: { where: object }): Promise<number>;
  updateMany(args: { where: object; data: { order: number } }): Promise<unknown>;
};

// Saves a new order for one list. Every id must belong to the signed-in user.
export async function reorderItems(
  model: ReorderModel,
  ids: string[],
): Promise<ReorderResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "You must be signed in." };

  if (!MODELS.includes(model)) return { ok: false, message: "Unknown list." };
  if (
    !Array.isArray(ids) ||
    ids.length < 2 ||
    ids.length > 200 ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => typeof id !== "string" || id.length === 0 || id.length > 64)
  ) {
    return { ok: false, message: "Invalid order." };
  }

  const owner = { profile: { user: { clerkId: userId } } };

  try {
    const done = await prisma.$transaction(async (tx) => {
      const delegate = tx[model] as unknown as Delegate;
      const owned = await delegate.count({ where: { id: { in: ids }, ...owner } });
      if (owned !== ids.length) return false;
      for (let i = 0; i < ids.length; i++) {
        await delegate.updateMany({
          where: { id: ids[i], ...owner },
          data: { order: i },
        });
      }
      return true;
    });
    if (!done) {
      return {
        ok: false,
        message: "Some items could not be found. Refresh the page and try again.",
      };
    }
  } catch {
    return { ok: false, message: "Could not save the order. Please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

// Saves the order of the sections on the public page.
export async function saveSectionOrder(order: string[]): Promise<ReorderResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "You must be signed in." };

  const valid =
    Array.isArray(order) &&
    order.length === SECTION_KEYS.length &&
    new Set(order).size === order.length &&
    order.every((key) => (SECTION_KEYS as readonly string[]).includes(key));
  if (!valid) return { ok: false, message: "Invalid order." };

  try {
    await prisma.profile.updateMany({
      where: { user: { clerkId: userId } },
      data: { sectionOrder: order },
    });
  } catch {
    return { ok: false, message: "Could not save the order. Please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
