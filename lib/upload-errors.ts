// Turns UploadThing errors (e.g. "Invalid config: InvalidFileType") into
// messages people understand. Limits match app/api/uploadthing/core.ts.
type Kind = "photo" | "resume" | "projectImage";

const TYPE: Record<Kind, string> = {
  photo: "Choose a JPG, PNG or WebP image.",
  resume: "Choose a PDF file.",
  projectImage: "Choose a JPG, PNG or WebP image.",
};

const SIZE: Record<Kind, string> = {
  photo: "Photo must be 2 MB or less.",
  resume: "PDF must be 4 MB or less.",
  projectImage: "Image must be 2 MB or less.",
};

export function uploadErrorMessage(error: { message?: string; code?: string }, kind: Kind) {
  const text = `${error.code ?? ""} ${error.message ?? ""}`;
  if (/InvalidFileType|file type/i.test(text)) return TYPE[kind];
  if (/FileSize|too large|too big/i.test(text)) return SIZE[kind];
  if (/FileCount/i.test(text)) return "Choose one file at a time.";
  if (/unauthori[sz]ed|forbidden|sign/i.test(text)) return "Your session ended. Sign in again and retry.";
  return "Upload failed. Please try again.";
}
