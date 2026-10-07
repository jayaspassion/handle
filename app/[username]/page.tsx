import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProfile } from "@/lib/public-profile";
import { isHttpUrl } from "@/lib/url";

type Props = { params: Promise<{ username: string }> };

const DEFAULT_ORDER = [
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "testimonials",
];

const LINK_REL = "nofollow ugc noopener noreferrer";

const pill =
  "inline-flex min-h-11 items-center rounded-full border border-pf-border px-4 text-sm font-medium hover:bg-pf-surface motion-safe:transition-colors";
const pillSolid =
  "inline-flex min-h-11 items-center rounded-full bg-pf-solid px-4 text-sm font-medium text-pf-solid-fg hover:opacity-90 motion-safe:transition-opacity";
const smallButton =
  "inline-flex min-h-10 items-center rounded-md border border-pf-border px-3 text-sm hover:bg-pf-bg motion-safe:transition-colors";
const textLink = "text-pf-accent underline-offset-4 hover:underline";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublishedProfile(username);
  if (!profile) return { title: "Profile not found" };

  const name = profile.fullName ?? profile.username ?? username;
  const title = `${name} | Handle`;
  const description = profile.headline ?? `${name}'s portfolio on Handle`;

  return {
    title,
    description,
    openGraph: { title, description, type: "profile", siteName: "Handle" },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Links were validated on save, but we check again before rendering anything
function safeUrl(url: string | null) {
  return url && isHttpUrl(url) ? url : null;
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatRange(start: Date, end: Date | null) {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Present"}`;
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel={LINK_REL} className={className}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="mt-12 border-t border-pf-border pt-8"
    >
      <h2
        id={`${id}-heading`}
        className="text-sm font-semibold uppercase tracking-wider text-pf-muted"
      >
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Chips({ items, label }: { items: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-pf-border px-3 py-1 text-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function TimelineItem({
  range,
  title,
  subtitle,
  description,
}: {
  range: string;
  title: string;
  subtitle?: string;
  description?: string | null;
}) {
  return (
    <li className="grid gap-1 md:grid-cols-[11rem_1fr] md:gap-8">
      <p className="text-sm text-pf-muted md:pt-0.5">{range}</p>
      <div className="min-w-0">
        <h3 className="font-medium">{title}</h3>
        {subtitle && <p className="text-sm text-pf-muted">{subtitle}</p>}
        {description && (
          <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </li>
  );
}

const card = "flex min-w-0 flex-col rounded-xl border border-pf-border bg-pf-surface p-5";

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublishedProfile(username);

  // Unpublished and nonexistent look identical, so usernames can't be probed
  if (!profile) notFound();

  const name = profile.fullName ?? profile.username ?? "Profile";
  const resumeUrl = safeUrl(profile.resumeUrl);
  const links = profile.links.filter((l) => safeUrl(l.url));

  // Skills grouped by category, uncategorized last
  const groups = new Map<string, string[]>();
  for (const skill of profile.skills) {
    const key = skill.category ?? "";
    groups.set(key, [...(groups.get(key) ?? []), skill.name]);
  }
  const hasCategories = [...groups.keys()].some((key) => key !== "");
  const orderedGroups = [...groups.entries()].sort(
    ([a], [b]) => Number(a === "") - Number(b === ""),
  );

  const sections: Record<string, ReactNode> = {
    experience: profile.experiences.length > 0 && (
      <Section id="experience" title="Experience">
        <ul className="space-y-8">
          {profile.experiences.map((e) => (
            <TimelineItem
              key={e.id}
              range={formatRange(e.startDate, e.endDate)}
              title={e.role}
              subtitle={[e.company, e.location].filter(Boolean).join(" · ")}
              description={e.description}
            />
          ))}
        </ul>
      </Section>
    ),

    education: profile.education.length > 0 && (
      <Section id="education" title="Education">
        <ul className="space-y-8">
          {profile.education.map((e) => (
            <TimelineItem
              key={e.id}
              range={formatRange(e.startDate, e.endDate)}
              title={`${e.degree}${e.fieldOfStudy ? `, ${e.fieldOfStudy}` : ""}`}
              subtitle={e.institution}
              description={e.description}
            />
          ))}
        </ul>
      </Section>
    ),

    projects: profile.projects.length > 0 && (
      <Section id="projects" title="Projects">
        <ul className="grid gap-4 sm:grid-cols-2">
          {profile.projects.map((p) => {
            const live = safeUrl(p.liveUrl);
            const repo = safeUrl(p.repoUrl);
            return (
              <li key={p.id} className={card}>
                <h3 className="font-medium">{p.title}</h3>
                {p.description && (
                  <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">
                    {p.description}
                  </p>
                )}
                {p.tags.length > 0 && (
                  <div className="mt-4">
                    <Chips items={p.tags} label="Tags" />
                  </div>
                )}
                {(live || repo) && (
                  <p className="mt-auto flex gap-2 pt-4">
                    {live && (
                      <ExternalLink href={live} className={smallButton}>
                        Live
                      </ExternalLink>
                    )}
                    {repo && (
                      <ExternalLink href={repo} className={smallButton}>
                        Source
                      </ExternalLink>
                    )}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Section>
    ),

    skills: profile.skills.length > 0 && (
      <Section id="skills" title="Skills">
        {hasCategories ? (
          <div className="space-y-5">
            {orderedGroups.map(([category, names]) => (
              <div key={category || "other"}>
                <h3 className="mb-2 text-sm font-medium">
                  {category || "Other"}
                </h3>
                <Chips items={names} />
              </div>
            ))}
          </div>
        ) : (
          <Chips items={profile.skills.map((s) => s.name)} />
        )}
      </Section>
    ),

    certifications: profile.certifications.length > 0 && (
      <Section id="certifications" title="Certifications">
        <ul className="grid gap-4 sm:grid-cols-2">
          {profile.certifications.map((c) => {
            const credential = safeUrl(c.credentialUrl);
            const dates = [
              c.issueDate ? `Issued ${formatMonth(c.issueDate)}` : null,
              c.expiryDate ? `Expires ${formatMonth(c.expiryDate)}` : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={c.id} className={card}>
                <h3 className="font-medium">{c.name}</h3>
                <p className="text-sm">{c.issuer}</p>
                {dates && <p className="text-sm text-pf-muted">{dates}</p>}
                {credential && (
                  <p className="mt-auto pt-3 text-sm">
                    <ExternalLink href={credential} className={textLink}>
                      View credential
                    </ExternalLink>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Section>
    ),

    testimonials: profile.testimonials.length > 0 && (
      <Section id="testimonials" title="Testimonials">
        <ul className="grid gap-4 md:grid-cols-2">
          {profile.testimonials.map((t) => {
            const byline = [t.authorRole, t.authorCompany]
              .filter(Boolean)
              .join(" at ");
            return (
              <li key={t.id} className={card}>
                <blockquote className="border-l-2 border-pf-accent pl-4">
                  <p className="whitespace-pre-line break-words text-sm italic leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-3 text-sm">
                    <span className="font-medium">{t.authorName}</span>
                    {byline && (
                      <span className="text-pf-muted"> · {byline}</span>
                    )}
                  </footer>
                </blockquote>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-pf-muted">
          Testimonials are shared by the profile owner and have not been
          independently verified.
        </p>
      </Section>
    ),
  };

  // Owner's chosen order first, then any section missing from it
  const order = [...new Set([...profile.sectionOrder, ...DEFAULT_ORDER])];

  return (
    <div className="profile-theme flex-1 bg-pf-bg font-sans text-pf-fg antialiased">
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <div
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-pf-avatar-bg text-2xl font-semibold text-pf-avatar-fg sm:h-24 sm:w-24 sm:text-3xl"
          >
            {initials(name)}
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-semibold tracking-tight sm:text-4xl">
              {name}
            </h1>
            {profile.headline && (
              <p className="mt-1 break-words text-lg">{profile.headline}</p>
            )}
            {profile.location && (
              <p className="mt-1 text-sm text-pf-muted">{profile.location}</p>
            )}
          </div>
        </header>

        {profile.bio && (
          <p className="mt-8 max-w-2xl whitespace-pre-line break-words leading-relaxed">
            {profile.bio}
          </p>
        )}

        {(links.length > 0 || resumeUrl) && (
          <nav aria-label="Profile links">
            <ul className="mt-6 flex flex-wrap gap-3">
              {resumeUrl && (
                <li>
                  <ExternalLink href={resumeUrl} className={pillSolid}>
                    Resume
                  </ExternalLink>
                </li>
              )}
              {links.map((l) => (
                <li key={l.id}>
                  <ExternalLink href={l.url} className={pill}>
                    {l.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {order.map((key) => (
          <Fragment key={key}>{sections[key]}</Fragment>
        ))}

        <footer className="mt-16 border-t border-pf-border pt-4 text-xs text-pf-muted print:hidden">
          Made with{" "}
          <Link href="/" className={textLink}>
            Handle
          </Link>
        </footer>
      </main>
    </div>
  );
}