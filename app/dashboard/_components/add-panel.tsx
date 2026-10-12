"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LeaveGuard } from "./leave-warning";

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

  // The "added" message goes away after a few seconds or as soon as anything
  // else on the page is saved or deleted, so it never describes an old action
  useEffect(() => {
    if (!saved) return;
    const clear = () => setSaved(false);
    const timer = window.setTimeout(clear, 5000);
    document.addEventListener("submit", clear, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("submit", clear, true);
    };
  }, [saved]);

  return (
    <div className="mt-3">
      {open ? (
        <div
          ref={panelRef}
          className="rounded-lg border border-pf-border bg-pf-bg p-4"
        >
          <LeaveGuard>
            {children({
              onSaved: () => {
                setSaved(true);
                setOpen(false);
              },
              onCancel: () => setOpen(false),
            })}
          </LeaveGuard>
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
