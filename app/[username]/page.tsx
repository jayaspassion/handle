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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublishedProfile(username);
  if (!profile) return { title: "Profile not found" };

  const name = profile.fullName ?? profile.username ?? username;
  return {
    title: `${name} | Handle`,
    description: profile.headline ?? undefined,
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="border-b border-gray-200 pb-2 text-xl font-semibold">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Chips({ items, label }: { items: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel={LINK_REL}
      className="text-purple-700 hover:underline"
    >
      {children}
    </a>
  );
}

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
      <Section title="Experience">
        <ul className="space-y-6">
          {profile.experiences.map((e) => (
            <li key={e.id}>
              <h3 className="font-medium">{e.role}</h3>
              <p className="text-sm">
                {e.company}
                {e.location ? ` · ${e.location}` : ""}
              </p>
              <p className="text-sm text-gray-600">
                {formatRange(e.startDate, e.endDate)}
              </p>
              {e.description && (
                <p className="mt-2 whitespace-pre-line text-sm">
                  {e.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Section>
    ),

    education: profile.education.length > 0 && (
      <Section title="Education">
        <ul className="space-y-6">
          {profile.education.map((e) => (
            <li key={e.id}>
              <h3 className="font-medium">
                {e.degree}
                {e.fieldOfStudy ? `, ${e.fieldOfStudy}` : ""}
              </h3>
              <p className="text-sm">{e.institution}</p>
              <p className="text-sm text-gray-600">
                {formatRange(e.startDate, e.endDate)}
              </p>
              {e.description && (
                <p className="mt-2 whitespace-pre-line text-sm">
                  {e.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Section>
    ),

    projects: profile.projects.length > 0 && (
      <Section title="Projects">
        <ul className="space-y-6">
          {profile.projects.map((p) => {
            const live = safeUrl(p.liveUrl);
            const repo = safeUrl(p.repoUrl);
            return (
              <li key={p.id}>
                <h3 className="font-medium">{p.title}</h3>
                {p.description && (
                  <p className="mt-1 whitespace-pre-line text-sm">
                    {p.description}
                  </p>
                )}
                {p.tags.length > 0 && (
                  <div className="mt-2">
                    <Chips items={p.tags} label="Tags" />
                  </div>
                )}
                {(live || repo) && (
                  <p className="mt-2 flex gap-4 text-sm">
                    {live && <ExternalLink href={live}>Live</ExternalLink>}
                    {repo && <ExternalLink href={repo}>Source</ExternalLink>}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Section>
    ),

    skills: profile.skills.length > 0 && (
      <Section title="Skills">
        {hasCategories ? (
          <div className="space-y-4">
            {orderedGroups.map(([category, names]) => (
              <div key={category || "other"}>
                <h3 className="mb-2 text-sm font-medium text-gray-700">
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
      <Section title="Certifications">
        <ul className="space-y-4">
          {profile.certifications.map((c) => {
            const credential = safeUrl(c.credentialUrl);
            const dates = [
              c.issueDate ? `Issued ${formatMonth(c.issueDate)}` : null,
              c.expiryDate ? `Expires ${formatMonth(c.expiryDate)}` : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={c.id}>
                <h3 className="font-medium">{c.name}</h3>
                <p className="text-sm">{c.issuer}</p>
                {dates && <p className="text-sm text-gray-600">{dates}</p>}
                {credential && (
                  <p className="mt-1 text-sm">
                    <ExternalLink href={credential}>View credential</ExternalLink>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Section>
    ),

    testimonials: profile.testimonials.length > 0 && (
      <Section title="Testimonials">
        <ul className="space-y-6">
          {profile.testimonials.map((t) => {
            const byline = [t.authorRole, t.authorCompany]
              .filter(Boolean)
              .join(" at ");
            return (
              <li key={t.id}>
                <blockquote>
                  <p className="whitespace-pre-line text-sm italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-2 text-sm">
                    <span className="font-medium">{t.authorName}</span>
                    {byline && (
                      <span className="text-gray-600"> · {byline}</span>
                    )}
                  </footer>
                </blockquote>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-gray-600">
          Testimonials are shared by the profile owner and have not been
          independently verified.
        </p>
      </Section>
    ),
  };

  // Owner's chosen order first, then any section missing from it
  const order = [...new Set([...profile.sectionOrder, ...DEFAULT_ORDER])];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xl font-semibold text-purple-800"
        >
          {initials(name)}
        </div>
        <div>
          <h1 className="text-3xl font-semibold">{name}</h1>
          {profile.headline && <p className="mt-1 text-lg">{profile.headline}</p>}
          {profile.location && (
            <p className="text-sm text-gray-600">{profile.location}</p>
          )}
        </div>
      </header>

      {profile.bio && <p className="mt-6 whitespace-pre-line">{profile.bio}</p>}

      {(links.length > 0 || resumeUrl) && (
        <nav aria-label="Profile links">
          <ul className="mt-6 flex flex-wrap gap-4 text-sm">
            {resumeUrl && (
              <li>
                <ExternalLink href={resumeUrl}>Resume</ExternalLink>
              </li>
            )}
            {links.map((l) => (
              <li key={l.id}>
                <ExternalLink href={l.url}>{l.label}</ExternalLink>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {order.map((key) => (
        <Fragment key={key}>{sections[key]}</Fragment>
      ))}

      <footer className="mt-16 border-t border-gray-200 pt-4 text-xs text-gray-600">
        Made with{" "}
        <Link href="/" className="text-purple-700 hover:underline">
          Handle
        </Link>
      </footer>
    </main>
  );
}