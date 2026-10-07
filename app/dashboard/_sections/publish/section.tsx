"use client";

import { useActionState, useId } from "react";
import { publishProfile, unpublishProfile, type PublishState } from "./actions";

const initialState: PublishState = { status: "idle" };

type Props = {
  username: string; // the saved username, or "" if none yet
  isPublished: boolean;
  hasName: boolean;
};

export default function PublishSection({ username, isPublished, hasName }: Props) {
  const [state, formAction, pending] = useActionState(publishProfile, initialState);

  const uid = useId();
  const inputId = `${uid}-username`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  if (isPublished) {
    return (
      <div className="mt-4 max-w-xl rounded-md border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              Published
            </span>
            <p className="mt-2 text-sm">
              Your public address:{" "}
              <a
                href={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-purple-700 hover:underline"
              >
                /{username}
              </a>
            </p>
            <p className="mt-1 text-xs text-gray-600">
              To change your username, unpublish first.
            </p>
          </div>
          <form action={unpublishProfile}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Unpublish
            </button>
          </form>
        </div>
        <p role="status" className="sr-only">
          {state.status === "success" ? state.message : ""}
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-4 max-w-xl space-y-3 rounded-md border border-gray-200 p-4"
    >
      <p className="text-sm">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
          Draft
        </span>{" "}
        Only you can see your profile right now.
      </p>

      <div>
        <label htmlFor={inputId} className="text-sm font-medium">
          Choose your username
        </label>
        <input
          id={inputId}
          name="username"
          defaultValue={state.values?.username ?? username}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={!!state.usernameError}
          aria-describedby={
            state.usernameError ? `${hintId} ${errorId}` : hintId
          }
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p id={hintId} className="mt-1 text-xs text-gray-600">
          3 to 30 characters: letters, numbers and hyphens. This becomes your
          public address.
        </p>
        {state.usernameError && (
          <p id={errorId} className="mt-1 text-sm text-red-600">
            {state.usernameError}
          </p>
        )}
      </div>

      {!hasName && (
        <p className="text-sm text-amber-700">
          Add your name in the Profile section before publishing.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Publishing..." : "Publish profile"}
        </button>
        {state.status === "error" && state.message && (
          <p role="alert" className="text-sm text-red-600">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}