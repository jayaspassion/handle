import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { isUploadedFileUrl, resumeFileName } from "@/lib/uploads";
import { resolveColorMode, resolveFont, resolveTheme } from "@/lib/appearance";

const byOrder = [{ order: "asc" as const }, { createdAt: "asc" as const }];

// The ONLY place that decides what the public can see.
// Deliberately excluded: the User row (email, tier, clerkId) and all
// arbitrary image URLs. avatarUrl/resumeUrl are only returned if they point at our UploadThing host.
// React's cache() means the page and its metadata share one query per request.
export const getPublishedProfile = cache(async (username: string) => {
  const profile = await prisma.profile.findFirst({
    where: { username: username.toLowerCase(), isPublished: true },
    select: {
      username: true,
      fullName: true,
      headline: true,
      bio: true,
      location: true,
      avatarUrl: true,
      resumeUrl: true,
      sectionOrder: true,
      colorMode: true,
      theme: true,
      font: true,
      openToWork: true,
      links: {
        orderBy: byOrder,
        select: { id: true, label: true, url: true },
      },
      experiences: {
        orderBy: { startDate: "desc" },
        select: {
          id: true,
          company: true,
          role: true,
          location: true,
          startDate: true,
          endDate: true,
          description: true,
        },
      },
      education: {
        orderBy: { startDate: "desc" },
        select: {
          id: true,
          institution: true,
          degree: true,
          fieldOfStudy: true,
          location: true,
          gpa: true,
          startDate: true,
          endDate: true,
          description: true,
        },
      },
      projects: {
        orderBy: byOrder,
        select: {
          id: true,
          title: true,
          description: true,
          tags: true,
          coverImageUrl: true,
          liveUrl: true,
          repoUrl: true,
        },
      },
      skills: {
        orderBy: byOrder,
        select: { id: true, name: true, category: true },
      },
      certifications: {
        orderBy: byOrder,
        select: {
          id: true,
          name: true,
          issuer: true,
          issueDate: true,
          expiryDate: true,
          credentialUrl: true,
        },
      },
      testimonials: {
        orderBy: byOrder,
        select: {
          id: true,
          quote: true,
          authorName: true,
          authorRole: true,
          authorCompany: true,
        },
      },
    },
  });
  if (!profile) return null;
  return {
    ...profile,
    avatarUrl: isUploadedFileUrl(profile.avatarUrl) ? profile.avatarUrl : null,
    resumeUrl: isUploadedFileUrl(profile.resumeUrl) ? profile.resumeUrl : null,
    // Only values from the fixed lists in lib/appearance.ts
    colorMode: resolveColorMode(profile.colorMode),
    theme: resolveTheme(profile.theme),
    font: resolveFont(profile.font),
    projects: profile.projects.map((p) => ({
      ...p,
      coverImageUrl: isUploadedFileUrl(p.coverImageUrl)
        ? p.coverImageUrl
        : null,
    })),
  };
});

// Resume for /<username>/resume: only for a published profile, and only if
// it is one of our uploaded files (same rules as above). The file name comes
// from the current profile name.
export async function getPublishedResume(username: string) {
  const profile = await prisma.profile.findFirst({
    where: { username: username.toLowerCase(), isPublished: true },
    select: { username: true, fullName: true, resumeUrl: true },
  });
  if (!profile?.username || !isUploadedFileUrl(profile.resumeUrl)) return null;
  return {
    username: profile.username,
    url: profile.resumeUrl,
    fileName: resumeFileName(profile.fullName ?? ""),
  };
}

// Published profiles for the sitemap: same rule as getPublishedProfile
// (published with a username), and only the username and update time.
export async function listPublishedProfiles() {
  return prisma.profile.findMany({
    where: { isPublished: true, username: { not: null } },
    select: { username: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}
