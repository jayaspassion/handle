"use client";

import { useActionState, useEffect, useId } from "react";
import {
  saveSkill,
  type SkillField,
  type SkillFormState,
  type SkillValues,
} from "./actions";
import AddPanel from "../../_components/add-panel";

const initialState: SkillFormState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-600">
      {message}
    </p>
  );
}

type FieldsProps = {
  editId?: string; // set when editing an existing skill
  initial?: SkillValues; // values to pre-fill when editing
  categories: string[]; // existing categories, offered as suggestions
  onSaved: () => void;
  onCancel: () => void;
};

// Used by both the Add panel and the Edit mode of a list entry
export function SkillFormFields({
  editId,
  initial,
  categories,
  onSaved,
  onCancel,
}: FieldsProps) {
  const [state, formAction, pending] = useActionState(saveSkill, initialState);

  // Unique ids, so several forms can be open on the page at once
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

  // After a failed submit, show what the user typed; otherwise the saved values
  const base = state.values ?? initial;
  const err = state.errors ?? {};

  const field = (name: SkillField, hintId?: string, extraDescribed?: string) => ({
    id: fid(name),
    name,
    defaultValue: base?.[name] ?? "",
    "aria-invalid": !!err[name],
    "aria-describedby":
      [hintId, extraDescribed, err[name] ? `${fid(name)}-error` : undefined]
        .filter(Boolean)
        .join(" ") || undefined,
    className: inputClass,
  });

  return (
    <form action={formAction} className="space-y-4">
      <h3 className="text-sm font-semibold">
        {editId ? "Edit skill" : "New skills"}
      </h3>
      {editId && <input type="hidden" name="id" value={editId} />}

      <div>
        <label htmlFor={fid("name")} className="text-sm font-medium">
          {editId ? "Skill name" : "Skills"}
        </label>
        <input
          {...field("name", editId ? undefined : `${fid("name")}-hint`)}
          placeholder={editId ? undefined : "React, TypeScript, Node.js"}
        />
        {!editId && (
          <p id={`${fid("name")}-hint`} className="mt-1 text-xs text-gray-600">
            Add several at once, separated by commas.
          </p>
        )}
        <FieldError id={`${fid("name")}-error`} message={err.name} />
      </div>

      <div>
        <label htmlFor={fid("category")} className="text-sm font-medium">
          Category (optional)
        </label>
        <input
          {...field("category", undefined, undefined)}
          list={fid("categories")}
          autoComplete="off"
          placeholder="e.g. Frontend, Design tools, Languages"
        />
        <datalist id={fid("categories")}>
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <FieldError id={`${fid("category")}-error`} message={err.category} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending
            ? editId ? "Saving..." : "Adding..."
            : editId ? "Save changes" : "Add skills"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
        {state.status === "error" && state.message && (
          <p role="alert" className="text-sm text-red-600">{state.message}</p>
        )}
      </div>
    </form>
  );
}

export default function SkillForm({ categories }: { categories: string[] }) {
  return (
    <AddPanel label="Add skills" savedMessage="Skills added.">
      {({ onSaved, onCancel }) => (
        <SkillFormFields
          categories={categories}
          onSaved={onSaved}
          onCancel={onCancel}
        />
      )}
    </AddPanel>
  );
}