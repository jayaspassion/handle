// Fixed lists for the public page look. Database values are only ever
// checked against these ids; anything else falls back to the default.
// Colors live in app/globals.css under [data-pf-theme="<id>"].

export const THEMES = [
  { id: "lavender", label: "Lavender", accent: "#d4b9ef" },
  { id: "sky", label: "Sky", accent: "#a9d6f5" },
  { id: "cobalt", label: "Cobalt", accent: "#70b5f9" },
  { id: "blush", label: "Blush", accent: "#f4b6cc" },
  { id: "sage", label: "Sage", accent: "#9fd3b5" },
  { id: "ocean", label: "Ocean", accent: "#9cc7f0" },
  { id: "sunset", label: "Sunset", accent: "#f2b08f" },
  { id: "mono", label: "Mono", accent: "#ededed" },
] as const;

export const FONTS = [
  { id: "editorial", label: "Editorial" },
  { id: "modern", label: "Modern sans" },
  { id: "classic", label: "Classic serif" },
  { id: "tech", label: "Tech" },
] as const;

export const COLOR_MODES = ["light", "dark", "system"] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export type FontId = (typeof FONTS)[number]["id"];
export type ColorMode = (typeof COLOR_MODES)[number];

export const THEME_IDS = THEMES.map((t) => t.id) as [ThemeId, ...ThemeId[]];
export const FONT_IDS = FONTS.map((f) => f.id) as [FontId, ...FontId[]];

export function resolveTheme(value: string | null | undefined): ThemeId {
  return THEMES.find((t) => t.id === value)?.id ?? "lavender";
}

export function resolveFont(value: string | null | undefined): FontId {
  return FONTS.find((f) => f.id === value)?.id ?? "editorial";
}

export function resolveColorMode(value: string | null | undefined): ColorMode | null {
  return COLOR_MODES.find((m) => m === value) ?? null;
}

// Accent used on the dark link-preview (Open Graph) image
export function themeAccent(theme: ThemeId) {
  return THEMES.find((t) => t.id === theme)!.accent;
}
