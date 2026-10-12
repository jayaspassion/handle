"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "profile", label: "Profile", icon: "user" },
  { id: "links", label: "Links", icon: "link" },
  { id: "projects", label: "Projects", icon: "folder" },
  { id: "experience", label: "Experience", icon: "briefcase" },
  { id: "education", label: "Education", icon: "cap" },
  { id: "skills", label: "Skills", icon: "bars" },
  { id: "certifications", label: "Certifications", icon: "award" },
  { id: "testimonials", label: "Testimonials", icon: "message" },
] as const;

function NavIcon({ name }: { name: (typeof NAV_ITEMS)[number]["icon"] }) {
  const paths: Record<string, React.ReactNode> = {
    home: (
      <>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
    link: (
      <>
        <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
        <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
      </>
    ),
    folder: (
      <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
      </>
    ),
    cap: (
      <>
        <path d="M2 9l10-5 10 5-10 5z" />
        <path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
      </>
    ),
    bars: <path d="M5 20V10M12 20V4M19 20v-7" />,
    award: (
      <>
        <circle cx="12" cy="9" r="6" />
        <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
      </>
    ),
    message: (
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" />
    ),
  };
  return (
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
      className="shrink-0"
    >
      {paths[name]}
    </svg>
  );
}

export default function DashboardNav({
  email,
  tier,
}: {
  email: string;
  tier: string;
}) {
  const [active, setActive] = useState<string>("overview");
  const lockUntil = useRef(0);
  const navRef = useRef<HTMLElement>(null);

  // Highlight the section near the top of the screen. At the very top it is
  // Overview, at the very bottom the last section. A click wins briefly so
  // short sections at the end can still be selected.
  useEffect(() => {
    const ids = NAV_ITEMS.map((i) => i.id);
    function update() {
      if (Date.now() < lockUntil.current) return;
      if (window.scrollY < 80) {
        setActive(ids[0]);
        return;
      }
      // The activation line sits 35% down the screen and slides to the bottom
      // edge over the last stretch of the page, so the final short sections
      // are highlighted one after the other.
      const vh = window.innerHeight;
      const remaining =
        document.documentElement.scrollHeight - (window.scrollY + vh);
      const range = vh * 0.65;
      const t = remaining < range ? 1 - Math.max(remaining, 0) / range : 0;
      const line = vh * (0.35 + 0.65 * t);
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // On phones the nav is a horizontal strip: keep the active tab in view
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || nav.scrollWidth <= nav.clientWidth) return;
    const link = nav.querySelector<HTMLElement>('[aria-current="location"]');
    if (!link) return;
    nav.scrollTo({
      left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [active]);

  return (
    <aside className="sticky top-0 z-10 border-b border-pf-border bg-pf-bg lg:static lg:border-b-0 lg:border-r lg:bg-pf-surface">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:px-3 lg:py-6">
        <Link
          href="/"
          className="hidden px-3 font-serif text-3xl leading-9 tracking-tight lg:block"
        >
          handle
        </Link>
        <nav
          ref={navRef}
          aria-label="Dashboard sections"
          className="overflow-x-auto px-5 py-2 [scrollbar-width:none] lg:mt-5 lg:overflow-y-auto lg:overflow-x-hidden lg:px-0 lg:py-0"
        >
          <ul className="flex gap-1 lg:flex-col">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id} className="shrink-0">
                  <a
                    href={`#${item.id}`}
                    onClick={() => {
                      lockUntil.current = Date.now() + 800;
                      setActive(item.id);
                    }}
                    aria-current={isActive ? "location" : undefined}
                    className={`flex min-h-10 items-center gap-3 whitespace-nowrap rounded-lg px-3 text-sm ${
                      isActive
                        ? "bg-pf-tint font-medium"
                        : "text-pf-muted hover:bg-pf-tint"
                    }`}
                  >
                    <NavIcon name={item.icon} />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto hidden px-3 pt-6 text-xs text-pf-muted lg:block">
          <p>Signed in as</p>
          <p className="break-all text-pf-fg">{email}</p>
          <p className="mt-1">{tier === "PRO" ? "Pro" : "Free"} plan</p>
        </div>
      </div>
    </aside>
  );
}
