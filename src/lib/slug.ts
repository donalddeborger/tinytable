import type { Place } from "./types";

export const SITE_URL = "https://www.tinytable.be";

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " en ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "zaak";
}

// Unieke, leesbare adressen per zaak (/zaak/melkerij-nachtegalenpark).
// Zelfde naam twee keer? Dan komt de gemeente erbij, en desnoods een nummer.
export function placeSlugs(places: Place[]): Map<string, string> {
  const result = new Map<string, string>();
  const used = new Set<string>();
  const counts = new Map<string, number>();
  for (const place of places) {
    const base = slugify(place.name);
    counts.set(base, (counts.get(base) ?? 0) + 1);
  }
  for (const place of places) {
    let slug = slugify(place.name);
    if ((counts.get(slug) ?? 0) > 1) slug = `${slug}-${slugify(placeTown(place))}`;
    let unique = slug;
    let n = 2;
    while (used.has(unique)) unique = `${slug}-${n++}`;
    used.add(unique);
    result.set(place.id, unique);
  }
  return result;
}

// Gemeente of district uit het adres ("…, 2600 Berchem" → "Berchem").
export function placeTown(place: Pick<Place, "address" | "city">): string {
  const match = place.address.match(/\b\d{4}\s+([^,]+)$/);
  return (match?.[1] ?? place.city ?? "Antwerpen").trim();
}
