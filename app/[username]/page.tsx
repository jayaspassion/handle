import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProfile } from "@/lib/public-profile";
import { CONTACT_EMAIL, SITE_URL, isHttpUrl } from "@/lib/url";
import { resolveSectionOrder } from "@/lib/sections";
import ProjectsSection from "@/app/_components/projects-carousel";
import { OwnerAppearance } from "@/app/_components/sync-color-mode";
import { ownerAppearanceScript } from "@/app/_components/color-mode";

type Props = { params: Promise<{ username: string }> };

const LINK_REL = "nofollow ugc noopener noreferrer";
const BLOCK = "mt-1";
const PANEL = "panel print:border-0 print:bg-transparent print:p-0";
const textLink =
  "inline-flex items-center gap-1.5 font-medium text-pf-accent underline-offset-4 hover:underline";
const heroLink =
  "inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4 hover:text-pf-accent";

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
    alternates: { canonical: `/${profile.username}` },
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

/* ---------- Icons (decorative) ---------- */

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function PinIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg {...iconProps}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.5 6C6.5 7 4 9.8 4 13.5V18h6v-6H7c.2-1.8 1.4-3.2 3-3.8L9.5 6Zm9 0c-3 1-5.5 3.8-5.5 7.5V18h6v-6h-3c.2-1.8 1.4-3.2 3-3.8L18.5 6Z" />
    </svg>
  );
}

// Known sites get their logo, everything else a generic link icon
function LinkIcon({ url }: { url: string }) {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    host = "";
  }
  if (host === "github.com") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    );
  }
  if (host.endsWith("linkedin.com")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  return (
    <svg {...iconProps} width={16} height={16}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  );
}

/* ---------- Building blocks ---------- */

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
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`${PANEL} min-w-0 scroll-mt-8`}
    >
      <p className="eyebrow" aria-hidden="true">
        {eyebrow}
      </p>
      <h2
        id={`${id}-heading`}
        className="mt-1 font-serif text-[1.75rem] leading-9 tracking-tight"
      >
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MiniSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="min-w-0">
      <h2 id={`${id}-heading`} className="eyebrow">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Education and certifications share one panel, with a thin divider between them
function Pair({ left, right }: { left: ReactNode; right: ReactNode }) {
  if (!left && !right) return null;
  const both = Boolean(left && right);
  return (
    <div
      className={`${BLOCK} ${PANEL} grid gap-8 ${both ? "lg:grid-cols-2 lg:gap-0" : ""}`}
    >
      {left && (
        <div className={`min-w-0 ${both ? "lg:border-r lg:border-pf-border lg:pr-8" : ""}`}>
          {left}
        </div>
      )}
      {right && <div className={`min-w-0 ${both ? "lg:pl-8" : ""}`}>{right}</div>}
    </div>
  );
}

