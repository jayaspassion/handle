"use client";

import { useState, useTransition } from "react";
import { reorderItems, type ReorderModel } from "../_actions/reorder";
import SortableList, { type SortItem } from "./sortable-list";
import { useLeaveWarning } from "./leave-warning";

export default function ReorderPanel({
  model,
  items,
}: {
  model: ReorderModel;
  items: SortItem[];
}) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<SortItem[]>(items);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty = order.map((i) => i.id).join() !== items.map((i) => i.id).join();
  useLeaveWarning(open && dirty && !pending);

  if (items.length < 2) return null;

  function openPanel() {
    setOrder(items); // always start from what is saved
    setSaved(false);
    setError("");
    setOpen(true);
  }

  function save() {
    startTransition(async () => {
      const result = await reorderItems(model, order.map((i) => i.id));
      if (result.ok) {
        setOpen(false);
        setSaved(true);
        setError("");
      } else {
        setError(result.message ?? "Could not save the order.");
      }
    });
  }

  return (
    <div className="mb-3">
      {open ? (
        <div className="rounded-lg border border-pf-border bg-pf-bg p-4">
          <p className="text-sm font-medium">Reorder</p>
          <p className="mt-1 text-xs text-pf-muted">
            Drag the handle, or use the arrows. The first item is shown first on
            your page.
          </p>
          <div className="mt-3">
            <SortableList label="Order" items={order} onChange={setOrder} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={!dirty || pending}
              className="btn btn-primary btn-sm"
            >
              {pending ? "Saving..." : "Save order"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            {error && (
              <p role="alert" className="msg-error">
                {error}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-3">
          <p role="status" className={saved ? "msg-success" : "sr-only"}>
            {saved ? "Order saved." : ""}
          </p>
          <button type="button" onClick={openPanel} className="btn btn-outline btn-sm">
            Reorder
          </button>
        </div>
      )}
    </div>
  );
}
