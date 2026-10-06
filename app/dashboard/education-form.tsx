"use client";

import { useActionState, useEffect, useState } from "react";
import {
  addEducation,
  type EducationFormState,
  type EducationField,
} from "./education-actions";
import MonthPicker from "./month-picker";
import AddPanel from "./add-panel";

type TextField = Exclude<EducationField, "startDate" | "endDate">;

const initialState: EducationFormState = { status: "idle" };

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

function EducationFormFields({
  onSaved,
  onCancel,
}: {
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(addEducation, initialState);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

  const v = state.values;
  const err = state.errors ?? {};

  // ids are prefixed so they never clash with the Experience form
  const field = (name: TextField) => ({
    id: `edu-${name}`,
    name,
    defaultValue: v?.[name] ?? "",
    "aria-invalid": !!err[name],
    "aria-describedby": err[name] ? `edu-${name}-error` : undefined,
    className: inputClass,
  });

  return (
    <form action={formAction} className="space-y-4">
      <h3 className="text-sm font-semibold">New education</h3>

      <div>
        <label htmlFor="edu-institution" className="text-sm font-medium">Institution</label>
        <input {...field("institution")} />
        <FieldError id="edu-institution-error" message={err.institution} />
      </div>

      <div>
        <label htmlFor="edu-degree" className="text-sm font-medium">Degree</label>
        <input {...field("degree")} placeholder="e.g. Master of Science" />
        <FieldError id="edu-degree-error" message={err.degree} />
      </div>

      <div>
        <label htmlFor="edu-fieldOfStudy" className="text-sm font-medium">Field of study (optional)</label>
        <input {...field("fieldOfStudy")} placeholder="e.g. Computer Science" />
        <FieldError id="edu-fieldOfStudy-error" message={err.fieldOfStudy} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="edu-startDate" className="text-sm font-medium">Start date</label>
          <MonthPicker
            id="edu-startDate"
            name="startDate"
            value={startDate}
            onChange={setStartDate}
            invalid={!!err.startDate}
            describedBy={err.startDate ? "edu-startDate-error" : undefined}
          />
          <FieldError id="edu-startDate-error" message={err.startDate} />
        </div>
        <div>
          <label htmlFor="edu-endDate" className="text-sm font-medium">End date</label>
          <MonthPicker
            id="edu-endDate"
            name="endDate"
            value={endDate}
            onChange={setEndDate}
            disabled={current}
            invalid={!!err.endDate}
            describedBy={err.endDate ? "edu-endDate-error" : undefined}
          />
          <FieldError id="edu-endDate-error" message={err.endDate} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="current"
          checked={current}
          onChange={(e) => setCurrent(e.target.checked)}
        />
        I&apos;m currently studying here
      </label>

      <div>
        <label htmlFor="edu-description" className="text-sm font-medium">Description (optional)</label>
        <textarea rows={4} {...field("description")} />
        <FieldError id="edu-description-error" message={err.description} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Adding..." : "Add education"}
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

export default function EducationForm() {
  return (
    <AddPanel label="Add education" savedMessage="Education added.">
      {({ onSaved, onCancel }) => (
        <EducationFormFields onSaved={onSaved} onCancel={onCancel} />
      )}
    </AddPanel>
  );
}