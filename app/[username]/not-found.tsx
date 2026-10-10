import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">
        Profile not found
      </h1>
      <p className="mt-3 text-pf-muted">
        This profile doesn&apos;t exist or hasn&apos;t been published.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Back to Handle
      </Link>
    </main>
  );
}