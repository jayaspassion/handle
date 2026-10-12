import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home screen icon (iPhone/iPad), same mark as app/icon.svg
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3d2145",
          color: "#f6f0fa",
          fontSize: 124,
          paddingBottom: 16,
        }}
      >
        h
      </div>
    ),
    size,
  );
}
