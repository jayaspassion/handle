import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";

const btnSolid =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-pf-solid px-6 font-medium text-pf-solid-fg hover:opacity-90 motion-safe:transition-opacity";
const btnOutline =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-pf-border px-6 font-medium hover:bg-pf-surface motion-safe:transition-colors";

const features = [
  {
    title: "Your own page",
    text: "Claim a handle and share one link with recruiters, clients and friends.",
  },
  {
    title: "Everything in one place",
    text: "Experience, education, projects, skills, certifications, testimonials and links.",
  },
  {
    title: "Light and dark",
    text: "Your page looks good in both themes and prints cleanly as a one-page resume.",
  },
];

const steps = [
  "Sign up for free",
  "Fill in your details",
  "Publish and share your link",
];

export default function Home() {
  return (
    <div className="flex-1 bg-pf-bg text-pf-fg">
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
        <section aria-labelledby="hero-heading" className="text-center">
          <h1
            id="hero-heading"
            className="text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            Your professional story, one link.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pf-muted">
            Handle lets you build a clean portfolio page in minutes and share it
            at <span className="font-medium text-pf-fg">handle.com/yourname</span>.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Show when="signed-out">
              <SignUpButton>
                <button type="button" className={`${btnSolid} cursor-pointer`}>
                  Create your page
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className={btnSolid}>
                Go to your dashboard
              </Link>
            </Show>
          </div>
        </section>

        <section
          aria-labelledby="features-heading"
          className="mt-20 border-t border-pf-border pt-12"
        >
          <h2 id="features-heading" className="sr-only">
            Features
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <li
                key={f.title}
                className="rounded-xl border border-pf-border bg-pf-surface p-5"
              >
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-pf-muted">
                  {f.text}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="steps-heading"
          className="mt-16 border-t border-pf-border pt-12"
        >
          <h2 id="steps-heading" className="text-2xl font-semibold">
            How it works
          </h2>
          <ol className="mt-6 space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pf-avatar-bg font-semibold text-pf-avatar-fg"
                >
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 rounded-xl border border-pf-border bg-pf-surface p-8 text-center">
          <h2 className="text-2xl font-semibold">Ready to stand out?</h2>
          <div className="mt-6 flex justify-center">
            <Show when="signed-out">
              <SignUpButton>
                <button type="button" className={`${btnSolid} cursor-pointer`}>
                  Get started free
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className={btnOutline}>
                Open dashboard
              </Link>
            </Show>
          </div>
        </section>

        <footer className="mt-16 flex flex-wrap items-center gap-4 border-t border-pf-border pt-4 text-xs text-pf-muted">
          <span>&copy; {new Date().getFullYear()} Handle</span>
          <Link href="/privacy" className="underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
        </footer>
      </main>
    </div>
  );
}