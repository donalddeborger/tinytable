import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { placeTown } from "@/lib/slug";
import { AMENITIES, isSuperWelcome, isWelcome, kidRating } from "@/lib/score";
import { AMENITY_ICON } from "@/components/Icons";
import type { AmenityKey, Place } from "@/lib/types";

// Voorbeeldkaartje per horecazaak (WhatsApp, Facebook, …):
// naam, hartjes, label en voorzieningen.
export const OG_SIZE = { width: 1200, height: 630 };

async function loadFonts() {
  const dir = join(process.cwd(), "src/assets/og-fonts");
  const files: [string, string, 500 | 600 | 700][] = [
    ["Fredoka", "Fredoka-600.ttf", 600],
    ["Fredoka", "Fredoka-700.ttf", 700],
    ["Jakarta", "Jakarta-500.ttf", 500],
    ["Jakarta", "Jakarta-700.ttf", 700],
  ];
  try {
    return await Promise.all(
      files.map(async ([name, file, weight]) => ({
        name,
        data: await readFile(join(dir, file)),
        weight,
        style: "normal" as const,
      })),
    );
  } catch {
    return undefined; // dan het standaardlettertype
  }
}

const HEART =
  "M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z";

const TYPE_NL = { restaurant: "Restaurant", cafe: "Café", bar: "Koffiebar" } as const;

const AM: Record<AmenityKey, { label: string; color: string; soft: string }> = {
  changingTable: { label: "Verschoningstafel", color: "#e8794a", soft: "#ffe7da" },
  highChairs: { label: "Kinderstoelen", color: "#2a9d78", soft: "#d9f4e8" },
  playCorner: { label: "Speelhoek", color: "#3b86c9", soft: "#ddeeff" },
  kidsMenu: { label: "Kinderaanbod", color: "#c48b0c", soft: "#fff1c7" },
  playground: { label: "Speeltuin", color: "#8a64d6", soft: "#efe7ff" },
  stroller: { label: "Kinderwagen", color: "#d1527f", soft: "#ffe4ee" },
};

function Heart({ fill }: { fill: number }) {
  return (
    <div style={{ position: "relative", display: "flex", width: 54, height: 54 }}>
      <svg width="54" height="54" viewBox="0 0 24 24">
        <path d={HEART} fill="#eee6f0" />
      </svg>
      {fill > 0 ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: 54 * fill, height: 54, overflow: "hidden", display: "flex" }}>
          <svg width="54" height="54" viewBox="0 0 24 24">
            <path d={HEART} fill="#ff7aa2" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}

export async function placeOgImage(place: Place | null) {
  const fonts = await loadFonts();
  const rating = place ? kidRating(place.amenities) : null;
  const label = place
    ? isSuperWelcome(place.amenities)
      ? "Super kindvriendelijk"
      : isWelcome(place.amenities)
        ? "Kindvriendelijk"
        : null
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "52px 60px 56px",
          fontFamily: "Jakarta",
          backgroundColor: "#fbf8ef",
          backgroundImage:
            "radial-gradient(circle at 0% 0%, rgba(255,210,190,0.8), rgba(255,210,190,0) 45%), radial-gradient(circle at 100% 0%, rgba(200,190,255,0.75), rgba(200,190,255,0) 45%)",
          color: "#2b2238",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: 46, letterSpacing: 3, lineHeight: 1 }}>
          <span style={{ color: "#7b6cf6", fontWeight: 600 }}>TINY</span>
          <span style={{ fontWeight: 700 }}>TABLE</span>
        </div>

        {place ? (
          <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
            <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: place.name.length > 26 ? 60 : 74, fontWeight: 700, lineHeight: 1.05 }}>{place.name}</div>
            <div style={{ display: "flex", fontSize: 30, color: "#6b6178", marginTop: 12 }}>
              {`${TYPE_NL[place.type]} · ${placeTown(place)}`}
            </div>

            <div style={{ display: "flex", alignItems: "center", marginTop: 26 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Heart key={n} fill={rating === null ? 0 : rating >= n ? 1 : rating >= n - 0.5 ? 0.5 : 0} />
              ))}
              {label ? (
                <div
                  style={{
                    display: "flex",
                    marginLeft: 22,
                    padding: "8px 22px",
                    borderRadius: 999,
                    fontSize: 28,
                    fontWeight: 700,
                    backgroundImage: label.startsWith("Super")
                      ? "linear-gradient(90deg, #ffe9a8, #ffc9dc)"
                      : "linear-gradient(90deg, #efeaff, #ffe1ea)",
                  }}
                >
                  {label}
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", marginTop: 38, gap: 12 }}>
              {AMENITIES.map(({ key }) => {
                const value = place.amenities[key];
                const on = value === true;
                const Icon = AMENITY_ICON[key];
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: 170,
                      padding: "18px 4px 16px",
                      borderRadius: 22,
                      backgroundColor: on ? AM[key].soft : "#f1eef4",
                      opacity: on ? 1 : 0.55,
                    }}
                  >
                    <Icon size={46} stroke={on ? AM[key].color : "#9a90a8"} />
                    <div style={{ display: "flex", fontSize: 19, fontWeight: 700, marginTop: 10, color: on ? "#2b2238" : "#8a809a" }}>
                      {AM[key].label}
                    </div>
                    <div style={{ display: "flex", fontSize: 18, fontWeight: 500, marginTop: 2, color: on ? AM[key].color : "#9a90a8" }}>
                      {on ? "Ja" : value === false ? "Nee" : "Onbekend"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 40, marginTop: 60 }}>Kindvriendelijk eten &amp; drinken in Antwerpen</div>
        )}
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
