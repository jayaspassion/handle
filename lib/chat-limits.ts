import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

// Daily AI chat limits. Days follow Pacific time because that is when the
// Gemini free quota resets. Google's free limit is 500 a day, so "all" stays
// below it; guests get their own share so signed-in users are never locked out.
export const USER_LIMIT = 20;
export const GUEST_LIMIT = 5;
const ALL_GUESTS_LIMIT = 300;
const ALL_LIMIT = 450;

export type ChatVisitor = { key: string; limit: number; guest: boolean };

// Signed-in users are counted by Clerk id. Guests by an HMAC of their IP,
// so the raw IP is never stored. Without the secret, guests can't chat.
export function chatVisitor(clerkId: string | null, ip: string | null): ChatVisitor | null {
  if (clerkId) return { key: `user:${clerkId}`, limit: USER_LIMIT, guest: false };
  const secret = process.env.CHAT_IP_SALT;
  if (!secret || !ip) return null;
  const hash = createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
  return { key: `ip:${hash}`, limit: GUEST_LIMIT, guest: true };
}

function today() {
  // en-CA formats as YYYY-MM-DD
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(
    new Date(),
  );
  return new Date(`${date}T00:00:00Z`);
}

// One atomic insert-or-increment; returns the new count
async function bump(key: string, day: Date, by = 1) {
  const row = await prisma.chatUsage.upsert({
    where: { key_day: { key, day } },
    create: { key, day, count: by },
    update: { count: { increment: by } },
  });
  return row.count;
}

export async function usedToday(visitor: ChatVisitor) {
  const row = await prisma.chatUsage.findUnique({
    where: { key_day: { key: visitor.key, day: today() } },
  });
  return row?.count ?? 0;
}

// Counts first, then checks, so two messages sent at once can't both slip
// under a limit. Returns what the visitor has left after this message.
export async function takeChatQuota(
  visitor: ChatVisitor,
): Promise<{ status: "ok"; remaining: number } | { status: "limit" } | { status: "busy" }> {
  const day = today();

  // Now and then, drop counters older than a week
  if (Math.random() < 0.02) {
    const cutoff = new Date(day.getTime() - 7 * 86_400_000);
    await prisma.chatUsage.deleteMany({ where: { day: { lt: cutoff } } });
  }

  const mine = await bump(visitor.key, day);
  if (mine > visitor.limit) {
    await bump(visitor.key, day, -1);
    return { status: "limit" };
  }

  const all = await bump("all", day);
  const guests = visitor.guest ? await bump("guests", day) : 0;
  if (all > ALL_LIMIT || guests > ALL_GUESTS_LIMIT) {
    await refundChatQuota(visitor);
    return { status: "busy" };
  }
  return { status: "ok", remaining: visitor.limit - mine };
}

// Gives the message back when the AI could not answer
export async function refundChatQuota(visitor: ChatVisitor) {
  const day = today();
  await bump(visitor.key, day, -1);
  await bump("all", day, -1);
  if (visitor.guest) await bump("guests", day, -1);
}
