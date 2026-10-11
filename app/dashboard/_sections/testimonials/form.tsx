"use client";

import { useActionState, useEffect, useId } from "react";
import {
  saveTestimonial,
  type TestimonialField,
  type TestimonialFormState,
  type TestimonialValues,
} from "./actions";
import AddPanel from "../../_components/add-panel";

const initialState: TestimonialFormState = { status: "idle" };

const inputClass =
  "input mt-1";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}

type FieldsProps = {
  editId?: string; // set when editing an existing testimonial
  initial?: TestimonialValues; // values to pre-fill when editing
  onSaved: () => void;
  onCancel: () => void;
};

// Used by both the Add panel and the Edit mode of a list entry
export function TestimonialFormFields({
  editId,
  initial,
  onSaved,
  onCancel,
}: FieldsProps) {
  const [state, formAction, pending] = useActionState(
    saveTestimonial,
    initialState,
  );

  // Unique ids, so several forms can be open on the page at once
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

  // After a failed submit, show what the user typed; otherwise the saved values
  const base = state.values ?? initial;
  const err = state.errors ?? {};

  const field = (name: TestimonialField, hintId?: string) => ({
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

  return (
    <form action={formAction} className="space-y-4">
      <h3 className="text-sm font-semibold">
        {editId ? "Edit testimonial" : "New testimonial"}
      </h3>
      {editId && <input type="hidden" name="id" value={editId} />}

      <p className="text-xs text-pf-muted">
        Testimonials are entered by you and are not verified. Only add quotes
        you have permission to share.
      </p>

      <div>
        <label htmlFor={fid("quote")} className="text-sm font-medium">Quote</label>
        <textarea rows={4} {...field("quote")} />
        <FieldError id={`${fid("quote")}-error`} message={err.quote} />
      </div>

      <div>
        <label htmlFor={fid("authorName")} className="text-sm font-medium">Author name</label>
        <input {...field("authorName")} />
        <FieldError id={`${fid("authorName")}-error`} message={err.authorName} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("authorRole")} className="text-sm font-medium">Author role (optional)</label>
          <input {...field("authorRole")} />
          <FieldError id={`${fid("authorRole")}-error`} message={err.authorRole} />
        </div>
        <div>
          <label htmlFor={fid("authorCompany")} className="text-sm font-medium">Author company (optional)</label>
          <input {...field("authorCompany")} />
          <FieldError id={`${fid("authorCompany")}-error`} message={err.authorCompany} />
        </div>
      </div>

      <div>
        <label htmlFor={fid("authorAvatarUrl")} className="text-sm font-medium">Author photo link (optional)</label>
        <input
          {...field("authorAvatarUrl")}
          type="text"
          inputMode="url"
          autoComplete="off"
          placeholder="https://..."
        />
        <FieldError id={`${fid("authorAvatarUrl")}-error`} message={err.authorAvatarUrl} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary"
        >
          {pending
            ? editId ? "Saving..." : "Adding..."
            : editId ? "Save changes" : "Add testimonial"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="btn btn-outline"
        >
          Cancel
        </button>
        {state.status === "error" && state.message && (
          <p role="alert" className="msg-error">{state.message}</p>
        )}
      </div>
    </form>
  );
}

export default function TestimonialForm() {
  return (
    <AddPanel label="Add testimonial" savedMessage="Testimonial added.">
      {({ onSaved, onCancel }) => (
        <TestimonialFormFields onSaved={onSaved} onCancel={onCancel} />
      )}
    </AddPanel>
  );
}