"use client";

import { useActionState, useId, useState } from "react";
import { updateProfile, type ProfileFormState } from "./actions";

export type ProfileValues = {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
};

type Field = keyof ProfileValues;

const initialState: ProfileFormState = { status: "idle" };

const inputClass = "input mt-1";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-pf-danger">
      {message}
    </p>
  );
}

export function ProfileFormFields({ initial }: { initial: ProfileValues }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  // Hide the "saved" message as soon as the user edits again
  const [touchedState, setTouchedState] = useState<ProfileFormState | null>(null);
  const showSaved = state.status === "success" && touchedState !== state;

  // Unique ids so labels always point at the right field
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  // After a failed submit, keep what the user typed instead of resetting
  const base = state.values ?? initial;
  const err = state.errors ?? {};

  const field = (name: Field) => ({
    id: fid(name),
    name,
    defaultValue: base[name],
    "aria-invalid": !!err[name],
    "aria-describedby": err[name] ? `${fid(name)}-error` : undefined,
    className: inputClass,
  });

  return (
    <form
      action={formAction}
      onInput={() => setTouchedState(state)}
      className="space-y-3"
    >
      <div>
        <label htmlFor={fid("fullName")} className="text-sm font-medium">Full name</label>
        <input {...field("fullName")} />
        <FieldError id={`${fid("fullName")}-error`} message={err.fullName} />
      </div>

      <div>
        <label htmlFor={fid("headline")} className="text-sm font-medium">Professional headline</label>
        <input {...field("headline")} placeholder="e.g. Full-stack developer" />
        <FieldError id={`${fid("headline")}-error`} message={err.headline} />
      </div>

      <div>
        <label htmlFor={fid("location")} className="text-sm font-medium">Location</label>
        <input {...field("location")} />
        <FieldError id={`${fid("location")}-error`} message={err.location} />
      </div>

      <div>
        <label htmlFor={fid("bio")} className="text-sm font-medium">Bio</label>
        <textarea rows={4} {...field("bio")} />
        <FieldError id={`${fid("bio")}-error`} message={err.bio} />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {/* Always mounted so screen readers announce the message when it appears */}
        <p role="status" className={showSaved ? "msg-success" : "sr-only"}>
          {showSaved ? "Profile saved." : ""}
        </p>
        {state.status === "error" && state.message && (
          <p role="alert" className="msg-error">{state.message}</p>
        )}
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
