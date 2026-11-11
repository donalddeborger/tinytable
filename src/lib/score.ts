import type { Amenities, AmenityKey } from "./types";

// De zes voorzieningen, in vaste volgorde (teksten staan in i18n.tsx).
export const AMENITIES: { key: AmenityKey }[] = [
  { key: "changingTable" },
  { key: "highChairs" },
  { key: "playCorner" },
  { key: "kidsMenu" },
  { key: "playground" },
  { key: "stroller" },
];

// Gewicht per voorziening: de vier basisvoorzieningen tellen voor een heel
// hartje, buitenspeeltuin en kinderwagen voor een half. Samen maximaal 5.
export const AMENITY_WEIGHT: Record<AmenityKey, number> = {
  changingTable: 1,
  highChairs: 1,
  playCorner: 1,
  kidsMenu: 1,
  playground: 0.5,
  stroller: 0.5,
};

// Score op 5 hartjes (halve hartjes mogelijk).
export function kidRating(
  amenities: Partial<Amenities> | null | undefined,
): number | null {
  if (!amenities) return null;
  // Zolang niets ingevuld is (alles "?"), is er nog geen score.
  const known = AMENITIES.filter((item) => typeof amenities[item.key] === "boolean");
  if (known.length === 0) return null;
  return AMENITIES.reduce(
    (sum, item) => sum + (amenities[item.key] === true ? AMENITY_WEIGHT[item.key] : 0),
    0,
  );
}

export function emptyAmenities(): Amenities {
  return {
    changingTable: null,
    highChairs: null,
    playCorner: null,
    kidsMenu: null,
    playground: null,
    stroller: null,
  };
}

export type ScoreTone = "great" | "good" | "fair" | "low" | "none";

export function scoreTone(rating: number | null): ScoreTone {
  if (rating === null) return "none";
  if (rating >= 4) return "great";
  if (rating >= 2.5) return "good";
  if (rating >= 1.5) return "fair";
  return "low";
}

// Kleur per toon, ook gebruikt in de kaartpins (die geen CSS-variabelen zien).
export const TONE_COLOR: Record<ScoreTone, string> = {
  great: "#3CC497",
  good: "#F6B84A",
  fair: "#FF9466",
  low: "#EE7177",
  none: "#B9B2C4",
};

// Labels: "Kindvriendelijk" bij 3 hartjes, "Super kindvriendelijk" vanaf 4 hartjes.
export const WELCOME_MIN = 3;
export const SUPER_MIN = 4;

export function isWelcome(amenities: Partial<Amenities> | null | undefined): boolean {
  return (kidRating(amenities) ?? 0) >= WELCOME_MIN;
}

export function isSuperWelcome(amenities: Partial<Amenities> | null | undefined): boolean {
  return (kidRating(amenities) ?? 0) >= SUPER_MIN;
}
