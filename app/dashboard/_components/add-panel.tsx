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
    <div className="mt-3">
      {open ? (
        <div
          ref={panelRef}
          className="rounded-lg border border-pf-border bg-pf-bg p-4"
        >
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
          className="btn btn-outline btn-sm"
        >
          <span aria-hidden="true">+</span>
          {label}
        </button>
      )}

      {/* Always mounted so screen readers announce the message when it appears */}
      <p role="status" className={saved ? "msg-success mt-2" : "sr-only"}>
        {saved ? savedMessage : ""}
      </p>
    </div>
  );
}
