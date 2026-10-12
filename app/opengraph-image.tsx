import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/url";

export const alt = "Handle: your professional story, one link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Link preview for the landing page and other non-profile pages.
// Profiles have their own in app/[username]/opengraph-image.tsx.
export default function Image() {
  const host = SITE_URL.replace(/^https?:\/\//, "");
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
        <div style={{ display: "flex", fontSize: 32, color: "#d4b9ef" }}>handle</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 80, lineHeight: 1.1 }}>
            Your professional story, one link.
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 36, color: "#bbafc6" }}>
            {`Build a portfolio page and share it at ${host}/yourname`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
