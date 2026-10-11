import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";

const HOST = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /^https?:\/\//,
  "",
);

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
  { title: "Sign up", text: "Create a free account in seconds." },
  { title: "Fill in your details", text: "Add your story, work and links." },
  { title: "Publish", text: "Pick a handle and share your link." },
];

function PreviewCard() {
  const cover = (angle: number) =>
    `linear-gradient(${angle}deg, color-mix(in srgb, var(--pf-brand) 32%, var(--pf-tint)), var(--pf-tint))`;
  return (
    <div aria-hidden="true" className="card card-accent p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pf-avatar-bg font-serif text-xl text-pf-avatar-fg">
          AM
        </div>
        <div>
          <p className="font-serif text-xl">Alex Morgan</p>
          <p className="text-sm text-pf-muted">Product designer</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-pf-muted">
        Designing calm, useful products and helping teams ship them.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="chip">Figma</span>
        <span className="chip">Research</span>
        <span className="chip">Prototyping</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[135, 225].map((angle, i) => (
          <div key={angle} className="overflow-hidden rounded-lg border border-pf-border">
            <div className="h-12" style={{ backgroundImage: cover(angle) }} />
            <div className="p-3">
              <p className="font-serif text-sm">{i === 0 ? "Atlas app" : "Design system"}</p>
              <p className="mt-0.5 text-xs text-pf-muted">
                {i === 0 ? "Mobile redesign" : "Tokens and docs"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex-1">
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-6 sm:px-8 sm:pt-12">
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14"
        >
          <div>
            <p className="eyebrow">Portfolio builder</p>
            <h1
              id="hero-heading"
              className="mt-3 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl"
            >
              Your professional story, one link.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-pf-muted">
              Build a clean portfolio page in minutes and share it at{" "}
              <span className="font-medium text-pf-fg">{HOST}/yourname</span>.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Show when="signed-out">
                <SignUpButton>
                  <button type="button" className="btn btn-primary">
                    Create your page
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="btn btn-primary">
                  Go to your dashboard
                </Link>
              </Show>
            </div>
          </div>
          <PreviewCard />
        </section>

        {/* Features */}
        <section aria-labelledby="features-heading" className="mt-20">
          <p className="eyebrow">Why Handle</p>
          <h2
            id="features-heading"
            className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl"
          >
            Everything a portfolio needs.
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <li key={f.title} className="card card-accent">
                <h3 className="font-serif text-xl">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-pf-muted">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section aria-labelledby="steps-heading" className="mt-20">
          <p className="eyebrow">How it works</p>
          <h2
            id="steps-heading"
            className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl"
          >
            Live in three steps.
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pf-tint font-serif text-lg text-pf-accent"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-medium">{s.title}</h3>
                  <p className="mt-1 text-sm text-pf-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Closing band */}
        <section className="mt-20 rounded-xl bg-pf-tint p-8 sm:p-10">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">Get started</p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
                Ready to stand out?
              </h2>
              <p className="mt-2 max-w-md text-pf-muted">
                It&apos;s free to start. Your page can be live in minutes.
              </p>
            </div>
            <div>
              <Show when="signed-out">
                <SignUpButton>
                  <button type="button" className="btn btn-primary">
                    Get started free
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="btn btn-primary">
                  Open dashboard
                </Link>
              </Show>
            </div>
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
