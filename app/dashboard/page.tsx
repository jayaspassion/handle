import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ThemeToggle from "../_components/theme-toggle";
import DashboardNav from "./_components/dashboard-nav";
import DashboardSection from "./_components/dashboard-section";
import ProfileCompletion from "./_components/profile-completion";
import ReorderPanel from "./_components/reorder-panel";
import SectionOrderCard from "./_components/section-order-card";
import { resolveSectionOrder } from "@/lib/sections";
import { resolveColorMode, resolveFont, resolveTheme } from "@/lib/appearance";
import { AccountColorMode } from "../_components/sync-color-mode";
import { AppearanceCard, ChatEnabledCard, OpenToWorkCard } from "./_sections/appearance/section";
import PublishSection from "./_sections/publish/section";
import ProfileSection from "./_sections/profile/section";
import LinkForm from "./_sections/links/form";
import LinkList from "./_sections/links/list";
import ExperienceForm from "./_sections/experience/form";
import ExperienceList from "./_sections/experience/list";
import EducationForm from "./_sections/education/form";
import EducationList from "./_sections/education/list";
import ProjectForm from "./_sections/projects/form";
import ProjectList from "./_sections/projects/list";
import SkillsSection from "./_sections/skills/section";
import CertificationForm from "./_sections/certifications/form";
import CertificationList from "./_sections/certifications/list";
import TestimonialForm from "./_sections/testimonials/form";
import TestimonialList from "./_sections/testimonials/list";
import FeedbackLink from "../_components/feedback-link";
import BetaNote from "./_components/beta-note";

