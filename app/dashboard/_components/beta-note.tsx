"use client";

import { useSyncExternalStore } from "react";
import FeedbackLink from "@/app/_components/feedback-link";

const KEY = "handle-beta-note-dismissed";
const EVENT = "handle-beta-note-change";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function isDismissed() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

// One-time welcome note asking for feedback; stays hidden once dismissed.
// The server renders nothing (it can't know), so the note appears after load.
export default function BetaNote() {
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);
  if (dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <div
      role="note"
      className="mt-4 flex items-start gap-3 rounded-lg border border-pf-border bg-pf-tint px-4 py-3 text-sm"
    >
      <p className="flex-1">
        <span className="font-medium">Handle is in beta.</span>{" "}
        Something not working, or an idea?{" "}
        <FeedbackLink
          where="Dashboard"
          className="font-medium text-pf-accent underline underline-offset-4 hover:no-underline"
        >
          Send feedback
        </FeedbackLink>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="-m-2 grid h-10 w-10 shrink-0 place-items-center rounded-md text-pf-muted hover:text-pf-fg"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
