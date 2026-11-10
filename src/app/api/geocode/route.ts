import { NextResponse } from "next/server";
import { ANTWERP_BOUNDS } from "@/lib/antwerp";
import type { PlaceType, Venue } from "@/lib/types";

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

type NominatimResult = {
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  category?: string;
  type?: string;
  name?: string;
  display_name: string;
  address?: {
    road?: string;
    pedestrian?: string;
    square?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
  };
};

function shortAddress(item: NominatimResult): { address: string; city: string } {
  const a = item.address ?? {};
  const street = a.road ?? a.pedestrian ?? a.square ?? "";
  const city = a.city ?? a.town ?? a.village ?? "Antwerpen";
  const line1 = [street, a.house_number].filter(Boolean).join(" ");
  const line2 = [a.postcode, a.suburb && a.suburb !== city ? a.suburb : city]
    .filter(Boolean)
    .join(" ");
  const address = [line1, line2].filter(Boolean).join(", ");
  return { address: address || item.display_name.split(",").slice(0, 3).join(","), city };
}

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
      headers: {
        "User-Agent": "TinyTable/0.2 (https://www.tinytable.be)",
        Accept: "application/json",
      },
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

    return NextResponse.json(venuesOnly ? venues.filter((v) => v.type !== null) : venues);
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
