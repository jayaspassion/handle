"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  saveProject,
  type ProjectField,
  type ProjectFormState,
  type ProjectValues,
} from "./actions";
import AddPanel from "../../_components/add-panel";
import { useUploadThing } from "@/lib/uploadthing";
import { isUploadedFileUrl } from "@/lib/uploads";
import { resizeImage } from "../profile/uploads";
import { uploadErrorMessage } from "@/lib/upload-errors";

type TextField = Exclude<ProjectField, "coverImageUrl">;

const initialState: ProjectFormState = { status: "idle" };

const inputClass = "input mt-1";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}

type FieldsProps = {
  editId?: string; // set when editing an existing project
  initial?: ProjectValues; // values to pre-fill when editing
  onSaved: () => void;
  onCancel: () => void;
};

// Used by both the Add panel and the Edit mode of a list entry
export function ProjectFormFields({
  editId,
  initial,
  onSaved,
  onCancel,
}: FieldsProps) {
  const [state, formAction, pending] = useActionState(saveProject, initialState);

  // Unique ids, so several forms can be open on the page at once
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  // Project image: uploaded first, then saved with the project
  const [cover, setCover] = useState(
    isUploadedFileUrl(initial?.coverImageUrl) ? initial!.coverImageUrl : "",
  );
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  // Busy from picking a file until its address is in the form (resizing
  // happens before UploadThing starts), so Save can't drop the image
  const [imageBusy, setImageBusy] = useState(false);
  const { startUpload, isUploading } = useUploadThing("projectImage", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.serverData?.url;
      if (url) {
        setCover(url);
        setUploadError("");
      } else {
        setUploadError(uploadErrorMessage({}, "projectImage"));
      }
    },
    onUploadError: (e) => setUploadError(uploadErrorMessage(e, "projectImage")),
  });

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError(uploadErrorMessage({ code: "InvalidFileType" }, "projectImage"));
      return;
    }
    setUploadError("");
    setImageBusy(true);
    try {
      await startUpload([await resizeImage(file)]);
    } catch {
      setUploadError(uploadErrorMessage({}, "projectImage"));
    } finally {
      setImageBusy(false);
    }
  }
  const uploading = imageBusy || isUploading;

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

  // After a failed submit, show what the user typed; otherwise the saved values
  const base = state.values ?? initial;
  const err = state.errors ?? {};

  const field = (name: TextField, hintId?: string) => ({
    id: fid(name),
    name,
    defaultValue: base?.[name] ?? "",
    "aria-invalid": !!err[name],
    "aria-describedby":
      [hintId, err[name] ? `${fid(name)}-error` : undefined]
        .filter(Boolean)
        .join(" ") || undefined,
    className: inputClass,
  });

  const urlProps = {
    type: "text" as const,
    inputMode: "url" as const,
    autoComplete: "off",
  };

  const safeCover = isUploadedFileUrl(cover) ? cover : null;

  return (
    <form action={formAction} className="space-y-4">
      <h3 className="font-serif text-lg">
        {editId ? "Edit project" : "New project"}
      </h3>
      {editId && <input type="hidden" name="id" value={editId} />}

      <div>
        <label htmlFor={fid("title")} className="text-sm font-medium">Title</label>
        <input {...field("title")} />
        <FieldError id={`${fid("title")}-error`} message={err.title} />
      </div>

      <div>
        <label htmlFor={fid("description")} className="text-sm font-medium">Description (optional)</label>
        <textarea rows={4} {...field("description")} />
        <FieldError id={`${fid("description")}-error`} message={err.description} />
      </div>

      <div>
        <label htmlFor={fid("tags")} className="text-sm font-medium">Tags (optional)</label>
        <input
          {...field("tags", `${fid("tags")}-hint`)}
          placeholder="React, TypeScript, Postgres"
        />
        <p id={`${fid("tags")}-hint`} className="mt-1 text-xs text-pf-muted">
          Separate with commas. Up to 10 tags. Use tools, skills or topics, whatever fits your work.
        </p>
        <FieldError id={`${fid("tags")}-error`} message={err.tags} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("liveUrl")} className="text-sm font-medium">Live link (optional)</label>
          <input {...field("liveUrl")} {...urlProps} placeholder="https://my-project.com" />
          <FieldError id={`${fid("liveUrl")}-error`} message={err.liveUrl} />
        </div>
        <div>
          <label htmlFor={fid("repoUrl")} className="text-sm font-medium">Source link (optional)</label>
          <input {...field("repoUrl")} {...urlProps} placeholder="https://github.com/you/project" />
          <FieldError id={`${fid("repoUrl")}-error`} message={err.repoUrl} />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Project image (optional)</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          {safeCover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={safeCover}
              alt="Project image preview"
              className="h-16 w-24 rounded-md border border-pf-border object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="grid h-16 w-24 place-items-center rounded-md border border-dashed border-pf-border text-xs text-pf-muted"
            >
              No image
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFile}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="btn btn-outline btn-sm"
          >
            {uploading ? "Uploading..." : safeCover ? "Replace" : "Upload image"}
          </button>
          {safeCover && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => setCover("")}
              className="btn btn-outline btn-sm"
            >
              Remove
            </button>
          )}
        </div>
        <input type="hidden" name="coverImageUrl" value={cover} />
        <p className="mt-1 text-xs text-pf-muted">
          JPG, PNG or WebP. Resized automatically. Shown beside your project on your public page.
        </p>
        <FieldError id={`${fid("coverImageUrl")}-error`} message={err.coverImageUrl} />
        {uploadError && (
          <p role="alert" className="msg-error mt-2">
            {uploadError}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending || uploading} className="btn btn-primary">
          {pending
            ? editId ? "Saving..." : "Adding..."
            : editId ? "Save changes" : "Add project"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="btn btn-outline"
        >
          Cancel
        </button>
        {state.status === "error" && state.message && (
          <p role="alert" className="msg-error">{state.message}</p>
        )}
      </div>
    </form>
  );
}

export default function ProjectForm() {
  return (
    <AddPanel label="Add project" savedMessage="Project added.">
      {({ onSaved, onCancel }) => (
        <ProjectFormFields onSaved={onSaved} onCancel={onCancel} />
      )}
    </AddPanel>
  );
}
