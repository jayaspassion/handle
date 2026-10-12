import Link from "next/link";
import type { ReactNode } from "react";

// Shared layout for the privacy policy and terms of use
export const legalH2 = "mt-10 font-serif text-2xl tracking-tight";
export const legalP = "mt-3 leading-relaxed";
export const legalList = "mt-3 list-disc space-y-1.5 pl-5 leading-relaxed";
export const legalLink = "text-pf-accent underline underline-offset-4 hover:no-underline";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex-1">
      <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-pf-muted">Last updated: {updated}</p>
        {children}
        <nav
          aria-label="Legal pages"
          className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-pf-border pt-4 text-sm"
        >
          <Link href="/" className={legalLink}>
            Home
          </Link>
          <Link href="/privacy" className={legalLink}>
            Privacy Policy
          </Link>
          <Link href="/terms" className={legalLink}>
            Terms of Use
          </Link>
        </nav>
      </main>
    </div>
  );
}
