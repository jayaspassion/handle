"use client";

import { useEffect, useRef, useState } from "react";
import { deleteSkill, type SkillValues } from "./actions";
import { SkillFormFields } from "./form";

const FIRST_FIELD =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';

type Props = {
  item: { id: string; name: string; category: string | null };
  initial: SkillValues;
  categories: string[];
};

export default function SkillItem({ item, initial, categories }: Props) {
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
          <SkillFormFields
            editId={item.id}
            initial={initial}
            categories={categories}
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
        <p className="text-sm">
          <span className="font-medium">{item.name}</span>
          {item.category && (
            <span className="text-gray-600"> · {item.category}</span>
          )}
        </p>
        <div className="flex items-center gap-3">
          <button
            ref={editButtonRef}
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${item.name}`}
            className="text-sm text-purple-700 hover:underline"
          >
            Edit
          </button>
          <form action={deleteSkill}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              aria-label={`Delete ${item.name}`}
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