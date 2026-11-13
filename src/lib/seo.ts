import { listPlaces } from "./store";
import { placeSlugs, placeTown, slugify } from "./slug";
import { kidRating } from "./score";
import type { AmenityKey, Place } from "./types";

export const AMENITY_PAGES: { key: AmenityKey; slug: string; label: string; title: string }[] = [
  { key: "changingTable", slug: "verschoningstafel", label: "Verschoningstafel", title: "met verschoningstafel" },
  { key: "highChairs", slug: "kinderstoelen", label: "Kinderstoelen", title: "met kinderstoelen" },
  { key: "playCorner", slug: "speelhoek", label: "Speelhoek", title: "met speelhoek" },
  { key: "kidsMenu", slug: "kinderaanbod", label: "Kinderaanbod", title: "met kinderaanbod" },
  { key: "playground", slug: "buitenspeeltuin", label: "Buitenspeeltuin", title: "met buitenspeeltuin" },
  { key: "stroller", slug: "kinderwagenvriendelijk", label: "Kinderwagenvriendelijk", title: "die kinderwagenvriendelijk zijn" },
];

export type SeoPlace = Place & { slug: string; town: string; townSlug: string; rating: number | null };

export async function seoPlaces(): Promise<SeoPlace[]> {
  const places = await listPlaces();
  const slugs = placeSlugs(places);
  return places
    .map((place) => {
      const town = placeTown(place);
      return {
        ...place,
        slug: slugs.get(place.id) ?? "",
        town,
        townSlug: slugify(town),
        rating: kidRating(place.amenities),
      };
    })
    .sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || a.name.localeCompare(b.name, "nl"));
}

export function towns(places: SeoPlace[]): { slug: string; name: string; count: number }[] {
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const p of places) {
    const entry = map.get(p.townSlug) ?? { slug: p.townSlug, name: p.town, count: 0 };
    entry.count++;
    map.set(p.townSlug, entry);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "nl"));
}
