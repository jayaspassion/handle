"use client";

import { useActionState, useId, useState, type FormEvent } from "react";
import { updateProfile, type ProfileFormState } from "./actions";
import { PhotoUploader, ResumeUploader } from "./uploads";

export type ProfileValues = {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
};

type Field = keyof ProfileValues;

const FIELDS: Field[] = ["fullName", "headline", "location", "bio"];

const initialState: ProfileFormState = { status: "idle" };

const inputClass = "input mt-1";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}

function readValues(form: HTMLFormElement): ProfileValues {
  const data = new FormData(form);
  return {
    fullName: String(data.get("fullName") ?? ""),
    headline: String(data.get("headline") ?? ""),
    location: String(data.get("location") ?? ""),
    bio: String(data.get("bio") ?? ""),
  };
}

type Props = {
  initial: ProfileValues; // the saved values
  avatarUrl: string | null;
  resumeUrl: string | null;
};

export function ProfileForm({ initial, avatarUrl, resumeUrl }: Props) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  // What the user has typed so far (null until they touch the form)
  const [current, setCurrent] = useState<ProfileValues | null>(null);
  // Hide the "saved" message as soon as the user edits again
  const [touchedState, setTouchedState] = useState<ProfileFormState | null>(null);

  const showSaved = state.status === "success" && touchedState !== state;
  const dirty =
    current !== null &&
    FIELDS.some((f) => current[f].trim() !== initial[f].trim());

  function onInput(e: FormEvent<HTMLFormElement>) {
    setTouchedState(state);
    setCurrent(readValues(e.currentTarget));
  }

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
      onInput={onInput}
      className="grid gap-5 md:grid-cols-[9rem_minmax(0,1fr)_12rem]"
    >
      <PhotoUploader avatarUrl={avatarUrl} name={initial.fullName} />

      <div className="space-y-3">
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
      </div>

      <div className="flex flex-col gap-4">
        <ResumeUploader resumeUrl={resumeUrl} />
        <div className="flex flex-col gap-2 md:mt-auto">
          {/* Always mounted so screen readers announce the message when it appears */}
          <p role="status" className={showSaved ? "msg-success text-center" : "sr-only"}>
            {showSaved ? "Profile saved." : ""}
          </p>
          {state.status === "error" && state.message && (
            <p role="alert" className="msg-error text-center">{state.message}</p>
          )}
          <button
            type="submit"
            disabled={pending || !dirty}
            className="btn btn-primary w-full"
          >
            {pending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
