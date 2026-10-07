"use client";

import { useActionState, useEffect, useId } from "react";
import { updateProfile, type ProfileFormState } from "./actions";

export type ProfileValues = {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
};

type Field = keyof ProfileValues;

const initialState: ProfileFormState = { status: "idle" };

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

type Props = {
  initial: ProfileValues; // the saved values, pre-filled when the form opens
  onSaved: () => void;
  onCancel: () => void;
};

export function ProfileFormFields({ initial, onSaved, onCancel }: Props) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  // Unique ids so labels always point at the right field
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

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
    <form action={formAction} className="space-y-4">
      <h3 className="text-sm font-semibold">Edit profile</h3>

      <div>
        <label htmlFor={fid("fullName")} className="text-sm font-medium">Full name</label>
        <input {...field("fullName")} />
        <FieldError id={`${fid("fullName")}-error`} message={err.fullName} />
      </div>

      <div>
        <label htmlFor={fid("headline")} className="text-sm font-medium">Headline</label>
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
        <textarea rows={5} {...field("bio")} />
        <FieldError id={`${fid("bio")}-error`} message={err.bio} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save changes"}
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