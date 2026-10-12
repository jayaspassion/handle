"use client";

import { useId, useState, useTransition } from "react";
import { FONTS, THEMES, type FontId, type ThemeId } from "@/lib/appearance";
import { saveAppearance, saveOpenToWork } from "./actions";

// Theme and font picker with a live preview. Colors and fonts come from the
// same [data-pf-theme] / [data-pf-font] CSS the public page uses.
export function AppearanceCard({
  theme: savedTheme,
  font: savedFont,
  name,
  headline,
}: {
  theme: ThemeId;
  font: FontId;
  name: string;
  headline: string;
}) {
  const id = useId();
  const [theme, setTheme] = useState(savedTheme);
  const [font, setFont] = useState(savedFont);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty = theme !== savedTheme || font !== savedFont;

  function save() {
    startTransition(async () => {
      const result = await saveAppearance({ theme, font });
      if (result.ok) {
        setSaved(true);
        setError("");
      } else {
        setError(result.message ?? "Could not save.");
      }
    });
  }

  return (
    <div className="card p-5">
      <h2 className="font-serif text-xl">Appearance</h2>
      <p className="mt-1 text-sm text-pf-muted">
        Colors and fonts for your public page. Light or dark follows the mode
        you pick at the top.
      </p>

      {/* Live preview */}
      <div
        aria-hidden="true"
        data-pf-theme={theme}
        data-pf-font={font}
        className="mt-3 rounded-lg border border-pf-border bg-pf-bg p-4 font-sans text-pf-fg"
      >
        <p className="truncate font-serif text-xl">{name || "Your name"}</p>
        <p className="truncate text-sm text-pf-muted">{headline || "Your headline"}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-md bg-pf-solid px-2.5 py-1 text-xs font-medium text-pf-solid-fg">
            View my work
          </span>
          <span className="rounded-md border border-pf-border bg-pf-surface px-2 py-0.5 text-xs">
            Skill
          </span>
          <span className="ml-auto h-2 w-8 rounded-full bg-pf-brand" />
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Color theme</legend>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <label key={t.id} className="cursor-pointer">
              <input
                type="radio"
                name={`${id}-theme`}
                value={t.id}
                checked={theme === t.id}
                onChange={() => {
                  setTheme(t.id);
                  setSaved(false);
                }}
                className="peer sr-only"
              />
              <span className="flex min-h-11 flex-col items-center gap-1 rounded-lg border border-pf-border p-1.5 text-xs peer-checked:border-pf-fg peer-checked:font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pf-brand">
                <span
                  data-pf-theme={t.id}
                  className="flex h-5 w-10 overflow-hidden rounded-full border border-pf-border"
                >
                  <span className="flex-1 bg-pf-bg" />
                  <span className="flex-1 bg-pf-brand" />
                  <span className="flex-1 bg-pf-solid" />
                </span>
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Font</legend>
        <div className="mt-2 grid gap-2">
          {FONTS.map((f) => (
            <label key={f.id} className="cursor-pointer">
              <input
                type="radio"
                name={`${id}-font`}
                value={f.id}
                checked={font === f.id}
                onChange={() => {
                  setFont(f.id);
                  setSaved(false);
                }}
                className="peer sr-only"
              />
              {/* Each name in its own heading font; font-size-adjust evens out
                  how large different fonts look at the same size */}
              <span className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-pf-border px-3 py-1.5 peer-checked:border-pf-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pf-brand [&>svg]:invisible peer-checked:[&>svg]:visible">
                <span
                  data-pf-font={f.id}
                  className="font-serif text-lg leading-tight [font-size-adjust:ex-height_0.5]"
                >
                  {f.label}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={save}
        disabled={!dirty || pending}
        className="btn btn-primary mt-4 w-full"
      >
        {pending ? "Saving..." : "Save appearance"}
      </button>
      <p role="status" className={saved && !dirty ? "msg-success mt-2" : "sr-only"}>
        {saved && !dirty ? "Appearance saved." : ""}
      </p>
      {error && (
        <p role="alert" className="msg-error mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

// "Open to opportunities" badge switch; saves right away
export function OpenToWorkCard({ value }: { value: boolean }) {
  const id = useId();
  const [checked, setChecked] = useState(value);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function toggle(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const result = await saveOpenToWork(next);
      if (result.ok) {
        setError("");
      } else {
        setChecked(!next);
        setError(result.message ?? "Could not save.");
      }
    });
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor={id} className="font-serif text-xl">
            Open to opportunities
          </label>
          <p id={`${id}-hint`} className="mt-1 text-sm text-pf-muted">
            Shows a badge at the top of your public page.
          </p>
        </div>
        {/* Native checkbox (keyboard and screen readers) drawn as a switch */}
        <label className="relative -m-1.5 inline-flex shrink-0 cursor-pointer p-1.5">
          <input
            id={id}
            type="checkbox"
            role="switch"
            checked={checked}
            disabled={pending}
            aria-describedby={`${id}-hint`}
            onChange={(e) => toggle(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-7 w-12 rounded-full bg-pf-border transition-colors peer-checked:bg-pf-solid peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pf-brand peer-disabled:opacity-60 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-pf-surface after:shadow after:transition-transform peer-checked:after:translate-x-5"
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="msg-error mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
