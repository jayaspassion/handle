"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import {
  checkUsername,
  publishProfile,
  unpublishProfile,
  type PublishState,
  type UsernameCheck,
} from "./actions";

const initialState: PublishState = { status: "idle" };

// Shown to the user and used for the copied link
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const HOST = SITE.replace(/^https?:\/\//, "");

type Props = {
  username: string; // the saved username, or "" if none yet
  isPublished: boolean;
  hasName: boolean;
  hasUploads: boolean; // photo, resume or project images exist
};

function LinkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  );
}

export default function PublishSection({ username, isPublished, hasName, hasUploads }: Props) {
  const [state, formAction, pending] = useActionState(publishProfile, initialState);

  const uid = useId();
  const inputId = `${uid}-username`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;
  const statusId = `${uid}-status`;

  // Live availability check, a moment after the user stops typing
  const [typed, setTyped] = useState(state.values?.username ?? username);
  const [check, setCheck] = useState<{ for: string; result: UsernameCheck } | null>(null);

  useEffect(() => {
    const value = typed.trim();
    if (isPublished || value.length < 3) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const result = await checkUsername(value);
      if (!cancelled) setCheck({ for: value, result });
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [typed, isPublished]);

  const trimmed = typed.trim();
  const live = check && check.for === trimmed ? check.result : null;
  const checking = trimmed.length >= 3 && !live;
  // The server's error only describes the name that was submitted: hide it as
  // soon as the name changes, so it never shows next to "Available"
  const usernameError =
    !pending && trimmed === (state.values?.username ?? "").trim()
      ? state.usernameError
      : undefined;

  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${SITE}/${username}`);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied("idle"), 2500);
  }

  if (isPublished) {
    return (
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-xl">Publication</h2>
          <span className="badge badge-success">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
            Published
          </span>
        </div>
        <p className="mt-1 text-sm text-pf-muted">Your portfolio is live at:</p>

        <a
          href={`/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="input mt-3 flex items-start gap-2 py-2.5 font-medium hover:underline"
        >
          <span className="mt-0.5">
            <LinkIcon />
          </span>
          <span className="min-w-0 break-all">
            {HOST}/{username}
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="btn btn-outline mt-2 w-full"
        >
          {copied === "copied"
            ? "Copied"
            : copied === "failed"
              ? "Copy failed"
              : "Copy link"}
        </button>

        <p className="mt-3 text-xs text-pf-muted">
          To change your username, unpublish first.
        </p>

        <form action={unpublishProfile} className="mt-4">
          <button type="submit" className="btn btn-danger w-full">
            Unpublish portfolio
          </button>
        </form>

        <p role="status" className="sr-only">
          {copied === "copied"
            ? "Link copied."
            : copied === "failed"
              ? "Could not copy the link."
              : state.status === "success"
                ? state.message
                : ""}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-serif text-xl">Publication</h2>
        <span className="badge">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
          Draft
        </span>
      </div>
      <p className="mt-1 text-sm text-pf-muted">
        Your page is hidden. Choose a username to publish it.
      </p>
      {hasUploads && (
        <p className="mt-2 text-xs text-pf-muted">
          Files you uploaded (photo, resume, project images) can still be opened
          by anyone who already has their direct link. Replace or remove them in
          your profile and projects to stop that.
        </p>
      )}

      <label htmlFor={inputId} className="mt-4 block text-sm font-medium">
        Username
      </label>
      <div className="mt-1 flex">
        <span className="flex max-w-[60%] shrink-0 items-center rounded-l-lg border border-r-0 border-pf-border bg-pf-tint px-3 text-sm text-pf-muted">
          <span className="truncate">{HOST}/</span>
        </span>
        <input
          id={inputId}
          name="username"
          defaultValue={state.values?.username ?? username}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(e) => setTyped(e.target.value)}
          aria-invalid={!!usernameError || live?.status === "taken" || live?.status === "invalid"}
          aria-describedby={[hintId, statusId, usernameError ? errorId : null].filter(Boolean).join(" ")}
          className="input min-w-0 rounded-l-none"
        />
      </div>
      <p id={hintId} className="mt-1 text-xs text-pf-muted">
        3 to 30 characters: letters, numbers and hyphens. This becomes your
        public address.
      </p>
      <p
        id={statusId}
        role="status"
        className={
          !live && !checking
            ? "sr-only"
            : `mt-1 text-sm ${
                live?.status === "available"
                  ? "text-pf-success"
                  : live
                    ? "text-pf-danger"
                    : "text-pf-muted"
              }`
        }
      >
        {live ? live.message : checking ? "Checking..." : ""}
      </p>
      {usernameError && (
        <p id={errorId} className="mt-2 text-sm text-pf-danger">
          {usernameError}
        </p>
      )}

      {!hasName && (
        <p className="mt-3 text-sm text-amber-700">
          Add your name in the Profile section before publishing.
        </p>
      )}

      <button
        type="submit"
        disabled={pending || live?.status === "taken" || live?.status === "invalid"}
        className="btn btn-primary mt-4 w-full"
      >
        {pending ? "Publishing..." : "Publish portfolio"}
      </button>
      {state.status === "error" && state.message && (
        <p role="alert" className="msg-error mt-3">
          {state.message}
        </p>
      )}
    </form>
  );
}
