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
          background: "#0b0b0f",
          color: "#ededed",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, color: "#c4b5fd" }}>
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
                color: "#a3a3a3",
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