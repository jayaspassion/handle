"use client";

import { useActionState, useEffect, useId, useState } from "react";
import {
  saveCertification,
  type CertificationFormState,
  type CertificationValues,
} from "./actions";
import MonthPicker from "../../_components/month-picker";
import AddPanel from "../../_components/add-panel";

type TextField = "name" | "issuer" | "credentialUrl";

const initialState: CertificationFormState = { status: "idle" };

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
  editId?: string; // set when editing an existing certification
  initial?: CertificationValues; // values to pre-fill when editing
  onSaved: () => void;
  onCancel: () => void;
};

// Used by both the Add panel and the Edit mode of a list entry
export function CertificationFormFields({
  editId,
  initial,
  onSaved,
  onCancel,
}: FieldsProps) {
  const [state, formAction, pending] = useActionState(
    saveCertification,
    initialState,
  );

  // Unique ids, so several forms can be open on the page at once
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? "");
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate ?? "");

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
        {editId ? "Edit certification" : "New certification"}
      </h3>
      {editId && <input type="hidden" name="id" value={editId} />}

      <div>
        <label htmlFor={fid("name")} className="text-sm font-medium">Name</label>
        <input {...field("name")} placeholder="e.g. AWS Certified Developer" />
        <FieldError id={`${fid("name")}-error`} message={err.name} />
      </div>

      <div>
        <label htmlFor={fid("issuer")} className="text-sm font-medium">Issuing organization</label>
        <input {...field("issuer")} placeholder="e.g. Amazon Web Services" />
        <FieldError id={`${fid("issuer")}-error`} message={err.issuer} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("issueDate")} className="text-sm font-medium">Issue date (optional)</label>
          <MonthPicker
            id={fid("issueDate")}
            name="issueDate"
            value={issueDate}
            onChange={setIssueDate}
            invalid={!!err.issueDate}
            describedBy={err.issueDate ? `${fid("issueDate")}-error` : undefined}
          />
          <FieldError id={`${fid("issueDate")}-error`} message={err.issueDate} />
        </div>
        <div>
          <label htmlFor={fid("expiryDate")} className="text-sm font-medium">Expiry date (optional)</label>
          <MonthPicker
            id={fid("expiryDate")}
            name="expiryDate"
            value={expiryDate}
            onChange={setExpiryDate}
            placeholder="No expiry"
            invalid={!!err.expiryDate}
            describedBy={err.expiryDate ? `${fid("expiryDate")}-error` : undefined}
          />
          <FieldError id={`${fid("expiryDate")}-error`} message={err.expiryDate} />
        </div>
      </div>

      <div>
        <label htmlFor={fid("credentialUrl")} className="text-sm font-medium">Credential link (optional)</label>
        <input
          {...field("credentialUrl")}
          type="text"
          inputMode="url"
          autoComplete="off"
          placeholder="https://..."
        />
        <FieldError id={`${fid("credentialUrl")}-error`} message={err.credentialUrl} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending
            ? editId ? "Saving..." : "Adding..."
            : editId ? "Save changes" : "Add certification"}
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

export default function CertificationForm() {
  return (
    <AddPanel label="Add certification" savedMessage="Certification added.">
      {({ onSaved, onCancel }) => (
        <CertificationFormFields onSaved={onSaved} onCancel={onCancel} />
      )}
    </AddPanel>
  );
}