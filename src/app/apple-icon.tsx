import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fbf8ef" }}>
        <div style={{ display: "flex", fontSize: 100, lineHeight: 1, letterSpacing: -4 }}>
          <span style={{ color: "#7b6cf6", fontWeight: 400 }}>T</span>
          <span style={{ color: "#2b2238", fontWeight: 800 }}>T</span>
        </div>
      </div>
    ),
    size,
  );
}
