"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { COLOR_MODES } from "@/lib/appearance";

// Saves the signed-in user's light/dark choice to their profile. It is used on
// their next sign-in and as the default for visitors to their public page.
// No revalidatePath: the dashboard already shows the new mode and the public
// page is rendered per request.
export async function saveColorMode(mode: string) {
  const { userId } = await auth();
  if (!userId) return;
  const parsed = z.enum(COLOR_MODES).safeParse(mode);
  if (!parsed.success) return;
  await prisma.profile.updateMany({
    where: { user: { clerkId: userId } },
    data: { colorMode: parsed.data },
  });
}
