import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();
const utapi = new UTApi();

// Runs before every upload: signed-in users only, profile found via Clerk id
async function requireProfile() {
    const { userId } = await auth();
    if (!userId) throw new UploadThingError("You must be signed in.");
    const profile = await prisma.profile.findFirst({
        where: { user: { clerkId: userId } },
        select: { id: true },
    });
    if (!profile) throw new UploadThingError("Profile not found.");
    return { profileId: profile.id };
}

function keyFromUrl(url: string | null) {
    if (!url) return null;
    try {
        return new URL(url).pathname.split("/").pop() || null;
    } catch {
        return null;
    }
}

export const ourFileRouter = {
    avatar: f({
        "image/jpeg": { maxFileSize: "2MB", maxFileCount: 1 },
        "image/png": { maxFileSize: "2MB", maxFileCount: 1 },
        "image/webp": { maxFileSize: "2MB", maxFileCount: 1 },
    })
        .middleware(requireProfile)
        .onUploadComplete(async ({ metadata, file }) => {
            const old = await prisma.profile.findUnique({
                where: { id: metadata.profileId },
                select: { avatarUrl: true },
            });
            await prisma.profile.update({
                where: { id: metadata.profileId },
                data: { avatarUrl: file.ufsUrl },
            });
            const oldKey = keyFromUrl(old?.avatarUrl ?? null);
            if (oldKey) await utapi.deleteFiles(oldKey).catch(() => { }); // free up storage
        }),

    resume: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(requireProfile)
        .onUploadComplete(async ({ metadata, file }) => {
            const old = await prisma.profile.findUnique({
                where: { id: metadata.profileId },
                select: { resumeUrl: true },
            });
            await prisma.profile.update({
                where: { id: metadata.profileId },
                data: { resumeUrl: file.ufsUrl },
            });
            const oldKey = keyFromUrl(old?.resumeUrl ?? null);
            if (oldKey) await utapi.deleteFiles(oldKey).catch(() => { });
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;