function Chips({ items, label }: { items: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="chip">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Timeline({ children }: { children: ReactNode }) {
  return (
    <ol className="relative space-y-8 border-l border-pf-border pl-6">
      {children}
    </ol>
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
  // Long descriptions start collapsed; short ones are simply shown
  const long =
    !!description && (description.length > 140 || description.includes("\n"));
  const text =
    "mt-2 whitespace-pre-line break-words text-sm leading-relaxed";
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className="absolute -left-[1.85rem] top-2 h-2.5 w-2.5 rounded-full bg-pf-brand ring-4 [--tw-ring-color:var(--pf-panel)]"
      />
      <p className="text-sm text-pf-muted">{range}</p>
      <h3 className="mt-0.5 break-words font-serif text-lg">{title}</h3>
      {subtitle && <p className="text-sm text-pf-muted">{subtitle}</p>}
      {description && !long && <p className={text}>{description}</p>}
      {description && long && (
        <>
          <details className="group mt-2 print:hidden">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-pf-accent hover:underline [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Show details</span>
              <span className="hidden group-open:inline">Hide details</span>
              <span className="sr-only"> for {title}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="motion-safe:transition-transform group-open:rotate-180"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <p className={text}>{description}</p>
          </details>
          {/* Printed pages always show the full text */}
          <p className={`${text} hidden print:block`}>{description}</p>
        </>
      )}
    </li>
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
  const hasProjects = profile.projects.length > 0;

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

  const experience = profile.experiences.length > 0 && (
    <Section id="experience" eyebrow="Career" title="Experience">
      <Timeline>
        {profile.experiences.map((e) => (
          <TimelineItem
            key={e.id}
            range={formatRange(e.startDate, e.endDate)}
            title={e.role}
            subtitle={[e.company, e.location].filter(Boolean).join(" | ")}
            description={e.description}
          />
        ))}
      </Timeline>
    </Section>
  );

  const skills = profile.skills.length > 0 && (
    <Section id="skills" eyebrow="Toolbox" title="Skills">
      {hasCategories ? (
        <dl className="divide-y divide-pf-border border-y border-pf-border">
          {orderedGroups.map(([category, names]) => (
            <div
              key={category || "other"}
              className="grid gap-2 py-3 sm:grid-cols-[9rem_1fr] sm:gap-6"
            >
              <dt className="text-sm font-medium">{category || "Other"}</dt>
              <dd>
                <Chips items={names} />
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <Chips items={profile.skills.map((s) => s.name)} />
      )}
    </Section>
  );

  const education = profile.education.length > 0 && (
    <MiniSection id="education" title="Education">
      <ul className="space-y-5">
        {profile.education.map((e) => (
          <li key={e.id}>
            <h3 className="break-words font-serif text-lg">
              {e.degree}
              {e.fieldOfStudy ? `, ${e.fieldOfStudy}` : ""}
            </h3>
            <p className="text-sm text-pf-muted">
              {[
                e.institution,
                e.location,
                formatRange(e.startDate, e.endDate),
                e.gpa ? (/^\d/.test(e.gpa) ? `GPA ${e.gpa}` : e.gpa) : null,
              ]
                .filter(Boolean)
                .join(" | ")}
            </p>
            {e.description && (
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">
                {e.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </MiniSection>
  );

  const certifications = profile.certifications.length > 0 && (
    <MiniSection id="certifications" title="Certifications">
      <ul className="space-y-5">
        {profile.certifications.map((c) => {
          const credential = safeUrl(c.credentialUrl);
          const dates = [
            c.issueDate ? `Issued ${formatMonth(c.issueDate)}` : null,
            c.expiryDate ? `Expires ${formatMonth(c.expiryDate)}` : null,
          ]
            .filter(Boolean)
            .join(" | ");
          return (
            <li key={c.id}>
              <h3 className="break-words font-serif text-lg">{c.name}</h3>
              <p className="text-sm text-pf-muted">
                {[c.issuer, dates].filter(Boolean).join(" | ")}
              </p>
              {credential && (
                <p className="mt-1 text-sm">
                  <ExternalLink href={credential} className={textLink}>
                    View credential
                  </ExternalLink>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </MiniSection>
  );

  const projectsNode = hasProjects && (
          <div className={BLOCK}>
            <ProjectsSection id="projects" eyebrow="Selected work" title="Projects">
                {profile.projects.map((p) => {
                  const live = safeUrl(p.liveUrl);
                  const repo = safeUrl(p.repoUrl);
                  return (
                    <li
                      key={p.id}
                      className={`shrink-0 snap-start print:w-full ${
                        profile.projects.length === 1
                          ? "w-full"
                          : "w-[88%] sm:w-[calc(50%-0.625rem)]"
                      }`}
                    >
                      <article className="card card-accent flex h-full flex-col bg-pf-surface p-0 sm:flex-row">
                        {p.coverImageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.coverImageUrl}
                            alt={`Screenshot of ${p.title}`}
                            loading="lazy"
                            className="h-40 w-full object-cover sm:h-auto sm:w-2/5 sm:shrink-0"
                          />
                        )}
                        <div className="flex min-w-0 flex-1 flex-col p-4">
                          <h3 className="break-words font-serif text-lg">{p.title}</h3>
                          {p.description && (
                            <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-pf-muted">
                              {p.description}
                            </p>
                          )}
                          {p.tags.length > 0 && (
                            <div className="mt-4">
                              <Chips items={p.tags} label="Tags" />
                            </div>
                          )}
                          {(live || repo) && (
                            <p className="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-5 text-sm">
                              {live && (
                                <ExternalLink href={live} className={textLink}>
                                  Live site
                                  <ArrowIcon />
                                </ExternalLink>
                              )}
                              {repo && (
                                <ExternalLink href={repo} className={textLink}>
                                  Source code
                                  <ArrowIcon />
                                </ExternalLink>
                              )}
                            </p>
                          )}
                        </div>
                      </article>
                    </li>
                  );
                })}
            </ProjectsSection>
          </div>
        );

  const testimonialsNode = profile.testimonials.length > 0 && (
          <div className={BLOCK}>
            <ul className="space-y-3" aria-label="Testimonials">
              {profile.testimonials.map((t) => {
                const byline = [t.authorRole, t.authorCompany]
                  .filter(Boolean)
                  .join(" at ");
                return (
                  <li key={t.id} className="card card-accent p-5">
                    <figure className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
                      <div className="flex min-w-0 flex-1 gap-4">
                        <span className="shrink-0 text-pf-brand">
                          <QuoteIcon />
                        </span>
                        <blockquote className="min-w-0">
                          <p className="whitespace-pre-line break-words font-serif text-lg italic leading-relaxed">
                            {t.quote}
                          </p>
                        </blockquote>
                      </div>
                      <figcaption className="flex items-center gap-3 md:w-60 md:shrink-0 md:border-l md:border-pf-border md:pl-8">
                        <span
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pf-avatar-bg text-sm font-semibold text-pf-avatar-fg"
                        >
                          {initials(t.authorName)}
                        </span>
                        <span className="min-w-0 text-sm">
                          <span className="block font-medium">{t.authorName}</span>
                          {byline && (
                            <span className="block text-pf-muted">{byline}</span>
                          )}
                        </span>
                      </figcaption>
                    </figure>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-pf-muted">
              Testimonials are shared by the profile owner and have not been
              independently verified.
            </p>
          </div>
        );

  const renderOrder = resolveSectionOrder(profile.sectionOrder);

  return (
    <div
      data-pf-theme={profile.theme}
      data-pf-font={profile.font}
      className="profile-theme relative isolate flex-1 overflow-hidden bg-pf-bg font-sans text-pf-fg antialiased"
    >
      <script
        dangerouslySetInnerHTML={{
          __html: ownerAppearanceScript({
            mode: profile.colorMode,
            theme: profile.theme,
            font: profile.font,
          }),
        }}
      />
      <OwnerAppearance mode={profile.colorMode} theme={profile.theme} font={profile.font} />
      <main className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
        {/* Hero */}
        <header className={`${PANEL} grid items-center gap-8 md:items-start md:grid-cols-[1fr_14rem] md:gap-10 lg:grid-cols-[1fr_16rem]`}>
          <div className="order-2 min-w-0 text-center md:order-1 md:text-left">
            {profile.openToWork && (
              <p className="mb-3">
                <span className="badge badge-success">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                  Open to opportunities
                </span>
              </p>
            )}
            <h1 className="break-words font-serif text-4xl leading-[1.17] tracking-tight md:text-5xl md:leading-[1.17]">
              {name}
            </h1>
            {profile.headline && (
              <p className="mt-2 break-words font-serif text-lg md:text-2xl">
                {profile.headline}
              </p>
            )}
            {profile.bio && (
              <p className="mt-4 max-w-xl whitespace-pre-line break-words text-left text-[0.9375rem] leading-relaxed text-pf-muted">
                {profile.bio}
              </p>
            )}
            {profile.location && (
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-pf-muted md:justify-start">
                <PinIcon />
                {profile.location}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              {hasProjects && (
                <a href="#projects" className="btn btn-primary print:hidden">
                  View my work
                  <ArrowIcon />
                </a>
              )}
              {resumeUrl && (
                <ExternalLink
                  href={resumeUrl}
                  className={`btn ${hasProjects ? "btn-outline" : "btn-primary"}`}
                >
                  <DocIcon />
                  View resume
                </ExternalLink>
              )}
              {links.length > 0 && (
                <nav aria-label="Profile links">
                  <ul className="flex flex-wrap items-center justify-center gap-x-5 md:justify-start">
                    {links.map((l) => (
                      <li key={l.id}>
                        <ExternalLink href={l.url} className={heroLink}>
                          <LinkIcon url={l.url} />
                          {l.label}
                        </ExternalLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </div>

          <div className="order-1 mx-auto w-28 sm:w-40 md:order-2 md:mx-0 md:w-full">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={`Photo of ${name}`}
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex aspect-[4/5] w-full items-center justify-center rounded-xl border border-pf-border font-serif text-6xl text-pf-avatar-fg"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, color-mix(in srgb, var(--pf-brand) 30%, var(--pf-tint)), var(--pf-tint))",
                }}
              >
                {initials(name)}
              </div>
            )}
          </div>
        </header>

        {renderOrder.map((key, i) => {
          switch (key) {
            case "projects":
              return <Fragment key={key}>{projectsNode}</Fragment>;
            case "experience":
              return experience ? (
                <div key={key} className={BLOCK}>
                  {experience}
                </div>
              ) : null;
            case "skills":
              return skills ? (
                <div key={key} className={BLOCK}>
                  {skills}
                </div>
              ) : null;
            case "testimonials":
              return <Fragment key={key}>{testimonialsNode}</Fragment>;
            case "education":
              // Education and certifications share one box when they are neighbours
              return renderOrder[i + 1] === "certifications" ? (
                <Pair key={key} left={education} right={certifications} />
              ) : (
                <Pair key={key} left={education} right={null} />
              );
            case "certifications":
              return renderOrder[i - 1] === "education" ? null : (
                <Pair key={key} left={null} right={certifications} />
              );
          }
        })}

        {/* Closing band: links only, never an email address */}
        {(links.length > 0 || resumeUrl) && (
          <section
            id="connect"
            aria-labelledby="connect-heading"
            className={`${BLOCK} scroll-mt-8 rounded-xl bg-pf-tint p-6 sm:p-8 print:hidden`}
          >
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <p className="eyebrow" aria-hidden="true">
                  Get in touch
                </p>
                <h2
                  id="connect-heading"
                  className="mt-1 font-serif text-[1.75rem] leading-9 tracking-tight"
                >
                  Let&apos;s connect.
                </h2>
                <p className="mt-3 max-w-md text-pf-muted">
                  Find {name} elsewhere on the web.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                {resumeUrl && (
                  <ExternalLink href={resumeUrl} className="btn btn-primary">
                    <DocIcon />
                    View resume
                  </ExternalLink>
                )}
                {links.length > 0 && (
                  <ul className="flex flex-wrap gap-x-5 md:justify-end">
                    {links.map((l) => (
                      <li key={l.id}>
                        <ExternalLink href={l.url} className={heroLink}>
                          <LinkIcon url={l.url} />
                          {l.label}
                        </ExternalLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-pf-border pt-4 text-xs text-pf-muted print:hidden">
          <p>
            Made with{" "}
            <Link href="/" className={textLink}>
              Handle
            </Link>
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
              `Report: ${SITE_URL}/${profile.username}`,
            )}`}
            className="underline-offset-4 hover:underline"
          >
            Report this page
          </a>
        </footer>
      </main>
    </div>
  );
}
