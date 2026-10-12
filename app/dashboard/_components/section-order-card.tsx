"use client";

import { useState, useTransition } from "react";
import { saveSectionOrder } from "../_actions/reorder";
import { SECTION_LABELS, type SectionKey } from "@/lib/sections";
import SortableList, { type SortItem } from "./sortable-list";
import { useLeaveWarning } from "./leave-warning";

export default function SectionOrderCard({ order }: { order: SectionKey[] }) {
  const [items, setItems] = useState<SortItem[]>(
    order.map((key) => ({ id: key, label: SECTION_LABELS[key] })),
  );
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty = items.map((i) => i.id).join() !== order.join();
  useLeaveWarning(dirty && !pending);

  function save() {
    startTransition(async () => {
      const result = await saveSectionOrder(items.map((i) => i.id));
      if (result.ok) {
        setSaved(true);
        setError("");
      } else {
        setError(result.message ?? "Could not save the order.");
      }
    });
  }

  return (
    <div className="card p-5">
      <h2 className="font-serif text-xl">Page order</h2>
      <p className="mt-1 text-sm text-pf-muted">
        Choose the order of the sections on your public page.
      </p>
      <div className="mt-3">
        <SortableList
          label="Section order"
          items={items}
          onChange={(next) => {
            setItems(next);
            setSaved(false);
          }}
        />
      </div>
      <button
        type="button"
        onClick={save}
        disabled={!dirty || pending}
        className="btn btn-primary mt-3 w-full"
      >
        {pending ? "Saving..." : "Save order"}
      </button>
      <p role="status" className={saved && !dirty ? "msg-success mt-2" : "sr-only"}>
        {saved && !dirty ? "Order saved." : ""}
      </p>
      {error && (
        <p role="alert" className="msg-error mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
