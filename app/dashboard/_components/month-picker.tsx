"use client";

import { useEffect, useId, useRef, useState } from "react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MIN_YEAR = 1970;

type Props = {
  id: string;
  name: string;
  value: string; // "YYYY-MM" or ""
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
};

function parse(value: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  return m ? { year: Number(m[1]), month: Number(m[2]) } : null;
}

function format(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export default function MonthPicker({
  id,
  name,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
  placeholder = "Select month",
}: Props) {
  const selected = parse(value);
  const now = new Date();
  const thisYear = now.getFullYear();
  const maxYear = thisYear + 10; // allows expected graduation or a future start

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected?.year ?? thisYear);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Move focus into the popup when it opens
  useEffect(() => {
    if (!open) return;
    const root = containerRef.current;
    const target =
      root?.querySelector<HTMLButtonElement>('[data-month][aria-pressed="true"]') ??
      root?.querySelector<HTMLButtonElement>("[data-month]");
    target?.focus();
  }, [open]);

  function toggle() {
    if (!open) setViewYear(selected?.year ?? thisYear);
    setOpen(!open);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(year: number, month: number) {
    onChange(format(year, month));
    close();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      close();
    }
  }

  return (
    <div ref={containerRef} className="relative" onKeyDown={onKeyDown}>
      <input type="hidden" name={name} value={value} />

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-describedby={describedBy}
        onClick={toggle}
        className={`mt-1 flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
          invalid ? "border-red-500" : "border-gray-300"
        }`}
      >
        <span className={selected ? "" : "text-gray-500"}>
          {selected ? `${MONTHS[selected.month - 1]} ${selected.year}` : placeholder}
        </span>
        <span aria-hidden="true" className="text-gray-500">▾</span>
      </button>

      {open && (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Choose month and year"
          className="absolute left-0 z-10 mt-1 w-64 rounded-md border border-gray-200 bg-white p-3 text-gray-900 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous year"
              disabled={viewYear <= MIN_YEAR}
              onClick={() => setViewYear((y) => y - 1)}
              className="rounded px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-40"
            >
              ‹
            </button>
            <span aria-live="polite" className="text-sm font-medium">
              {viewYear}
            </span>
            <button
              type="button"
              aria-label="Next year"
              disabled={viewYear >= maxYear}
              onClick={() => setViewYear((y) => y + 1)}
              className="rounded px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-40"
            >
              ›
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {MONTHS.map((label, i) => {
              const isSelected =
                selected?.year === viewYear && selected.month === i + 1;
              return (
                <button
                  key={label}
                  type="button"
                  data-month
                  aria-pressed={isSelected}
                  aria-label={`${label} ${viewYear}`}
                  onClick={() => choose(viewYear, i + 1)}
                  className={`rounded px-2 py-2 text-sm ${
                    isSelected
                      ? "bg-purple-700 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                onChange("");
                close();
              }}
              className="text-gray-600 hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => choose(thisYear, now.getMonth() + 1)}
              className="text-purple-700 hover:underline"
            >
              This month
            </button>
          </div>
        </div>
      )}
    </div>
  );
}