"use client";

import { useEffect, useRef, useState } from "react";
import { deleteEducation, type EducationValues } from "./actions";
import { EducationFormFields } from "./form";
import { LeaveGuard } from "../../_components/leave-warning";

const FIRST_FIELD =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';

type Props = {
  item: {
    id: string;
    degree: string;
    fieldOfStudy: string | null;
    location: string | null;
    gpa: string | null;
    institution: string;
    range: string;
    description: string | null;
  };
  initial: EducationValues;
};

export default function EducationItem({ item, initial }: Props) {
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
      <li className="rounded-lg border border-pf-border p-4">
        <div ref={panelRef}>
          <LeaveGuard>
            <EducationFormFields
              editId={item.id}
              initial={initial}
              onSaved={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          </LeaveGuard>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-pf-border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="font-medium">
            {item.degree}
            {item.fieldOfStudy ? `, ${item.fieldOfStudy}` : ""}
          </p>
          <p className="text-sm">
            {[item.institution, item.location].filter(Boolean).join(" | ")}
          </p>
          <p className="text-sm text-pf-muted">
            {[
              item.range,
              item.gpa ? (/^\d/.test(item.gpa) ? `GPA ${item.gpa}` : item.gpa) : null,
            ]
              .filter(Boolean)
              .join(" | ")}
          </p>
          {item.description && (
            <p className="mt-2 whitespace-pre-line text-sm">{item.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            ref={editButtonRef}
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${item.degree} at ${item.institution}`}
            className="btn btn-outline btn-sm"
          >
            Edit
          </button>
          <form action={deleteEducation}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              aria-label={`Delete ${item.degree} at ${item.institution}`}
              className="btn btn-danger btn-sm"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}