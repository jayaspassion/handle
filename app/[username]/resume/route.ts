import { getPublishedResumeUrl } from "@/lib/public-profile";

// handleprofile.tech/<username>/resume: a short, shareable link that forwards
// to the PDF on UploadThing's CDN (a redirect, so the file itself never passes
// through our server). Works only while the profile is published.
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const url = await getPublishedResumeUrl(username);
  if (!url) return new Response("Not found", { status: 404 });
  return new Response(null, {
    status: 307,
    headers: { Location: url, "Cache-Control": "no-store" },
  });
}
