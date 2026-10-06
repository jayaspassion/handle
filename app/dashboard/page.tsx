import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./profile-form";
import ExperienceForm from "./experience-form";
import ExperienceList from "./experience-list";
import EducationForm from "./education-form";
import EducationList from "./education-list";
import ProjectForm from "./project-form";
import ProjectList from "./project-list";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      profile: {
        include: {
          experiences: { orderBy: { startDate: "desc" } },
          education: { orderBy: { startDate: "desc" } },
          projects: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
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

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2">Signed in as {user.email}</p>
      <p>Plan: {user.tier}</p>
      <p>Profile: {profile?.isPublished ? "Published" : "Draft"}</p>

      <h2 className="mt-8 text-xl font-semibold">Profile</h2>
      <ProfileForm
        defaults={{
          fullName: profile?.fullName ?? "",
          headline: profile?.headline ?? "",
          bio: profile?.bio ?? "",
          location: profile?.location ?? "",
        }}
      />

      <h2 className="mt-12 text-xl font-semibold">Experience</h2>
      <ExperienceList items={profile?.experiences ?? []} />
      <ExperienceForm />

      <h2 className="mt-12 text-xl font-semibold">Education</h2>
      <EducationList items={profile?.education ?? []} />
      <EducationForm />

      <h2 className="mt-12 text-xl font-semibold">Projects</h2>
      <ProjectList items={profile?.projects ?? []} />
      <ProjectForm />
    </main>
  );
}