"use server";

import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { z } from "zod";
import { getPublishedProfile } from "@/lib/public-profile";
import { aiConfigured, generateReply } from "@/lib/ai";
import { chatSystemPrompt } from "@/lib/chat-prompt";
import {
  chatVisitor,
  refundChatQuota,
  takeChatQuota,
  usedToday,
} from "@/lib/chat-limits";

// AI chat on public pages. Anyone can ask; guests are limited per IP,
// signed-in users per account (lib/chat-limits.ts). Nothing is stored
// except the daily counters.

export type ChatStatus =
  | { available: false }
  | { available: true; signedIn: boolean; remaining: number; limit: number };

export type ChatReply =
  | { ok: true; text: string; remaining: number }
  | { ok: false; message: string; needsSignIn?: boolean; remaining?: number };

const UNAVAILABLE = "Chat is not available on this page right now.";

const usernameSchema = z.string().trim().min(1).max(40);
const messageSchema = z.object({
  username: usernameSchema,
  message: z.string().trim().min(1).max(500),
  // Earlier turns of this chat, oldest first; only the last few are sent
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().trim().min(1).max(2000),
      }),
    )
    .max(6)
    // Question/answer pairs: user, model, user, model...
    .refine((turns) => turns.every((t, i) => t.role === (i % 2 ? "model" : "user")))
    .refine((turns) => turns.length % 2 === 0),
});

async function visitorFromRequest() {
  const { userId } = await auth();
  const h = await headers();
  // Vercel sets these to the real client IP
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  return chatVisitor(userId, ip);
}

async function chatProfile(username: string) {
  if (!aiConfigured()) return null;
  const profile = await getPublishedProfile(username);
  return profile?.chatEnabled ? profile : null;
}

export async function getChatStatus(username: string): Promise<ChatStatus> {
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success || !(await chatProfile(parsed.data))) return { available: false };

  const visitor = await visitorFromRequest();
  if (!visitor) return { available: false };
  const used = await usedToday(visitor);
  return {
    available: true,
    signedIn: !visitor.guest,
    remaining: Math.max(0, visitor.limit - used),
    limit: visitor.limit,
  };
}

export async function sendChatMessage(input: {
  username: string;
  message: string;
  history: { role: "user" | "model"; text: string }[];
}): Promise<ChatReply> {
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please keep your question under 500 characters." };
  }
  const { username, message, history } = parsed.data;

  const profile = await chatProfile(username);
  if (!profile) return { ok: false, message: UNAVAILABLE };
  const visitor = await visitorFromRequest();
  if (!visitor) return { ok: false, message: UNAVAILABLE };

  const quota = await takeChatQuota(visitor);
  if (quota.status === "limit") {
    return visitor.guest
      ? {
          ok: false,
          message: `You've used your ${visitor.limit} free questions for today. Sign in to ask more.`,
          needsSignIn: true,
          remaining: 0,
        }
      : {
          ok: false,
          message: `You've reached today's limit of ${visitor.limit} questions. Please come back tomorrow.`,
          remaining: 0,
        };
  }
  if (quota.status === "busy") {
    return { ok: false, message: "Chat is very busy today. Please try again tomorrow." };
  }

  const reply = await generateReply(chatSystemPrompt(profile), [
    ...history,
    { role: "user", text: message },
  ]);
  if (!reply.ok) {
    await refundChatQuota(visitor);
    const text =
      reply.reason === "busy"
        ? "Chat is busy right now. Please try again in a minute."
        : reply.reason === "blocked"
          ? "I can't answer that one. Try asking about this profile."
          : "Something went wrong. Please try again.";
    return { ok: false, message: text, remaining: quota.remaining + 1 };
  }

  return { ok: true, text: reply.text, remaining: quota.remaining };
}
