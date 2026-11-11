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
  {
    key: "playground",
    label: "Buiten\u00ADspeeltuin",
    short: "Speeltuin",
    hint: "Een speeltuin buiten, bij of vlak naast de zaak",
  },
];

// Score op 5: elk aanwezige voorziening is één hartje.
export function kidRating(
  amenities: Partial<Amenities> | null | undefined,
): number | null {
  if (!amenities) return null;
  // Zolang niets ingevuld is (alles "?"), is er nog geen score.
  const known = AMENITIES.filter((item) => typeof amenities[item.key] === "boolean");
  if (known.length === 0) return null;
  return AMENITIES.filter((item) => amenities[item.key] === true).length;
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
    playground: null,
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

// Label "Kleine gasten welkom": minstens 3 van de 5 voorzieningen (3 hartjes).
export const WELCOME_MIN = 3;

export function isWelcome(amenities: Partial<Amenities> | null | undefined): boolean {
  return (kidRating(amenities) ?? 0) >= WELCOME_MIN;
}
