// Gemini API over plain fetch (no SDK). Free tier, so we try the main model
// first and fall back to a second one when the first is rate-limited or down.
// Limits per project are on https://aistudio.google.com/rate-limit
// Gemma thinks by default and then takes over a minute, so it is set to minimal.
const MODELS = [
  { id: "gemini-3.5-flash-lite", config: {} },
  { id: "gemma-4-26b-a4b-it", config: { thinkingConfig: { thinkingLevel: "minimal" } } },
];
const API = "https://generativelanguage.googleapis.com/v1beta/models";

export type ChatTurn = { role: "user" | "model"; text: string };

export type AiResult =
  | { ok: true; text: string }
  | { ok: false; reason: "unavailable" | "busy" | "blocked" | "error" };

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
  promptFeedback?: { blockReason?: string };
};

export function aiConfigured() {
  return !!process.env.GEMINI_API_KEY;
}

export async function generateReply(
  system: string,
  turns: ChatTurn[],
): Promise<AiResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, reason: "unavailable" };

  const contents = turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] }));

  let busy = false;
  for (const { id: model, config } of MODELS) {
    let res: Response;
    try {
      res = await fetch(`${API}/${model}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { maxOutputTokens: 2048, temperature: 0.4, ...config },
        }),
        signal: AbortSignal.timeout(20_000),
      });
    } catch (err) {
      console.error(`[chat] ${model} request failed`, err);
      continue;
    }

    // Rate-limited or server trouble: try the next model
    if (res.status === 429 || res.status >= 500) {
      if (res.status === 429) busy = true;
      console.error(`[chat] ${model} returned ${res.status}`);
      continue;
    }
    if (!res.ok) {
      console.error(`[chat] ${model} returned ${res.status}`, await res.text());
      return { ok: false, reason: "error" };
    }

    const data = (await res.json()) as GeminiResponse;
    if (data.promptFeedback?.blockReason) return { ok: false, reason: "blocked" };
    const text = (data.candidates?.[0]?.content?.parts ?? [])
      .filter((p) => !p.thought)
      .map((p) => p.text ?? "")
      .join("")
      .trim();
    if (text) return { ok: true, text };
    console.error(`[chat] ${model} returned no text`);
  }

  return { ok: false, reason: busy ? "busy" : "error" };
}
