"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";
import { isUploadedFileUrl } from "@/lib/uploads";

type RowProps = {
  endpoint: "avatar" | "resume";
  label: string;
  accept: string;
  hint: string;
  url: string | null;
};

function UploadRow({ endpoint, label, accept, hint, url }: RowProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const [error, setError] = useState("");

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: () => {
      setError("");
      router.refresh();
    },
    onUploadError: (e) => setError(e.message),
  });

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    await startUpload([file]);
  }

  const safeUrl = isUploadedFileUrl(url) ? url : null;

  return (
    <div className="flex items-center gap-3">
      {endpoint === "avatar" && safeUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={safeUrl} alt="Your current photo" className="h-12 w-12 rounded-full object-cover" />
      )}
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-600" id={`${uid}-hint`}>{hint}</p>
        <div className="mt-1 flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={onChange}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            aria-describedby={`${uid}-hint`}
            className="text-sm text-purple-700 hover:underline disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : safeUrl ? "Replace" : "Upload"}
          </button>
          {endpoint === "resume" && safeUrl && (
            <a href={safeUrl} target="_blank" rel="nofollow ugc noopener noreferrer" className="text-sm text-gray-700 hover:underline">
              View current
            </a>
          )}
        </div>
        {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export function ProfileUploads({
  avatarUrl,
  resumeUrl,
}: {
  avatarUrl: string | null;
  resumeUrl: string | null;
}) {
  return (
    <div className="mt-4 space-y-4 rounded-md border border-gray-200 p-4">
      <UploadRow endpoint="avatar" label="Photo" accept="image/jpeg,image/png,image/webp" hint="JPG, PNG or WebP, up to 2 MB." url={avatarUrl} />
      <UploadRow endpoint="resume" label="Resume" accept="application/pdf" hint="PDF, up to 4 MB." url={resumeUrl} />
    </div>
  );
}