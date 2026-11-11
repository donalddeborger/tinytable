import { NextResponse } from "next/server";
import { NOMINATIM_HEADERS } from "@/lib/osm";
import type { Amenities, PlaceType } from "@/lib/types";

// Hulproute voor de eenmalige import: zaken in Antwerpen-stad (met districten)
// waarvoor OpenStreetMap echte kindgegevens bevat, plus openingsuren.
// Alleen lezen, publieke gegevens, een dag gecachet.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const TYPES: Record<string, PlaceType> = {
  restaurant: "restaurant",
  fast_food: "restaurant",
  food_court: "restaurant",
  cafe: "bar",
  ice_cream: "bar",
  bar: "cafe",
  pub: "cafe",
  biergarten: "cafe",
};

type Element = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

async function overpass(query: string): Promise<Element[]> {
  let lastError: unknown = null;
  for (const url of SERVERS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { ...NOMINATIM_HEADERS, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(60000),
        next: { revalidate: 86400 },
      });
      if (!response.ok) throw new Error(`${url} ${response.status}`);
      const data = (await response.json()) as { elements?: Element[] };
      return data.elements ?? [];
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function yesNo(value: string | undefined): boolean | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === "yes" || /^[1-9]\d*$/.test(v)) return true;
  if (v === "no" || v === "0") return false;
  return null;
}

function amenitiesFrom(tags: Record<string, string>): Amenities {
  const indoor = yesNo(tags["kids_area:indoor"]);
  const outdoor = yesNo(tags["kids_area:outdoor"]);
  const area = yesNo(tags["kids_area"]);
  return {
    changingTable: yesNo(tags["changing_table"]),
    highChairs: yesNo(tags["highchair"]),
    playCorner: indoor ?? (outdoor === true ? null : area),
    kidsMenu: yesNo(tags["menu:kids"]) ?? yesNo(tags["kids_menu"]),
    playground: outdoor,
    stroller: yesNo(tags["stroller"]),
  };
}

export async function GET() {
  const query = `[out:json][timeout:90];
area["boundary"="administrative"]["admin_level"="8"]["name"="Antwerpen"]->.a;
nwr["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|biergarten|food_court)$"](area.a);
out tags center;`;
  try {
    const elements = await overpass(query);
    const all = elements
      .filter((e) => e.tags?.name && TYPES[e.tags.amenity ?? ""])
      .map((e) => {
        const t = e.tags ?? {};
        const lat = e.lat ?? e.center?.lat ?? 0;
        const lng = e.lon ?? e.center?.lon ?? 0;
        const street = [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" ");
        const town = t["addr:city"] ?? "Antwerpen";
        const line2 = [t["addr:postcode"], town].filter(Boolean).join(" ");
        const kidTags = Object.fromEntries(
          Object.entries(t).filter(([k]) =>
            /^(changing_table|highchair|kids_area|menu:kids|kids_menu|stroller)/.test(k),
          ),
        );
        return {
          osmId: `${e.type}/${e.id}`,
          name: t.name,
          type: TYPES[t.amenity ?? ""],
          lat,
          lng,
          address: [street, line2].filter(Boolean).join(", "),
          hasNumber: Boolean(t["addr:housenumber"]),
          postcode: t["addr:postcode"] ?? null,
          openingHours: t.opening_hours ?? null,
          amenities: amenitiesFrom(t),
          kidTags,
        };
      });
    const withKids = all.filter((p) => Object.values(p.amenities).some((v) => v === true));
    return NextResponse.json({
      total: all.length,
      withKidInfo: withKids.length,
      places: withKids,
      hours: Object.fromEntries(all.filter((p) => p.openingHours).map((p) => [p.osmId, p.openingHours])),
    });
  } catch (error) {
    console.error("OpenStreetMap ophalen mislukt:", error);
    return NextResponse.json({ error: "OpenStreetMap niet bereikbaar" }, { status: 502 });
  }
}
