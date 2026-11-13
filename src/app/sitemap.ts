import type { MetadataRoute } from "next";
import { AMENITY_PAGES, seoPlaces, towns } from "@/lib/seo";
import { SITE_URL } from "@/lib/slug";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/over`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/gemeenten`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/voor-horeca`, changeFrequency: "monthly", priority: 0.5 },
    ...AMENITY_PAGES.map((a) => ({
      url: `${SITE_URL}/met/${a.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
  try {
    const places = await seoPlaces();
    return [
      ...fixed,
      ...towns(places).map((t) => ({
        url: `${SITE_URL}/kindvriendelijk/${t.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...places.map((place) => ({
        url: `${SITE_URL}/zaak/${place.slug}`,
        lastModified: place.updatedAt ? new Date(place.updatedAt) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return fixed;
  }
}
