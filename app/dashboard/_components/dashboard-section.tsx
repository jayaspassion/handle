"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  description?: string;
  // On phones sections start collapsed to keep the page short; set this for
  // the one that should stay open (Profile details)
  openOnPhones?: boolean;
  children: ReactNode;
};

const PHONE = "(max-width: 1023px)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

export default function DashboardSection({
  id,
  title,
  description,
  openOnPhones = false,
  children,
}: Props) {
  // null = not toggled yet: open on desktop, collapsed on phones
  const [toggled, setToggled] = useState<boolean | null>(null);
  const isPhone = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE).matches,
    () => false,
  );
  const open = toggled ?? (openOnPhones || !isPhone);
  const bodyId = `${id}-body`;

  // Jumping here from the section tabs opens the section, then re-aligns it
  // once the opened body has changed the page height
  const [jumped, setJumped] = useState(0);
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash !== `#${id}`) return;
      setToggled(true);
      setJumped((n) => n + 1);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [id]);
  useEffect(() => {
    if (jumped) document.getElementById(id)?.scrollIntoView();
  }, [jumped, id]);

  // Before the page is interactive, CSS hides the body on phones so the
  // server-rendered (desktop) state doesn't flash open
  const cssCollapsed = toggled === null && !openOnPhones ? "max-lg:hidden" : "";

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
          onClick={() => setToggled(!open)}
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
        <p className={`mt-1 text-sm text-pf-muted ${cssCollapsed}`}>{description}</p>
      )}
      <div id={bodyId} hidden={!open} className={`mt-3 ${cssCollapsed}`}>
        {children}
      </div>
    </section>
  );
}
