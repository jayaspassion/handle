"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "./actions";

type Props = {
  defaults: {
    fullName: string;
    headline: string;
    bio: string;
    location: string;
  };
};

const initialState: ProfileFormState = { status: "idle" };

export default function ProfileForm({ defaults }: Props) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  // After a failed submit, keep what the user typed instead of resetting
  const v = state.values ?? defaults;
  const err = state.errors ?? {};

  const input =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

  return (
    <form action={formAction} className="mt-6 max-w-xl space-y-4">
      <div>
        <label htmlFor="fullName" className="text-sm font-medium">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          defaultValue={v.fullName}
          aria-invalid={!!err.fullName}
          aria-describedby={err.fullName ? "fullName-error" : undefined}
          className={input}
        />
        {err.fullName && (
          <p id="fullName-error" className="mt-1 text-sm text-red-600">
            {err.fullName}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="headline" className="text-sm font-medium">
          Headline
        </label>
        <input
          id="headline"
          name="headline"
          defaultValue={v.headline}
          placeholder="e.g. Full-stack developer"
          aria-invalid={!!err.headline}
          aria-describedby={err.headline ? "headline-error" : undefined}
          className={input}
        />
        {err.headline && (
          <p id="headline-error" className="mt-1 text-sm text-red-600">
            {err.headline}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="text-sm font-medium">
          Location
        </label>
        <input
          id="location"
          name="location"
          defaultValue={v.location}
          aria-invalid={!!err.location}
          aria-describedby={err.location ? "location-error" : undefined}
          className={input}
        />
        {err.location && (
          <p id="location-error" className="mt-1 text-sm text-red-600">
            {err.location}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          defaultValue={v.bio}
          aria-invalid={!!err.bio}
          aria-describedby={err.bio ? "bio-error" : undefined}
          className={input}
        />
        {err.bio && (
          <p id="bio-error" className="mt-1 text-sm text-red-600">
            {err.bio}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <p role="status" className="text-sm">
          {state.status === "success" && (
            <span className="text-green-700">{state.message}</span>
          )}
          {state.status === "error" && state.message && (
            <span className="text-red-600">{state.message}</span>
          )}
        </p>
      </div>
    </form>
  );
}