"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const arrow = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

// The whole Projects panel: heading with arrows on the right, and one row of
// cards (list items from the page) that slides sideways.
export default function ProjectsSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ overflow: false, atStart: true, atEnd: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdges({
        overflow: el.scrollWidth > el.clientWidth + 4,
        atStart: el.scrollLeft <= 4,
        atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
    const raf = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function slide(direction: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * el.clientWidth * 0.9,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="panel min-w-0 scroll-mt-8 print:border-0 print:bg-transparent print:p-0"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow" aria-hidden="true">
            {eyebrow}
          </p>
          <h2
            id={`${id}-heading`}
            className="mt-1 font-serif text-[1.75rem] leading-9 tracking-tight"
          >
            {title}
          </h2>
        </div>
        {edges.overflow && (
          <div className="flex gap-2 print:hidden">
            <button
              type="button"
              onClick={() => slide(-1)}
              disabled={edges.atStart}
              aria-label="Previous projects"
              className="btn btn-outline btn-sm w-10 px-0"
            >
              <svg {...arrow}>
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => slide(1)}
              disabled={edges.atEnd}
              aria-label="Next projects"
              className="btn btn-outline btn-sm w-10 px-0"
            >
              <svg {...arrow}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div
        ref={ref}
        role="region"
        aria-label={title}
        tabIndex={0}
        className="mt-4 snap-x snap-mandatory overflow-x-auto rounded-lg pb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pf-brand print:overflow-visible"
      >
        <ul className="flex gap-5 print:flex-wrap">{children}</ul>
      </div>
    </section>
  );
}