const byOrder = [{ order: "asc" as const }, { createdAt: "asc" as const }];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      profile: {
        include: {
          links: { orderBy: byOrder },
          experiences: { orderBy: { startDate: "desc" } },
          education: { orderBy: { startDate: "desc" } },
          projects: { orderBy: byOrder },
          skills: { orderBy: byOrder },
          certifications: { orderBy: byOrder },
          testimonials: { orderBy: byOrder },
        },
      },
    },
  });

  if (!user) {
    return (
      <main className="p-8">
        <p>Setting up your account. Refresh in a moment.</p>
      </main>
    );
  }

  const profile = user.profile;
  const skills = profile?.skills ?? [];
  const username = profile?.username ?? "";
  const isPublished = profile?.isPublished ?? false;

  // Categories already in use, offered as suggestions in the skill forms
  const skillCategories = [
    ...new Set(skills.map((s) => s.category).filter((c): c is string => !!c)),
  ];

  const completion = [
    { label: "Add a photo", done: !!profile?.avatarUrl, href: "#profile" },
    { label: "Write a bio", done: !!profile?.bio?.trim(), href: "#profile" },
    { label: "Add a project", done: (profile?.projects.length ?? 0) > 0, href: "#projects" },
    { label: "Add skills", done: skills.length > 0, href: "#skills" },
    { label: "Add links", done: (profile?.links.length ?? 0) > 0, href: "#links" },
    { label: "Add experience", done: (profile?.experiences.length ?? 0) > 0, href: "#experience" },
  ];

  return (
    <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">
      <AccountColorMode mode={resolveColorMode(profile?.colorMode)} />
      <DashboardNav email={user.email} tier={user.tier} />

      <main className="min-w-0 px-5 pb-12 pt-4 lg:px-6 lg:pt-6">
        <div className="mx-auto max-w-6xl">
          <header
            id="overview"
            className="flex scroll-mt-16 flex-wrap items-start justify-between gap-x-4 gap-y-3 lg:scroll-mt-6"
          >
            <div>
              <h1 className="font-serif text-3xl leading-9 tracking-tight">
                Your next chapter starts here.
              </h1>
              <p className="mt-1 text-pf-muted">Shape your story. Share your work.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {isPublished && username && (
                <a
                  href={`/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <span className="sm:hidden">Public page</span>
                  <span className="hidden sm:inline">View public page</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                  </svg>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              <FeedbackLink where="Dashboard" className="btn btn-outline btn-sm lg:hidden">
                Feedback
              </FeedbackLink>
              <ThemeToggle />
              <UserButton />
            </div>
          </header>
          <BetaNote />

          {/* Left: profile and sections. Right: publication and checklist.
              On small screens everything stacks: profile, rail, sections. */}
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start">
            <DashboardSection
              id="profile"
              title="Profile details"
              openOnPhones
              description="This information appears on your public portfolio."
            >
              <ProfileSection
                values={{
                  fullName: profile?.fullName ?? "",
                  headline: profile?.headline ?? "",
                  location: profile?.location ?? "",
                  bio: profile?.bio ?? "",
                }}
                avatarUrl={profile?.avatarUrl ?? null}
                resumeUrl={profile?.resumeUrl ?? null}
              />
            </DashboardSection>

            <div className="space-y-4 xl:col-start-2 xl:row-span-2 xl:row-start-1">
              <PublishSection
                username={username}
                isPublished={isPublished}
                hasName={!!profile?.fullName?.trim()}
                hasUploads={
                  !!profile?.avatarUrl ||
                  !!profile?.resumeUrl ||
                  !!profile?.projects.some((p) => p.coverImageUrl)
                }
              />
              <OpenToWorkCard value={profile?.openToWork ?? false} />
              <ChatEnabledCard value={profile?.chatEnabled ?? true} />
              <AppearanceCard
                theme={resolveTheme(profile?.theme)}
                font={resolveFont(profile?.font)}
                name={profile?.fullName ?? ""}
                headline={profile?.headline ?? ""}
              />
              <ProfileCompletion items={completion} />
              <SectionOrderCard order={resolveSectionOrder(profile?.sectionOrder)} />
            </div>

            <div className="space-y-5 xl:col-start-1">
              <DashboardSection
                id="links"
                title="Links"
                description="Where visitors can find you elsewhere."
              >
                <ReorderPanel
                  model="link"
                  items={(profile?.links ?? []).map((l) => ({ id: l.id, label: l.label }))}
                />
                <LinkList items={profile?.links ?? []} />
                <LinkForm />
              </DashboardSection>

              <DashboardSection
                id="projects"
                title="Projects"
                description="Showcase your best work."
              >
                <ReorderPanel
                  model="project"
                  items={(profile?.projects ?? []).map((p) => ({ id: p.id, label: p.title }))}
                />
                <ProjectList items={profile?.projects ?? []} />
                <ProjectForm />
              </DashboardSection>

              <DashboardSection
                id="experience"
                title="Experience"
                description="Your work history."
              >
                <ExperienceList items={profile?.experiences ?? []} />
                <ExperienceForm />
              </DashboardSection>

              <DashboardSection
                id="education"
                title="Education"
                description="Where you studied."
              >
                <EducationList items={profile?.education ?? []} />
                <EducationForm />
              </DashboardSection>

              <DashboardSection
                id="skills"
                title="Skills"
                description="Tools and technologies, grouped by category."
              >
                <SkillsSection items={skills} categories={skillCategories} />
              </DashboardSection>

              <DashboardSection
                id="certifications"
                title="Certifications"
                description="Showcase your professional certifications."
              >
                <ReorderPanel
                  model="certification"
                  items={(profile?.certifications ?? []).map((c) => ({ id: c.id, label: c.name }))}
                />
                <CertificationList items={profile?.certifications ?? []} />
                <CertificationForm />
              </DashboardSection>

              <DashboardSection
                id="testimonials"
                title="Testimonials"
                description="Kind words from people you've worked with."
              >
                <ReorderPanel
                  model="testimonial"
                  items={(profile?.testimonials ?? []).map((t) => ({ id: t.id, label: t.authorName }))}
                />
                <TestimonialList items={profile?.testimonials ?? []} />
                <TestimonialForm />
              </DashboardSection>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
