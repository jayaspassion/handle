import { UTApi } from "uploadthing/server";
import { prisma } from "@/lib/prisma";
import { isUploadedFileUrl } from "@/lib/uploads";

const utapi = new UTApi();

// Removes a file we stored in UploadThing, but only when no photo, résumé or
// project still points at it. Never throws: a failed delete must not break a save.
export async function deleteUploadedFile(url: string | null | undefined) {
  if (!isUploadedFileUrl(url)) return;
  try {
    const inProjects = await prisma.project.count({ where: { coverImageUrl: url } });
    const inProfiles = await prisma.profile.count({
      where: { OR: [{ avatarUrl: url }, { resumeUrl: url }] },
    });
    if (inProjects > 0 || inProfiles > 0) return;
    const key = new URL(url).pathname.split("/").pop();
    if (key) await utapi.deleteFiles(key);
  } catch {
    // ignore
  }
}
