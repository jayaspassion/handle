"use client";

import { useActionState, useEffect, useId } from "react";
import {
  saveProject,
  type ProjectField,
  type ProjectFormState,
  type ProjectValues,
} from "./actions";
import AddPanel from "../../_components/add-panel";

const initialState: ProjectFormState = { status: "idle" };

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
  editId?: string; // set when editing an existing project
  initial?: ProjectValues; // values to pre-fill when editing
  onSaved: () => void;
  onCancel: () => void;
};

// Used by both the Add panel and the Edit mode of a list entry
export function ProjectFormFields({
  editId,
  initial,
  onSaved,
  onCancel,
}: FieldsProps) {
  const [state, formAction, pending] = useActionState(saveProject, initialState);

  // Unique ids, so several forms can be open on the page at once
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

  // After a failed submit, show what the user typed; otherwise the saved values
  const base = state.values ?? initial;
  const err = state.errors ?? {};

  const field = (name: ProjectField, hintId?: string) => ({
    id: fid(name),
    name,
    defaultValue: base?.[name] ?? "",
    "aria-invalid": !!err[name],
    "aria-describedby":
      [hintId, err[name] ? `${fid(name)}-error` : undefined]
        .filter(Boolean)
        .join(" ") || undefined,
    className: inputClass,
  });

  const urlProps = {
    type: "text" as const,
    inputMode: "url" as const,
    autoComplete: "off",
  };

  return (
    <form action={formAction} className="space-y-4">
      <h3 className="text-sm font-semibold">
        {editId ? "Edit project" : "New project"}
      </h3>
      {editId && <input type="hidden" name="id" value={editId} />}

      <div>
        <label htmlFor={fid("title")} className="text-sm font-medium">Title</label>
        <input {...field("title")} />
        <FieldError id={`${fid("title")}-error`} message={err.title} />
      </div>

      <div>
        <label htmlFor={fid("description")} className="text-sm font-medium">Description (optional)</label>
        <textarea rows={4} {...field("description")} />
        <FieldError id={`${fid("description")}-error`} message={err.description} />
      </div>

      <div>
        <label htmlFor={fid("tags")} className="text-sm font-medium">Tags (optional)</label>
        <input
          {...field("tags", `${fid("tags")}-hint`)}
          placeholder="React, TypeScript, Postgres"
        />
        <p id={`${fid("tags")}-hint`} className="mt-1 text-xs text-gray-600">
          Separate with commas. Up to 10 tags. Use tools, skills or topics, whatever fits your work.
        </p>
        <FieldError id={`${fid("tags")}-error`} message={err.tags} />
      </div>

      <div>
        <label htmlFor={fid("liveUrl")} className="text-sm font-medium">Live link (optional)</label>
        <input {...field("liveUrl")} {...urlProps} placeholder="https://my-project.com" />
        <FieldError id={`${fid("liveUrl")}-error`} message={err.liveUrl} />
      </div>

      <div>
        <label htmlFor={fid("repoUrl")} className="text-sm font-medium">Repository or source link (optional)</label>
        <input {...field("repoUrl")} {...urlProps} placeholder="https://github.com/you/project" />
        <FieldError id={`${fid("repoUrl")}-error`} message={err.repoUrl} />
      </div>

      <div>
        <label htmlFor={fid("coverImageUrl")} className="text-sm font-medium">Cover image link (optional)</label>
        <input {...field("coverImageUrl")} {...urlProps} placeholder="https://..." />
        <FieldError id={`${fid("coverImageUrl")}-error`} message={err.coverImageUrl} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending
            ? editId ? "Saving..." : "Adding..."
            : editId ? "Save changes" : "Add project"}
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

export default function ProjectForm() {
  return (
    <AddPanel label="Add project" savedMessage="Project added.">
      {({ onSaved, onCancel }) => (
        <ProjectFormFields onSaved={onSaved} onCancel={onCancel} />
      )}
    </AddPanel>
  );
}