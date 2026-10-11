"use client";

import { useState, type ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export default function DashboardSection({
  id,
  title,
  description,
  children,
}: Props) {
  const [open, setOpen] = useState(true);
  const bodyId = `${id}-body`;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="card p-5 scroll-mt-16 lg:scroll-mt-6"
    >
      <h2 id={`${id}-heading`} className="font-serif text-xl">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span>{title}</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`shrink-0 text-pf-muted motion-safe:transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          <span className="sr-only">{open ? "(collapse section)" : "(expand section)"}</span>
        </button>
      </h2>
      {description && open && (
        <p className="mt-1 text-sm text-pf-muted">{description}</p>
      )}
      <div id={bodyId} hidden={!open} className="mt-3">
        {children}
      </div>
    </section>
  );
}
