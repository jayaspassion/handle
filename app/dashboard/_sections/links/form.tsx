"use client";

import { useActionState, useEffect, useId } from "react";
import {
  saveLink,
  type LinkField,
  type LinkFormState,
  type LinkValues,
} from "./actions";
import AddPanel from "../../_components/add-panel";

const initialState: LinkFormState = { status: "idle" };

const SUGGESTED_LABELS = [
  "LinkedIn",
  "GitHub",
  "Portfolio",
  "Website",
  "X (Twitter)",
  "Behance",
  "Dribbble",
  "YouTube",
  "Medium",
];

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
  editId?: string; // set when editing an existing link
  initial?: LinkValues; // values to pre-fill when editing
  onSaved: () => void;
  onCancel: () => void;
};

// Used by both the Add panel and the Edit mode of a list entry
export function LinkFormFields({
  editId,
  initial,
  onSaved,
  onCancel,
}: FieldsProps) {
  const [state, formAction, pending] = useActionState(saveLink, initialState);

  // Unique ids, so several forms can be open on the page at once
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

  // After a failed submit, show what the user typed; otherwise the saved values
  const base = state.values ?? initial;
  const err = state.errors ?? {};

  const field = (name: LinkField) => ({
    id: fid(name),
    name,
    defaultValue: base?.[name] ?? "",
    "aria-invalid": !!err[name],
    "aria-describedby": err[name] ? `${fid(name)}-error` : undefined,
    className: inputClass,
  });

  return (
    <form action={formAction} className="space-y-4">
      <h3 className="text-sm font-semibold">
        {editId ? "Edit link" : "New link"}
      </h3>
      {editId && <input type="hidden" name="id" value={editId} />}

      <div>
        <label htmlFor={fid("label")} className="text-sm font-medium">Label</label>
        <input
          {...field("label")}
          list={fid("labels")}
          autoComplete="off"
          placeholder="e.g. LinkedIn"
        />
        <datalist id={fid("labels")}>
          {SUGGESTED_LABELS.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
        <FieldError id={`${fid("label")}-error`} message={err.label} />
      </div>

      <div>
        <label htmlFor={fid("url")} className="text-sm font-medium">Link</label>
        <input
          {...field("url")}
          type="text"
          inputMode="url"
          autoComplete="off"
          placeholder="https://linkedin.com/in/you"
        />
        <FieldError id={`${fid("url")}-error`} message={err.url} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending
            ? editId ? "Saving..." : "Adding..."
            : editId ? "Save changes" : "Add link"}
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

export default function LinkForm() {
  return (
    <AddPanel label="Add link" savedMessage="Link added.">
      {({ onSaved, onCancel }) => (
        <LinkFormFields onSaved={onSaved} onCancel={onCancel} />
      )}
    </AddPanel>
  );
}