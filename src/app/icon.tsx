import { ImageResponse } from "next/og";

// App-icoon (ook voor "zet op beginscherm"): TT in de twee tinten van het woordmerk.
export function generateImageMetadata() {
  return [
    { id: "32", size: { width: 32, height: 32 }, contentType: "image/png" },
    { id: "192", size: { width: 192, height: 192 }, contentType: "image/png" },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png" },
  ];
}

export default async function Icon({ id }: { id: Promise<string> | string }) {
  const size = Number(await id);
  const radius = size <= 32 ? 7 : Math.round(size * 0.22);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf8ef",
          borderRadius: radius,
        }}
      >
        <div style={{ display: "flex", fontSize: size * 0.56, lineHeight: 1, letterSpacing: -size * 0.02 }}>
          <span style={{ color: "#7b6cf6", fontWeight: 400 }}>T</span>
          <span style={{ color: "#2b2238", fontWeight: 800 }}>T</span>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
