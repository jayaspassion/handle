"use client";

import { useEffect, useRef, useState } from "react";
import { deleteLink, type LinkValues } from "./actions";
import { LinkFormFields } from "./form";
import { LeaveGuard } from "../../_components/leave-warning";

const FIRST_FIELD =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';

type Props = {
  item: { id: string; label: string; url: string };
  initial: LinkValues;
};

export default function LinkItem({ item, initial }: Props) {
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
            <LinkFormFields
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
    <li className="rounded-lg border border-pf-border px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-pf-accent hover:underline"
          >
            {item.label}
          </a>
          <p className="truncate text-xs text-pf-muted">{item.url}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            ref={editButtonRef}
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${item.label} link`}
            className="btn btn-outline btn-sm"
          >
            Edit
          </button>
          <form action={deleteLink}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              aria-label={`Delete ${item.label} link`}
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