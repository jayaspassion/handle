"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const FIRST_FIELD =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';

type Props = {
  label: string; // e.g. "Add experience"
  savedMessage: string; // e.g. "Experience added."
  children: (api: { onSaved: () => void; onCancel: () => void }) => ReactNode;
};

export default function AddPanel({ label, savedMessage, children }: Props) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // Opening moves focus to the first field; closing returns it to the button
  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector<HTMLElement>(FIRST_FIELD)?.focus();
    } else if (wasOpen.current) {
      buttonRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  return (
    <div className="mt-4 max-w-xl">
      {open ? (
        <div ref={panelRef} className="rounded-md border border-gray-200 p-4">
          {children({
            onSaved: () => {
              setSaved(true);
              setOpen(false);
            },
            onCancel: () => setOpen(false),
          })}
        </div>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            setSaved(false);
            setOpen(true);
          }}
          className="rounded-md border border-purple-700 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
        >
          <span aria-hidden="true">+ </span>
          {label}
        </button>
      )}

      {/* Always mounted so screen readers announce the message when it appears */}
      <p
        role="status"
        className={saved ? "mt-2 text-sm text-green-700" : "sr-only"}
      >
        {saved ? savedMessage : ""}
      </p>
    </div>
  );
}