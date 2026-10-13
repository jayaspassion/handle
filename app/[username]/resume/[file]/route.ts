import { getPublishedResume } from "@/lib/public-profile";

// Serves the published resume PDF from our own address, named after the
// profile (Chrome's PDF viewer names downloads after the address, not the
// file's stored name). Only ever fetches the profile's own uploaded file.
// Cached at Vercel's edge for 5 minutes, so repeat views don't reach the
// server; a new upload or unpublishing shows within that time.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string; file: string }> },
) {
  const { username, file } = await params;
  const resume = await getPublishedResume(username);
  if (!resume) return new Response("Not found", { status: 404 });

  // Old or mistyped name: send to the current one
  if (decodeURIComponent(file) !== resume.fileName) {
    const target = new URL(`/${resume.username}/resume/${resume.fileName}`, request.url);
    return new Response(null, { status: 307, headers: { Location: target.toString() } });
  }

  const upstream = await fetch(resume.url);
  if (!upstream.ok || !upstream.body) {
    return new Response("Resume unavailable", { status: 502 });
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${resume.fileName}"`,
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=60",
      "X-Robots-Tag": "noindex",
    },
  });
}
