"use client";

import { useEffect, useRef, useState } from "react";
import { deleteTestimonial, type TestimonialValues } from "./actions";
import { TestimonialFormFields } from "./form";

const FIRST_FIELD =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';

type Props = {
  item: {
    id: string;
    quote: string;
    authorName: string;
    byline: string; // e.g. "Engineering Manager at Acme"
  };
  initial: TestimonialValues;
};

export default function TestimonialItem({ item, initial }: Props) {
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
          <TestimonialFormFields
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
        <blockquote>
          <p className="whitespace-pre-line text-sm italic">
            &ldquo;{item.quote}&rdquo;
          </p>
          <footer className="mt-2 text-sm">
            <span className="font-medium">{item.authorName}</span>
            {item.byline && (
              <span className="text-gray-600"> · {item.byline}</span>
            )}
          </footer>
        </blockquote>
        <div className="flex items-center gap-3">
          <button
            ref={editButtonRef}
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit testimonial from ${item.authorName}`}
            className="text-sm text-purple-700 hover:underline"
          >
            Edit
          </button>
          <form action={deleteTestimonial}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              aria-label={`Delete testimonial from ${item.authorName}`}
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