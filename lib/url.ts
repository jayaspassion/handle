// Canonical site address (www). Used for sitemap, robots and metadata.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

// Public contact for privacy, terms and reports (shown on the site)
export const CONTACT_EMAIL = "jayaspassion@gmail.com";

export function isHttpUrl(value: string) {
    if (value === "") return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }
  
  // "example.com" -> "https://example.com". Anything containing "://" is left
  // alone and then checked by isHttpUrl, so javascript: and data: are rejected.
  export function normalizeUrl(value: string) {
    const v = value.trim();
    if (!v) return "";
    return v.includes("://") ? v : `https://${v}`;
  }