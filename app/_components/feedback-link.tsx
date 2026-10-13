"use client";

import type { ReactNode } from "react";
import { feedbackUrl, type FeedbackDevice, type FeedbackWhere } from "@/lib/url";

function currentDevice(): FeedbackDevice {
  if (window.matchMedia("(max-width: 767px)").matches) return "Phone";
  if (window.matchMedia("(max-width: 1279px) and (pointer: coarse)").matches) return "Tablet";
  return "Computer";
}

// Opens the beta feedback form with "Where?" pre-filled, and "Device"
// added at click time (the server can't know it)
export default function FeedbackLink({
  where,
  className,
  children,
}: {
  where: FeedbackWhere;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={feedbackUrl(where)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.currentTarget.href = feedbackUrl(where, currentDevice());
      }}
      className={className}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
