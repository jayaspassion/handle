"use client";

import { useActionState, useEffect, useId, useState } from "react";
import {
  saveExperience,
  type ExperienceField,
  type ExperienceFormState,
  type ExperienceValues,
} from "./actions";
import MonthPicker from "../../_components/month-picker";
import AddPanel from "../../_components/add-panel";

type TextField = Exclude<ExperienceField, "startDate" | "endDate">;

const initialState: ExperienceFormState = { status: "idle" };

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
  editId?: string; // set when editing an existing entry
  initial?: ExperienceValues; // values to pre-fill when editing
  onSaved: () => void;
  onCancel: () => void;
};

// Used by both the Add panel and the Edit mode of a list entry
export function ExperienceFormFields({
  editId,
  initial,
  onSaved,
  onCancel,
}: FieldsProps) {
  const [state, formAction, pending] = useActionState(saveExperience, initialState);

  // Unique ids, so several forms can be open on the page at once
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [current, setCurrent] = useState(initial?.current === "on");

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

  // After a failed submit, show what the user typed; otherwise the saved values
  const base = state.values ?? initial;
  const err = state.errors ?? {};

  const field = (name: TextField) => ({
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
        {editId ? "Edit experience" : "New experience"}
      </h3>
      {editId && <input type="hidden" name="id" value={editId} />}

      <div>
        <label htmlFor={fid("company")} className="text-sm font-medium">Company</label>
        <input {...field("company")} />
        <FieldError id={`${fid("company")}-error`} message={err.company} />
      </div>

      <div>
        <label htmlFor={fid("role")} className="text-sm font-medium">Role</label>
        <input {...field("role")} />
        <FieldError id={`${fid("role")}-error`} message={err.role} />
      </div>

      <div>
        <label htmlFor={fid("location")} className="text-sm font-medium">Location (optional)</label>
        <input {...field("location")} />
        <FieldError id={`${fid("location")}-error`} message={err.location} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("startDate")} className="text-sm font-medium">Start date</label>
          <MonthPicker
            id={fid("startDate")}
            name="startDate"
            value={startDate}
            onChange={setStartDate}
            invalid={!!err.startDate}
            describedBy={err.startDate ? `${fid("startDate")}-error` : undefined}
          />
          <FieldError id={`${fid("startDate")}-error`} message={err.startDate} />
        </div>
        <div>
          <label htmlFor={fid("endDate")} className="text-sm font-medium">End date</label>
          <MonthPicker
            id={fid("endDate")}
            name="endDate"
            value={endDate}
            onChange={setEndDate}
            disabled={current}
            invalid={!!err.endDate}
            describedBy={err.endDate ? `${fid("endDate")}-error` : undefined}
          />
          <FieldError id={`${fid("endDate")}-error`} message={err.endDate} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="current"
          checked={current}
          onChange={(e) => setCurrent(e.target.checked)}
        />
        I currently work here
      </label>

      <div>
        <label htmlFor={fid("description")} className="text-sm font-medium">Description (optional)</label>
        <textarea rows={4} {...field("description")} />
        <FieldError id={`${fid("description")}-error`} message={err.description} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary"
        >
          {pending
            ? editId ? "Saving..." : "Adding..."
            : editId ? "Save changes" : "Add experience"}
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

export default function ExperienceForm() {
  return (
    <AddPanel label="Add experience" savedMessage="Experience added.">
      {({ onSaved, onCancel }) => (
        <ExperienceFormFields onSaved={onSaved} onCancel={onCancel} />
      )}
    </AddPanel>
  );
}