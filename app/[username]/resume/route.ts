import { getPublishedResume } from "@/lib/public-profile";

// handleprofile.tech/<username>/resume: the short, shareable link. Forwards to
// /<username>/resume/<Firstname_Lastname_Resume.pdf>, an address that ends in
// the file name, so every browser saves the PDF under that name.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const resume = await getPublishedResume(username);
  if (!resume) return new Response("Not found", { status: 404 });
  const target = new URL(`/${resume.username}/resume/${resume.fileName}`, request.url);
  return new Response(null, {
    status: 307,
    headers: { Location: target.toString(), "Cache-Control": "no-store" },
  });
}
