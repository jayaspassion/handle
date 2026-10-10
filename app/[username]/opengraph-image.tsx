import { ImageResponse } from "next/og";
import { getPublishedProfile } from "@/lib/public-profile";

export const alt = "Portfolio on Handle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getPublishedProfile(username);

  const name = clip(profile?.fullName ?? profile?.username ?? "Handle", 60);
  const headline = profile?.headline ? clip(profile.headline, 110) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#17121d",
          backgroundImage: "linear-gradient(135deg, #17121d 0%, #2b2134 100%)",
          color: "#f6f0fa",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, color: "#d4b9ef" }}>
          handle
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, lineHeight: 1.1 }}>
            {name}
          </div>
          {headline ? (
            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: 36,
                color: "#bbafc6",
              }}
            >
              {headline}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size },
  );
}