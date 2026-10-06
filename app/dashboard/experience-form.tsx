"use client";

import { useActionState, useEffect, useState } from "react";
import {
  addExperience,
  type ExperienceFormState,
  type ExperienceField,
} from "./experience-actions";
import MonthPicker from "./month-picker";
import AddPanel from "./add-panel";

type TextField = Exclude<ExperienceField, "startDate" | "endDate">;

const initialState: ExperienceFormState = { status: "idle" };

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

function ExperienceFormFields({
  onSaved,
  onCancel,
}: {
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(addExperience, initialState);

  // The dates and checkbox are controlled so the picker and checkbox can work together
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);

  // When the save succeeds, tell the panel to close. The form unmounts,
  // so the next time it opens everything starts fresh.
  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

  const v = state.values;
  const err = state.errors ?? {};

  const field = (name: TextField) => ({
    id: name,
    name,
    defaultValue: v?.[name] ?? "",
    "aria-invalid": !!err[name],
    "aria-describedby": err[name] ? `${name}-error` : undefined,
    className: inputClass,
  });

  return (
    <form action={formAction} className="space-y-4">
      <h3 className="text-sm font-semibold">New experience</h3>

      <div>
        <label htmlFor="company" className="text-sm font-medium">Company</label>
        <input {...field("company")} />
        <FieldError id="company-error" message={err.company} />
      </div>

      <div>
        <label htmlFor="role" className="text-sm font-medium">Role</label>
        <input {...field("role")} />
        <FieldError id="role-error" message={err.role} />
      </div>

      <div>
        <label htmlFor="location" className="text-sm font-medium">Location (optional)</label>
        <input {...field("location")} />
        <FieldError id="location-error" message={err.location} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="text-sm font-medium">Start date</label>
          <MonthPicker
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={setStartDate}
            invalid={!!err.startDate}
            describedBy={err.startDate ? "startDate-error" : undefined}
          />
          <FieldError id="startDate-error" message={err.startDate} />
        </div>
        <div>
          <label htmlFor="endDate" className="text-sm font-medium">End date</label>
          <MonthPicker
            id="endDate"
            name="endDate"
            value={endDate}
            onChange={setEndDate}
            disabled={current}
            invalid={!!err.endDate}
            describedBy={err.endDate ? "endDate-error" : undefined}
          />
          <FieldError id="endDate-error" message={err.endDate} />
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
        <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
        <textarea rows={4} {...field("description")} />
        <FieldError id="description-error" message={err.description} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Adding..." : "Add experience"}
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

export default function ExperienceForm() {
  return (
    <AddPanel label="Add experience" savedMessage="Experience added.">
      {({ onSaved, onCancel }) => (
        <ExperienceFormFields onSaved={onSaved} onCancel={onCancel} />
      )}
    </AddPanel>
  );
}