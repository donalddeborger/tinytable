import { NextResponse } from "next/server";
import { ANTWERP_BOUNDS } from "@/lib/antwerp";
import type { PlaceType, Venue } from "@/lib/types";
import { NOMINATIM_HEADERS, shortAddress, type NominatimResult } from "@/lib/osm";

export const runtime = "nodejs";

// OpenStreetMap-categorieën die we als horeca beschouwen.
const VENUE_TYPES: Record<string, PlaceType> = {
  restaurant: "restaurant",
  fast_food: "restaurant",
  food_court: "restaurant",
  cafe: "cafe",
  ice_cream: "cafe",
  bar: "bar",
  pub: "bar",
  biergarten: "bar",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().slice(0, 100);
  const venuesOnly = searchParams.get("venues") === "1";
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", q);
  url.searchParams.set("countrycodes", "be");
  url.searchParams.set("limit", venuesOnly ? "15" : "8");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "nl");
  url.searchParams.set(
    "viewbox",
    `${ANTWERP_BOUNDS.west},${ANTWERP_BOUNDS.north},${ANTWERP_BOUNDS.east},${ANTWERP_BOUNDS.south}`,
  );
  url.searchParams.set("bounded", "1");

  try {
    const response = await fetch(url, {
      headers: NOMINATIM_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return NextResponse.json([], { status: 502 });
    }

    const results = (await response.json()) as NominatimResult[];
    const venues: Venue[] = results.map((item) => {
      const { address, city } = shortAddress(item);
      const type =
        item.category === "amenity" && item.type ? (VENUE_TYPES[item.type] ?? null) : null;
      return {
        osmId: `${item.osm_type}/${item.osm_id}`,
        name: item.name || item.display_name.split(",")[0],
        address,
        city,
        lat: Number(item.lat),
        lng: Number(item.lon),
        type,
      };
    });

    // Horeca eerst, daarna dubbels (zelfde naam + adres, bv. plein en tramhaltes) eruit.
    const ordered = [...venues].sort((a, b) => Number(b.type !== null) - Number(a.type !== null));
    const seen = new Set<string>();
    const unique = ordered.filter((v) => {
      const key = `${v.name.toLowerCase()}|${v.address.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json(venuesOnly ? unique.filter((v) => v.type !== null) : unique);
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
