import { listPlaces } from "@/lib/store";
import { placeSlugs } from "@/lib/slug";
import { OG_SIZE, placeOgImage } from "@/lib/og-place";

// Voorbeeldkaartje per horecazaak bij het delen (WhatsApp, Facebook, …).
export const alt = "TinyTable – kindvriendelijk eten & drinken";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const places = await listPlaces();
    const slugs = placeSlugs(places);
    return placeOgImage(places.find((p) => slugs.get(p.id) === slug) ?? null);
  } catch {
    return placeOgImage(null);
  }
}
