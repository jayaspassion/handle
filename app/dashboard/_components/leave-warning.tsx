"use client";

import { useEffect, useState, type ReactNode } from "react";

// Asks the browser to confirm before reloading or leaving while there are
// unsaved edits. (Dashboard tabs only jump within the page, so this covers it.)
export function useLeaveWarning(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active]);
}

// For open add/edit forms: any typing counts as unsaved until the form closes
// (saving or cancelling unmounts it). File pickers save on their own.
export function LeaveGuard({ children }: { children: ReactNode }) {
  const [touched, setTouched] = useState(false);
  useLeaveWarning(touched);
  return (
    <div
      className="contents"
      onInput={(e) => {
        if ((e.target as HTMLInputElement).type !== "file") setTouched(true);
      }}
    >
      {children}
    </div>
  );
}
