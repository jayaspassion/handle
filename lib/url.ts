// Canonical site address (www). Used for sitemap, robots and metadata.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

// Public contact for privacy, terms and reports (shown on the site)
export const CONTACT_EMAIL = "jayaspassion@gmail.com";

// Beta feedback: paste the Google Form link here. While empty, the
// feedback links open an email to CONTACT_EMAIL instead.
export const FEEDBACK_FORM_URL = "";
export const FEEDBACK_HREF =
  FEEDBACK_FORM_URL ||
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Handle beta feedback")}`;
// Forms open in a new tab; email opens the mail app
export const FEEDBACK_LINK_PROPS = FEEDBACK_FORM_URL
  ? { target: "_blank", rel: "noopener noreferrer" }
  : {};

export function isHttpUrl(value: string) {
    if (value === "") return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }
  
  // Stricter check for addresses people type into forms: a real public
  // domain such as example.com, not "not-a-url", localhost or a bare IP.
  // (isHttpUrl stays the looser check used when rendering saved links.)
  export function isPublicWebUrl(value: string) {
    if (value === "") return true;
    if (!isHttpUrl(value)) return false;
    const host = new URL(value).hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost")) return false;
    if (/^\d+(\.\d+){3}$/.test(host) || host.startsWith("[")) return false;
    const labels = host.split(".");
    if (labels.length < 2 || labels.some((l) => !l)) return false;
    const tld = labels[labels.length - 1];
    return /^[a-z]{2,63}$/.test(tld) || /^xn--[a-z0-9-]{2,59}$/.test(tld);
  }

  // "example.com" -> "https://example.com". Anything containing "://" is left
  // alone and then checked by isHttpUrl, so javascript: and data: are rejected.
  export function normalizeUrl(value: string) {
    const v = value.trim();
    if (!v) return "";
    return v.includes("://") ? v : `https://${v}`;
  }