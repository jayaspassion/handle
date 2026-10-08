import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
import SkillForm from "./_sections/skills/form";
import SkillList from "./_sections/skills/list";
import CertificationForm from "./_sections/certifications/form";
import CertificationList from "./_sections/certifications/list";
import TestimonialForm from "./_sections/testimonials/form";
import TestimonialList from "./_sections/testimonials/list";

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

  // Categories already in use, offered as suggestions in the skill forms
  const skillCategories = [
    ...new Set(skills.map((s) => s.category).filter((c): c is string => !!c)),
  ];

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2">Signed in as {user.email}</p>
      <p>Plan: {user.tier}</p>

      <h2 className="mt-8 text-xl font-semibold">Publish</h2>
      <PublishSection
        username={profile?.username ?? ""}
        isPublished={profile?.isPublished ?? false}
        hasName={!!profile?.fullName?.trim()}
      />

      <h2 className="mt-12 text-xl font-semibold">Profile</h2>
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

      <h2 className="mt-12 text-xl font-semibold">Links</h2>
      <LinkList items={profile?.links ?? []} />
      <LinkForm />

      <h2 className="mt-12 text-xl font-semibold">Experience</h2>
      <ExperienceList items={profile?.experiences ?? []} />
      <ExperienceForm />

      <h2 className="mt-12 text-xl font-semibold">Education</h2>
      <EducationList items={profile?.education ?? []} />
      <EducationForm />

      <h2 className="mt-12 text-xl font-semibold">Projects</h2>
      <ProjectList items={profile?.projects ?? []} />
      <ProjectForm />

      <h2 className="mt-12 text-xl font-semibold">Skills</h2>
      <SkillList items={skills} categories={skillCategories} />
      <SkillForm categories={skillCategories} />

      <h2 className="mt-12 text-xl font-semibold">Certifications</h2>
      <CertificationList items={profile?.certifications ?? []} />
      <CertificationForm />

      <h2 className="mt-12 text-xl font-semibold">Testimonials</h2>
      <TestimonialList items={profile?.testimonials ?? []} />
      <TestimonialForm />
    </main>
  );
}