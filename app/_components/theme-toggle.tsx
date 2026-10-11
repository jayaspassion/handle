"use client";

import { useSyncExternalStore } from "react";

type Mode = "system" | "light" | "dark";

const KEY = "handle-theme";
const EVENT = "handle-theme-change";
const OPTIONS: { value: Mode; label: string }[] = [
  { value: "system", label: "System theme" },
  { value: "light", label: "Light theme" },
  { value: "dark", label: "Dark theme" },
];

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function getSnapshot(): Mode {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

const getServerSnapshot = (): Mode => "system";

function Icon({ mode }: { mode: Mode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {mode === "light" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )}
      {mode === "dark" && <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />}
      {mode === "system" && (
        <>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </>
      )}
    </svg>
  );
}

export default function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function choose(next: Mode) {
    const root = document.documentElement;
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
    try {
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex rounded-lg border border-pf-border p-0.5"
    >
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          aria-label={label}
          title={label}
          onClick={() => choose(value)}
          className={`grid h-9 w-9 place-items-center rounded-md ${
            mode === value
              ? "bg-pf-solid text-pf-solid-fg"
              : "text-pf-muted hover:text-pf-fg"
          }`}
        >
          <Icon mode={value} />
        </button>
      ))}
    </div>
  );
}
