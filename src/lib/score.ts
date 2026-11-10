import type { Amenities, AmenityKey } from "./types";

export const AMENITIES: {
  key: AmenityKey;
  label: string;
  short: string;
  hint: string;
}[] = [
  {
    key: "changingTable",
    label: "Verschonings\u00ADtafel",
    short: "Verschonen",
    hint: "Een tafel of kamer om de baby te verschonen",
  },
  {
    key: "highChairs",
    label: "Kinder\u00ADstoelen",
    short: "Stoelen",
    hint: "Hoogstoelen of kinderstoelen aan tafel",
  },
  {
    key: "playCorner",
    label: "Speelhoek",
    short: "Spelen",
    hint: "Een hoekje of speelgoed voor kinderen",
  },
  {
    key: "kidsMenu",
    label: "Kinder\u00ADmenu",
    short: "Menu",
    hint: "Aangepast kindermenu of kindergerechten",
  },
];

const WEIGHTS: Record<AmenityKey, number> = {
  changingTable: 3,
  highChairs: 3,
  playCorner: 2,
  kidsMenu: 2,
};

export function kidScore(
  amenities: Partial<Amenities> | null | undefined,
): number | null {
  if (!amenities) return null;
  // Zolang niets ingevuld is (alles "?"), is er nog geen score.
  const known = AMENITIES.filter(
    (item) => typeof amenities[item.key] === "boolean",
  );
  if (known.length === 0) return null;
  return AMENITIES.reduce(
    (sum, item) => sum + (amenities[item.key] === true ? WEIGHTS[item.key] : 0),
    0,
  );
}

// Score op 5 (in halve stappen), afgeleid van de punten op 10.
export function kidRating(
  amenities: Partial<Amenities> | null | undefined,
): number | null {
  const points = kidScore(amenities);
  if (points === null) return null;
  return Math.round(points) / 2;
}

export function scoreLabel(rating: number | null): string {
  if (rating === null) return "Nog niet beoordeeld";
  if (rating >= 4) return "Heel kindvriendelijk";
  if (rating >= 2.5) return "Redelijk kindvriendelijk";
  if (rating >= 1.5) return "Beperkt kindvriendelijk";
  return "Weinig voorzieningen";
}

export function ratingText(rating: number | null): string {
  if (rating === null) return "nog niet beoordeeld";
  return `${String(rating).replace(".", ",")} op 5`;
}

export function emptyAmenities(): Amenities {
  return {
    changingTable: null,
    highChairs: null,
    playCorner: null,
    kidsMenu: null,
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
