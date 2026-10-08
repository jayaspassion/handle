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