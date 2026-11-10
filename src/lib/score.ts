import type { Amenities, AmenityKey } from "./types";

export const AMENITIES: {
  key: AmenityKey;
  label: string;
  short: string;
  hint: string;
}[] = [
  {
    key: "changingTable",
    label: "Verschoningstafel",
    short: "Verschonen",
    hint: "Een tafel of kamer om de baby te verschonen",
  },
  {
    key: "highChairs",
    label: "Kinderstoelen",
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
    label: "Kindermenu",
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

export function scoreLabel(score: number | null): string {
  if (score === null) return "Nog geen score";
  if (score >= 8) return "Heel kindvriendelijk";
  if (score >= 5) return "Redelijk kindvriendelijk";
  if (score >= 3) return "Beperkt kindvriendelijk";
  return "Weinig voorzieningen";
}

export function emptyAmenities(): Amenities {
  return {
    changingTable: null,
    highChairs: null,
    playCorner: null,
    kidsMenu: null,
  };
}
