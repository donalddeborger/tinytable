import { NextResponse } from "next/server";
import { isInAntwerp } from "@/lib/antwerp";
import { NOMINATIM_HEADERS, shortAddress, type NominatimResult } from "@/lib/osm";

export const runtime = "nodejs";

// Zoekt het adres (met huisnummer) bij een locatie, voor zaken waarvan
// OpenStreetMap zelf geen volledig adres kent.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !isInAntwerp(lat, lng)) {
    return NextResponse.json({ error: "Ongeldige locatie" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", lat.toFixed(6));
  url.searchParams.set("lon", lng.toFixed(6));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "nl");

  try {
    const response = await fetch(url, {
      headers: NOMINATIM_HEADERS,
      next: { revalidate: 86400 },
    });
    if (!response.ok) return NextResponse.json({ error: "Niet gevonden" }, { status: 502 });
    const item = (await response.json()) as NominatimResult;
    const { address, city } = shortAddress(item);
    return NextResponse.json({
      address,
      city,
      hasNumber: Boolean(item.address?.house_number),
    });
  } catch {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 502 });
  }
}
