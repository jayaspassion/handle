export function isUploadedFileUrl(url: string | null | undefined): url is string {
    if (!url) return false;
    try {
      const u = new URL(url);
      return (
        u.protocol === "https:" &&
        u.hostname.endsWith(".ufs.sh") &&
        u.pathname.startsWith("/f/")
      );
    } catch {
      return false;
    }
  }

// "Jayasoorya Jithendra" -> "Jayasoorya_Jithendra_Resume.pdf". UploadThing keeps
// the uploaded file name, so visitors download it under this name.
export function resumeFileName(fullName: string) {
  const parts = fullName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .map((p) => p.replace(/[^A-Za-z0-9-]/g, ""))
    .filter(Boolean);
  return parts.length ? `${parts.join("_")}_Resume.pdf` : "Resume.pdf";
}
