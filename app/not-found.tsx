import Link from "next/link";

// Any unknown address outside /<username>
export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl flex-1 px-5 py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">Page not found</h1>
      <p className="mt-3 text-pf-muted">
        This page doesn&apos;t exist. Check the address, or head back home.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Back to Handle
      </Link>
    </main>
  );
}
