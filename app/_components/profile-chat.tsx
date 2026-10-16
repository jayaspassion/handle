"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { SignInButton } from "@clerk/nextjs";
import { getChatStatus, sendChatMessage, type ChatStatus } from "@/app/_actions/chat";

type Turn = { role: "user" | "model"; text: string };

// Floating "Ask about <name>" button on public pages. The panel answers questions about
// this profile only (app/_actions/chat.ts). Answers are plain text, never HTML.
export default function ProfileChat({ username, name }: { username: string; name: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ChatStatus | null>(null);
  // Only complete question/answer pairs, so the history sent back stays valid
  const [turns, setTurns] = useState<Turn[]>([]);
  const [asking, setAsking] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [pending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const first = name.split(" ")[0] || name;
  const suggestions = [
    `What has ${first} built?`,
    `What are ${first}'s main skills?`,
    `Summarize ${first}'s experience.`,
  ];
  const ready = status?.available === true;
  const outOfQuestions = ready && status.remaining <= 0;

  // Focus the input on open, and the button again on close
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) buttonRef.current?.focus();
    wasOpen.current = open;
  }, [open, ready]);

  // Keep the newest message in view
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [turns, asking, error]);

  function openChat() {
    setOpen(true);
    if (!status) {
      startTransition(async () => {
        setStatus(await getChatStatus(username));
      });
    }
  }

  function ask(text: string) {
    const question = text.trim();
    if (!question || pending || !ready) return;
    setError("");
    setNeedsSignIn(false);
    setDraft("");
    setAsking(question);
    startTransition(async () => {
      const reply = await sendChatMessage({
        username,
        message: question,
        history: turns.slice(-6),
      });
      setAsking("");
      if (reply.ok) {
        setTurns((t) => [...t, { role: "user", text: question }, { role: "model", text: reply.text }]);
      } else {
        setError(reply.message);
        setNeedsSignIn(!!reply.needsSignIn);
        setDraft(question);
      }
      const remaining = reply.remaining;
      if (remaining !== undefined) {
        setStatus((s) => (s?.available ? { ...s, remaining } : s));
      }
    });
  }

  const signIn = (
    <SignInButton>
      <button type="button" className="font-medium text-pf-accent underline underline-offset-4">
        Sign in
      </button>
    </SignInButton>
  );

  return (
    <div className="print:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openChat())}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className="btn btn-primary fixed right-4 bottom-4 z-40 rounded-full shadow-lg"
      >
        <ChatIcon />
        {open ? "Close chat" : `Ask about ${first}`}
      </button>

      {open && (
        <div
          id={`${id}-panel`}
          role="dialog"
          aria-labelledby={`${id}-title`}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className="card fixed inset-0 z-50 flex flex-col p-0 shadow-xl max-sm:rounded-none max-sm:border-0 sm:inset-auto sm:right-4 sm:bottom-20 sm:h-[min(34rem,calc(100dvh-7rem))] sm:w-96"
        >
          <div className="flex items-start justify-between gap-3 border-b border-pf-border p-4">
            <div>
              <h2 id={`${id}-title`} className="font-serif text-lg leading-tight">
                Ask about {first}
              </h2>
              <p className="mt-0.5 text-xs text-pf-muted">
                Answers from this profile. AI can be wrong.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-outline btn-sm"
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4">
            {status?.available === false ? (
              <p className="text-sm text-pf-muted">Chat isn&apos;t available right now.</p>
            ) : (
              <>
                {turns.length === 0 && !asking && (
                  <div>
                    <p className="text-sm text-pf-muted">
                      Ask anything about {first}&apos;s work, skills or experience.
                    </p>
                    <ul className="mt-3 flex flex-col items-start gap-2">
                      {suggestions.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            onClick={() => ask(s)}
                            disabled={!ready || pending || outOfQuestions}
                            className="btn btn-outline btn-sm text-left"
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <ol aria-live="polite" className="space-y-3">
                  {turns.map((t, i) => (
                    <Bubble key={i} role={t.role} text={t.text} />
                  ))}
                  {asking && (
                    <>
                      <Bubble role="user" text={asking} />
                      <Bubble role="model" text="Thinking..." muted />
                    </>
                  )}
                </ol>
                {error && (
                  <p role="alert" className="msg-error mt-3">
                    {error}
                    {needsSignIn && <> {signIn}</>}
                  </p>
                )}
              </>
            )}
          </div>

          {status?.available !== false && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
              }}
              className="border-t border-pf-border p-4"
            >
              <div className="flex gap-2">
                <label htmlFor={`${id}-input`} className="sr-only">
                  Your question
                </label>
                <input
                  ref={inputRef}
                  id={`${id}-input`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={500}
                  autoComplete="off"
                  placeholder={`Ask about ${first}...`}
                  disabled={!ready || outOfQuestions}
                  aria-describedby={`${id}-left`}
                  className="input"
                />
                <button
                  type="submit"
                  disabled={!ready || pending || outOfQuestions || !draft.trim()}
                  className="btn btn-primary"
                >
                  Send
                </button>
              </div>
              <p id={`${id}-left`} className="mt-2 text-xs text-pf-muted">
                {!status
                  ? "Loading..."
                  : ready && (
                      <>
                        {status.remaining} of {status.limit} questions left today.
                        {!status.signedIn && <> {signIn} for more.</>}
                      </>
                    )}
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Bubble({ role, text, muted }: { role: Turn["role"]; text: string; muted?: boolean }) {
  return (
    <li
      className={
        role === "user"
          ? "ml-auto w-fit max-w-[85%] rounded-lg bg-pf-solid px-3 py-2 text-sm whitespace-pre-wrap text-pf-solid-fg"
          : `w-fit max-w-[85%] rounded-lg bg-pf-tint px-3 py-2 text-sm whitespace-pre-wrap ${muted ? "text-pf-muted" : ""}`
      }
    >
      <span className="sr-only">{role === "user" ? "You: " : "AI: "}</span>
      {text}
    </li>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
