"use client";

import { useEffect, useRef, useState } from "react";
import { deleteTestimonial, type TestimonialValues } from "./actions";
import { TestimonialFormFields } from "./form";
import { LeaveGuard } from "../../_components/leave-warning";

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
      <li className="rounded-lg border border-pf-border p-4">
        <div ref={panelRef}>
          <LeaveGuard>
            <TestimonialFormFields
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
        <blockquote>
          <p className="whitespace-pre-line text-sm italic">
            &ldquo;{item.quote}&rdquo;
          </p>
          <footer className="mt-2 text-sm">
            <span className="font-medium">{item.authorName}</span>
            {item.byline && (
              <span className="text-pf-muted"> · {item.byline}</span>
            )}
          </footer>
        </blockquote>
        <div className="flex items-center gap-3">
          <button
            ref={editButtonRef}
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit testimonial from ${item.authorName}`}
            className="btn btn-outline btn-sm"
          >
            Edit
          </button>
          <form action={deleteTestimonial}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              aria-label={`Delete testimonial from ${item.authorName}`}
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