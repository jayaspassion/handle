"use client";

import Link from "next/link";

// Shown when a page throws. The error details stay in the server logs.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl flex-1 px-5 py-20 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">
        We couldn&apos;t load this page
      </h1>
      <p className="mt-3 text-pf-muted">
        Try again in a moment. If it keeps happening, let us know.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Back to Handle
        </Link>
      </div>
    </main>
  );
}
