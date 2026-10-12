import type { MetadataRoute } from "next";
import { listPublishedProfiles } from "@/lib/public-profile";
import { SITE_URL } from "@/lib/url";

// Built on request so new and unpublished profiles show up right away, and the
// build never needs the database.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await listPublishedProfiles();
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ...profiles.map((p) => ({
      url: `${SITE_URL}/${p.username}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
