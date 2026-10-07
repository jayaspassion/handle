"use client";

import { useEffect, useRef, useState } from "react";
import { deleteCertification, type CertificationValues } from "./actions";
import { CertificationFormFields } from "./form";

const FIRST_FIELD =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';

type Props = {
  item: {
    id: string;
    name: string;
    issuer: string;
    dates: string;
    credentialUrl: string | null;
  };
  initial: CertificationValues;
};

export default function CertificationItem({ item, initial }: Props) {
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
          <CertificationFormFields
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
          <p className="font-medium">{item.name}</p>
          <p className="text-sm">{item.issuer}</p>
          {item.dates && <p className="text-sm text-gray-600">{item.dates}</p>}
          {item.credentialUrl && (
            <p className="mt-2 text-sm">
              <a
                href={item.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-700 hover:underline"
              >
                View credential
              </a>
            </p>
          )}
        </div>
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
          <form action={deleteCertification}>
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