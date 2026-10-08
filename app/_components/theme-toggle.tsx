"use client";

import { useSyncExternalStore } from "react";

type Mode = "system" | "light" | "dark";

const KEY = "handle-theme";
const EVENT = "handle-theme-change";
const OPTIONS: { value: Mode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
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
      className="inline-flex rounded-full border border-pf-border p-0.5 text-sm"
    >
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          onClick={() => choose(value)}
          className={`min-h-9 rounded-full px-3 ${
            mode === value
              ? "bg-pf-solid text-pf-solid-fg"
              : "text-pf-muted hover:text-pf-fg"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}