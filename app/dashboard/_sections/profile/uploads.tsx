"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";
import { isUploadedFileUrl } from "@/lib/uploads";
import { uploadErrorMessage } from "@/lib/upload-errors";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Shrinks a photo in the browser before upload: max 800px, WebP.
// Falls back to the original file if anything goes wrong.
export async function resizeImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85),
    );
    if (!blob) return file;
    return new File([blob], "avatar.webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

const icon = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function CameraIcon() {
  return (
    <svg {...icon}>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg {...icon} width={20} height={20}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

export function PhotoUploader({
  avatarUrl,
  name,
}: {
  avatarUrl: string | null;
  name: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const { startUpload, isUploading } = useUploadThing("avatar", {
    onClientUploadComplete: () => {
      setError("");
      router.refresh();
    },
    onUploadError: (e) => setError(uploadErrorMessage(e, "photo")),
  });

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setError(uploadErrorMessage({ code: "InvalidFileType" }, "photo"));
      return;
    }
    setError("");
    await startUpload([await resizeImage(file)]);
  }

  const safeUrl = isUploadedFileUrl(avatarUrl) ? avatarUrl : null;

  return (
    <div className="flex flex-col items-center gap-3 md:mt-6">
      {safeUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeUrl}
          alt="Your current photo"
          className="h-28 w-28 rounded-full border border-pf-border object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-28 w-28 items-center justify-center rounded-full bg-pf-avatar-bg font-serif text-3xl text-pf-avatar-fg"
        >
          {initials(name)}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="btn btn-outline btn-sm whitespace-nowrap"
      >
        <CameraIcon />
        {isUploading ? "Uploading..." : safeUrl ? "Change photo" : "Add photo"}
      </button>
      <p className="text-xs text-pf-muted">Saves automatically</p>
      {error && (
        <p role="alert" className="msg-error text-center">
          {error}
        </p>
      )}
    </div>
  );
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

export function ResumeUploader({
  resumeUrl,
  name,
}: {
  resumeUrl: string | null;
  name: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const { startUpload, isUploading } = useUploadThing("resume", {
    onClientUploadComplete: () => {
      setError("");
      router.refresh();
    },
    onUploadError: (e) => setError(uploadErrorMessage(e, "resume")),
  });

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    // Check before uploading so the message is instant and clear
    if (file.type !== "application/pdf") {
      setError(uploadErrorMessage({ code: "InvalidFileType" }, "resume"));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError(uploadErrorMessage({ code: "FileSizeMismatch" }, "resume"));
      return;
    }
    setError("");
    const named = new File([file], resumeFileName(name), { type: "application/pdf" });
    await startUpload([named]);
  }

  const safeUrl = isUploadedFileUrl(resumeUrl) ? resumeUrl : null;

  return (
    <div>
      <p className="text-sm font-medium">Resume</p>
      <div
        className={`mt-1 flex flex-col items-center gap-3 rounded-lg border border-pf-border p-4 text-center ${
          safeUrl ? "" : "border-dashed"
        }`}
      >
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-pf-tint text-pf-accent"
        >
          <DocIcon />
        </span>
        <div>
          <p className="text-sm font-medium">
            {safeUrl ? "Resume uploaded" : "No resume yet"}
          </p>
          <p className="text-xs text-pf-muted">PDF, up to 4 MB. Saves automatically.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {safeUrl && (
            <a
              href={safeUrl}
              target="_blank"
              rel="nofollow ugc noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              View
              <span className="sr-only"> resume (opens in a new tab)</span>
            </a>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={onChange}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="btn btn-outline btn-sm"
          >
            {isUploading ? "Uploading..." : safeUrl ? "Replace" : "Upload"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="msg-error mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
