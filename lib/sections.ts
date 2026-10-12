// The sections of a public page, and how a stored order is turned into the one we show.
export const SECTION_KEYS = [
  "projects",
  "experience",
  "skills",
  "testimonials",
  "education",
  "certifications",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  projects: "Projects",
  experience: "Experience",
  skills: "Skills",
  testimonials: "Testimonials",
  education: "Education",
  certifications: "Certifications",
};

// The value every profile was created with. Nobody chose it, so we treat it as "not set".
const LEGACY_DEFAULT = [
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "testimonials",
];

export function resolveSectionOrder(stored: string[] | null | undefined): SectionKey[] {
  if (
    !stored ||
    stored.length === 0 ||
    (stored.length === LEGACY_DEFAULT.length &&
      stored.every((key, i) => key === LEGACY_DEFAULT[i]))
  ) {
    return [...SECTION_KEYS];
  }
  const known = stored.filter((key): key is SectionKey =>
    (SECTION_KEYS as readonly string[]).includes(key),
  );
  return [...new Set([...known, ...SECTION_KEYS])];
}
