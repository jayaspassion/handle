import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const HOST = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /^https?:\/\//,
  "",
);

const features = [
  {
    title: "Every section you need",
    text: "Experience, projects, skills, testimonials and more, with photo, resume and project image uploads.",
  },
  {
    title: "Arranged your way",
    text: "Reorder items and choose the order of sections on your page.",
  },
  {
    title: "Light, dark and print",
    text: "Looks good in both themes and prints as a clean resume.",
  },
];

const steps = ["Sign up", "Add details", "Publish"];

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-pf-accent"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// A miniature of the public page: hero with a 4:5 photo, then a project row
function PreviewCard() {
  const cover = (angle: number) =>
    `linear-gradient(${angle}deg, color-mix(in srgb, var(--pf-brand) 32%, var(--pf-tint)), var(--pf-tint))`;
  return (
    <div aria-hidden="true" className="card card-accent p-4">
      <div className="panel grid grid-cols-[1fr_5.5rem] items-start gap-4 p-4">
        <div className="min-w-0">
          <p className="font-serif text-2xl leading-tight">Alex Morgan</p>
          <p className="mt-1 font-serif text-sm">Product designer</p>
          <p className="mt-2 text-xs leading-relaxed text-pf-muted">
            Designing calm, useful products and helping teams ship them.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="chip">Figma</span>
            <span className="chip">Research</span>
          </div>
        </div>
        <div
          className="flex aspect-[4/5] w-full items-center justify-center rounded-lg font-serif text-2xl text-pf-avatar-fg"
          style={{ backgroundImage: cover(135) }}
        >
          AM
        </div>
      </div>
      <div className="panel -mt-px p-4">
        <p className="eyebrow">Projects</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {[
            ["Atlas app", "Mobile redesign", 135],
            ["Design system", "Tokens and docs", 225],
          ].map(([title, text, angle]) => (
            <div
              key={title}
              className="flex overflow-hidden rounded-lg border border-pf-border"
            >
              <div className="w-10 shrink-0" style={{ backgroundImage: cover(Number(angle)) }} />
              <div className="min-w-0 p-2.5">
                <p className="truncate font-serif text-sm">{title}</p>
                <p className="truncate text-xs text-pf-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-4 sm:px-8 sm:py-5 lg:py-8">
        <section
          aria-labelledby="hero-heading"
          className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14"
        >
          <div>
            <p className="eyebrow">Portfolio builder</p>
            <h1
              id="hero-heading"
              className="mt-2 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl"
            >
              Your professional story, one link.
            </h1>
            <p className="mt-3 max-w-lg text-pf-muted sm:text-lg">
              Build a clean portfolio page in minutes and share it at{" "}
              <span className="font-medium text-pf-fg">{HOST}/yourname</span>.
            </p>

            <div className="mt-5">
              <Show when="signed-out">
                <SignUpButton>
                  <button type="button" className="btn btn-primary">
                    Create your page, free
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="btn btn-primary">
                  Go to your dashboard
                </Link>
              </Show>
            </div>

            <ul className="mt-5 grid max-w-lg gap-2 sm:mt-6 sm:gap-2.5">
              {features.map((f) => (
                <li key={f.title} className="flex gap-2.5 text-sm leading-snug">
                  <CheckIcon />
                  <p>
                    <span className="font-medium">{f.title}.</span>{" "}
                    <span className="text-pf-muted">{f.text}</span>
                  </p>
                </li>
              ))}
            </ul>

            <ol
              aria-label="How it works"
              className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-pf-border pt-4 text-sm sm:mt-6"
            >
              {steps.map((s, i) => (
                <li key={s} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-pf-tint font-serif text-pf-accent"
                  >
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          <div className="hidden lg:block">
            <PreviewCard />
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-4 px-5 pb-4 text-xs text-pf-muted sm:px-8">
        <span>&copy; {new Date().getFullYear()} Handle</span>
        <Link href="/privacy" className="underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms" className="underline-offset-4 hover:underline">
          Terms of Use
        </Link>
      </footer>
    </div>
  );
}
