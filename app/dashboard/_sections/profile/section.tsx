"use client";

import { useEffect, useRef, useState } from "react";
import { ProfileFormFields, type ProfileValues } from "./form";

const FIRST_FIELD =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';

export default function ProfileSection({ values }: { values: ProfileValues }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasEditing = useRef(false);

  // Opening moves focus to the first field; closing returns it to the button
  useEffect(() => {
    if (editing) {
      panelRef.current?.querySelector<HTMLElement>(FIRST_FIELD)?.focus();
    } else if (wasEditing.current) {
      buttonRef.current?.focus();
    }
    wasEditing.current = editing;
  }, [editing]);

  const isEmpty =
    !values.fullName && !values.headline && !values.location && !values.bio;

  return (
    <div className="mt-4 max-w-xl">
      {editing ? (
        <div ref={panelRef} className="rounded-md border border-gray-200 p-4">
          <ProfileFormFields
            initial={values}
            onSaved={() => {
              setSaved(true);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <div className="rounded-md border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-4">
            {isEmpty ? (
              <p className="text-sm text-gray-600">
                Your profile is empty. Add your name and a short intro so
                visitors know who you are.
              </p>
            ) : (
              <div>
                <p className="text-lg font-medium">
                  {values.fullName || (
                    <span className="text-gray-500">No name yet</span>
                  )}
                </p>
                {values.headline && <p className="text-sm">{values.headline}</p>}
                {values.location && (
                  <p className="text-sm text-gray-600">{values.location}</p>
                )}
                {values.bio && (
                  <p className="mt-2 whitespace-pre-line text-sm">{values.bio}</p>
                )}
              </div>
            )}
            <button
              ref={buttonRef}
              type="button"
              onClick={() => {
                setSaved(false);
                setEditing(true);
              }}
              className="shrink-0 text-sm text-purple-700 hover:underline"
            >
              {isEmpty ? "Add profile details" : "Edit profile"}
            </button>
          </div>
        </div>
      )}

      {/* Always mounted so screen readers announce the message when it appears */}
      <p
        role="status"
        className={saved ? "mt-2 text-sm text-green-700" : "sr-only"}
      >
        {saved ? "Profile saved." : ""}
      </p>
    </div>
  );
}