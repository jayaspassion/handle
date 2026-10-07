import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Profile not found</h1>
      <p className="mt-2 text-gray-600">
        This profile doesn&apos;t exist or hasn&apos;t been published.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-purple-700 hover:underline"
      >
        Back to Handle
      </Link>
    </main>
  );
}