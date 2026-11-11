import { ImageResponse } from "next/og";

export const alt = "TinyTable – kindvriendelijk eten & drinken in Antwerpen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Voorbeeldbeeld bij het delen van een link (WhatsApp, Facebook, …).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#fbf8ef",
          backgroundImage:
            "radial-gradient(circle at 0% 0%, rgba(255,210,190,0.8), rgba(255,210,190,0) 45%), radial-gradient(circle at 100% 0%, rgba(200,190,255,0.75), rgba(200,190,255,0) 45%)",
          color: "#2b2238",
        }}
      >
        <div style={{ display: "flex", fontSize: 120, letterSpacing: 6, lineHeight: 1 }}>
          <span style={{ color: "#7b6cf6", fontWeight: 400 }}>TINY</span>
          <span style={{ fontWeight: 800 }}>TABLE</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 36, fontWeight: 700, letterSpacing: 4, color: "#6b6178" }}>
          KINDVRIENDELIJK ETEN &amp; DRINKEN · ANTWERPEN
        </div>
        <div style={{ marginTop: 48, fontSize: 34, color: "#2b2238", maxWidth: 900 }}>
          Verschoningstafel, kinderstoelen, speelhoek, kindermenu of speeltuin? Zie het in één oogopslag.
        </div>
      </div>
    ),
    size,
  );
}
