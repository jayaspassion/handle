"use client";

import { useActionState, useId, useRef, useState } from "react";
import { deleteSkill, saveSkill, type SkillFormState } from "./actions";

type Item = { id: string; name: string; category: string | null };

const initialState: SkillFormState = { status: "idle" };

export default function SkillsSection({
  items,
  categories,
}: {
  items: Item[];
  categories: string[];
}) {
  const [state, formAction, pending] = useActionState(saveSkill, initialState);
  // Hide the "added" message as soon as the user types again
  const [touchedState, setTouchedState] = useState<SkillFormState | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);

  const uid = useId();
  const nameId = `${uid}-name`;
  const categoryId = `${uid}-category`;
  const hintId = `${uid}-hint`;
  const err = state.errors ?? {};
  const showSaved = state.status === "success" && touchedState !== state;

  // Group by category (case-insensitive), uncategorized last
  const groups = new Map<string, { label: string; items: Item[] }>();
  for (const it of items) {
    const label = it.category?.trim() ?? "";
    const key = label.toLowerCase();
    const group = groups.get(key);
    if (group) group.items.push(it);
    else groups.set(key, { label, items: [it] });
  }
  const ordered = [...groups.values()].sort(
    (a, b) => Number(a.label === "") - Number(b.label === ""),
  );

  // "+ Add" next to a category fills it in and moves to the skills box
  function addTo(category: string) {
    if (categoryRef.current) categoryRef.current.value = category;
    nameRef.current?.focus();
  }

  return (
    <div>
      {ordered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-pf-border p-4 text-center text-sm text-pf-muted">
          No skills added yet.
        </p>
      ) : (
        <div className="space-y-4">
          {ordered.map((group) => (
            <div key={group.label.toLowerCase() || "other"}>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium">{group.label || "Other"}</h3>
                {group.label && (
                  <button
                    type="button"
                    onClick={() => addTo(group.label)}
                    aria-label={`Add a skill to ${group.label}`}
                    className="text-xs text-pf-accent hover:underline"
                  >
                    + Add
                  </button>
                )}
              </div>
              <ul
                aria-label={`${group.label || "Other"} skills`}
                className="mt-2 flex flex-wrap gap-2"
              >
                {group.items.map((it) => (
                  <li key={it.id} className="chip gap-1 py-0.5 pl-3 pr-1">
                    {it.name}
                    <form action={deleteSkill} className="contents">
                      <input type="hidden" name="id" value={it.id} />
                      <button
                        type="submit"
                        aria-label={`Remove ${it.name}`}
                        className="grid h-6 w-6 place-items-center rounded-full text-pf-muted hover:bg-pf-tint hover:text-pf-danger"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <form
        action={formAction}
        onInput={() => setTouchedState(state)}
        className="mt-4 rounded-lg border border-pf-border bg-pf-bg p-4"
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_auto]">
          <div>
            <label htmlFor={nameId} className="text-sm font-medium">
              Add skills
            </label>
            <input
              ref={nameRef}
              id={nameId}
              name="name"
              defaultValue={state.values?.name ?? ""}
              placeholder="React, TypeScript, Node.js"
              autoComplete="off"
              aria-invalid={!!err.name}
              aria-describedby={hintId}
              className="input mt-1"
            />
            {err.name && <p className="field-error">{err.name}</p>}
          </div>
          <div>
            <label htmlFor={categoryId} className="text-sm font-medium">
              Category (optional)
            </label>
            <input
              ref={categoryRef}
              id={categoryId}
              name="category"
              defaultValue={state.values?.category ?? ""}
              list={`${uid}-categories`}
              placeholder="e.g. Frontend"
              autoComplete="off"
              aria-invalid={!!err.category}
              aria-describedby={hintId}
              className="input mt-1"
            />
            <datalist id={`${uid}-categories`}>
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {err.category && (
              <p className="field-error">{err.category}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary sm:mt-6"
          >
            {pending ? "Adding..." : "Add"}
          </button>
        </div>
        <p id={hintId} className="mt-2 text-xs text-pf-muted">
          Separate several skills with commas. Pick an existing category to add
          to it, or type a new one.
        </p>
        <p role="status" className={showSaved ? "msg-success mt-2" : "sr-only"}>
          {showSaved ? "Skills added." : ""}
        </p>
        {state.status === "error" && state.message && (
          <p role="alert" className="msg-error mt-2">
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
