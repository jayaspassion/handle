"use client";

import { useEffect, useRef, useState } from "react";
import { deleteLink, type LinkValues } from "./actions";
import { LinkFormFields } from "./form";

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
      <li className="rounded-md border border-gray-200 p-4">
        <div ref={panelRef}>
          <LinkFormFields
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
    <li className="rounded-md border border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-purple-700 hover:underline"
          >
            {item.label}
          </a>
          <p className="truncate text-xs text-gray-600">{item.url}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            ref={editButtonRef}
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${item.label} link`}
            className="text-sm text-purple-700 hover:underline"
          >
            Edit
          </button>
          <form action={deleteLink}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              aria-label={`Delete ${item.label} link`}
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