import { cache } from "react";
import { prisma } from "@/lib/prisma";

const byOrder = [{ order: "asc" as const }, { createdAt: "asc" as const }];

// The ONLY place that decides what the public can see.
// Deliberately excluded: the User row (email, tier, clerkId) and all
// user-supplied image URLs (avatarUrl, coverImageUrl, authorAvatarUrl).
// React's cache() means the page and its metadata share one query per request.
export const getPublishedProfile = cache(async (username: string) => {
  return prisma.profile.findFirst({
    where: { username: username.toLowerCase(), isPublished: true },
    select: {
      username: true,
      fullName: true,
      headline: true,
      bio: true,
      location: true,
      resumeUrl: true,
      sectionOrder: true,
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
});