import { NextResponse } from "next/server";
import { ANTWERP, ANTWERP_BOUNDS } from "@/lib/antwerp";
import type { PlaceType, Venue } from "@/lib/types";
import {
  NOMINATIM_HEADERS,
  photonToPlace,
  shortAddress,
  type NominatimResult,
  type PhotonFeature,
} from "@/lib/osm";

export const runtime = "nodejs";

// OpenStreetMap-categorieën die we als horeca beschouwen.
// OSM "cafe" = koffiezaak → koffiebar ("bar"); OSM bar/pub = Belgisch café ("cafe").
const VENUE_TYPES: Record<string, PlaceType> = {
  restaurant: "restaurant",
  fast_food: "restaurant",
  food_court: "restaurant",
  cafe: "bar",
  ice_cream: "bar",
  bar: "cafe",
  pub: "cafe",
  biergarten: "cafe",
};

// 1) Photon: vindt ook een half getypte naam ("Peerde" → De Peerdestal).
async function searchPhoton(q: string): Promise<Venue[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("lat", String(ANTWERP.lat));
  url.searchParams.set("lon", String(ANTWERP.lng));
  url.searchParams.set("limit", "20");
  url.searchParams.set(
    "bbox",
    `${ANTWERP_BOUNDS.west},${ANTWERP_BOUNDS.south},${ANTWERP_BOUNDS.east},${ANTWERP_BOUNDS.north}`,
  );
  url.searchParams.set("osm_tag", "amenity");

  const response = await fetch(url, {
    headers: NOMINATIM_HEADERS,
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error(`Photon ${response.status}`);
  const data = (await response.json()) as { features?: PhotonFeature[] };

  const venues: Venue[] = [];
  for (const feature of data.features ?? []) {
    const item = photonToPlace(feature);
    if (!item || item.key !== "amenity") continue;
    const type = VENUE_TYPES[item.value];
    if (!type) continue;
    venues.push({
      osmId: item.osmId,
      name: item.name,
      address: item.address,
      city: item.city,
      lat: item.lat,
      lng: item.lng,
      type,
    });
  }
  return venues;
}

// 2) Reserve: Nominatim (alleen volledige woorden).
async function searchNominatim(q: string): Promise<Venue[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", q);
  url.searchParams.set("countrycodes", "be");
  url.searchParams.set("limit", "15");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "nl");
  url.searchParams.set(
    "viewbox",
    `${ANTWERP_BOUNDS.west},${ANTWERP_BOUNDS.north},${ANTWERP_BOUNDS.east},${ANTWERP_BOUNDS.south}`,
  );
  url.searchParams.set("bounded", "1");

  const response = await fetch(url, {
    headers: NOMINATIM_HEADERS,
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Nominatim ${response.status}`);
  const results = (await response.json()) as NominatimResult[];

  return results
    .map((item) => {
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
    })
    .filter((v) => v.type !== null);
}

function dedupe(venues: Venue[]): Venue[] {
  const seen = new Set<string>();
  return venues.filter((v) => {
    const key = `${v.name.toLowerCase()}|${v.address.toLowerCase()}`;
    if (seen.has(key) || seen.has(v.osmId)) return false;
    seen.add(key);
    seen.add(v.osmId);
    return true;
  });
}

// Zoekt horecazaken in Antwerpen op naam. (Straten en pleinen worden niet getoond.)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().slice(0, 100);
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  let venues: Venue[] = [];
  try {
    venues = await searchPhoton(q);
  } catch (error) {
    console.warn("Photon niet beschikbaar, terugval op Nominatim:", error);
  }

  if (venues.length === 0) {
    try {
      venues = await searchNominatim(q);
    } catch (error) {
      console.error("Zoeken mislukt:", error);
      return NextResponse.json([], { status: 502 });
    }
  }

  return NextResponse.json(dedupe(venues).slice(0, 15));
}
