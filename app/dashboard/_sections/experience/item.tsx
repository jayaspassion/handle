"use client";

import { useEffect, useRef, useState } from "react";
import { deleteExperience, type ExperienceValues } from "./actions";
import { ExperienceFormFields } from "./form";

const FIRST_FIELD =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';

type Props = {
  item: {
    id: string;
    role: string;
    company: string;
    location: string | null;
    range: string;
    description: string | null;
  };
  initial: ExperienceValues;
};

export default function ExperienceItem({ item, initial }: Props) {
  const [editing, setEditing] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasEditing = useRef(false);

  // Entering edit mode focuses the first field; leaving returns focus to Edit
  useEffect(() => {
    if (editing) {
      panelRef.current?.querySelector<HTMLElement>(FIRST_FIELD)?.focus();
    } else if (wasEditing.current) {
      editButtonRef.current?.focus();
    }
    wasEditing.current = editing;
  }, [editing]);

  if (editing) {
    return (
      <li className="rounded-md border border-gray-200 p-4">
        <div ref={panelRef}>
          <ExperienceFormFields
            editId={item.id}
            initial={initial}
            onSaved={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-md border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{item.role}</p>
          <p className="text-sm">
            {item.company}
            {item.location ? ` · ${item.location}` : ""}
          </p>
          <p className="text-sm text-gray-600">{item.range}</p>
          {item.description && (
            <p className="mt-2 whitespace-pre-line text-sm">{item.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            ref={editButtonRef}
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${item.role} at ${item.company}`}
            className="text-sm text-purple-700 hover:underline"
          >
            Edit
          </button>
          <form action={deleteExperience}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              aria-label={`Delete ${item.role} at ${item.company}`}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}