"use client";

import { useState } from "react";

export type SortItem = { id: string; label: string };

const icon = {
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

// Drag with the mouse, or use the arrow buttons (keyboard, touch, screen readers).
export default function SortableList({
  items,
  onChange,
  label,
}: {
  items: SortItem[];
  onChange: (items: SortItem[]) => void;
  label: string;
}) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [announce, setAnnounce] = useState("");

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    setAnnounce(`${moved.label} moved to position ${to + 1} of ${items.length}.`);
  }

  return (
    <div>
      <ul aria-label={label} className="space-y-2">
        {items.map((item, i) => (
          <li
            key={item.id}
            draggable
            onDragStart={(e) => {
              setDragging(i);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", item.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setOver(i);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging !== null) move(dragging, i);
              setDragging(null);
              setOver(null);
            }}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
            }}
            className={`flex items-center gap-3 rounded-lg border bg-pf-surface px-3 py-2 ${
              over === i && dragging !== null && dragging !== i
                ? "border-pf-brand"
                : "border-pf-border"
            } ${dragging === i ? "opacity-50" : ""}`}
          >
            <span aria-hidden="true" className="cursor-grab text-pf-muted">
              <svg {...icon} fill="currentColor" stroke="none">
                <circle cx="9" cy="6" r="1.3" />
                <circle cx="15" cy="6" r="1.3" />
                <circle cx="9" cy="12" r="1.3" />
                <circle cx="15" cy="12" r="1.3" />
                <circle cx="9" cy="18" r="1.3" />
                <circle cx="15" cy="18" r="1.3" />
              </svg>
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">{item.label}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label={`Move ${item.label} up`}
                className="btn btn-outline btn-sm w-10 px-0"
              >
                <svg {...icon}>
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === items.length - 1}
                aria-label={`Move ${item.label} down`}
                className="btn btn-outline btn-sm w-10 px-0"
              >
                <svg {...icon}>
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p role="status" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
