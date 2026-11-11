import type { MetadataRoute } from "next";
import { listPlaces } from "@/lib/store";
import { placeSlugs, SITE_URL } from "@/lib/slug";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
  ];
  try {
    const places = await listPlaces();
    const slugs = placeSlugs(places);
    return [
      ...home,
      ...places.map((place) => ({
        url: `${SITE_URL}/zaak/${slugs.get(place.id)}`,
        lastModified: place.updatedAt ? new Date(place.updatedAt) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return home;
  }
}
