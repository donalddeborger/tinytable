// Hulpfuncties voor OpenStreetMap (Nominatim).

export const NOMINATIM_HEADERS = {
  "User-Agent": "TinyTable/0.3 (https://www.tinytable.be)",
  Accept: "application/json",
};

export type NominatimResult = {
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

export function shortAddress(item: NominatimResult): { address: string; city: string } {
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

// ---------------------------------------------------------------------------
// Photon (komoot): zoekt al tijdens het typen, ook op een deel van een naam.

export type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    osm_type?: string; // "N" | "W" | "R"
    osm_id?: number;
    osm_key?: string;
    osm_value?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    locality?: string;
  };
};

const PHOTON_TYPES: Record<string, string> = { N: "node", W: "way", R: "relation" };

export function photonToPlace(feature: PhotonFeature): {
  osmId: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  key: string;
  value: string;
  postcode?: string;
  rawCity?: string;
} | null {
  const p = feature.properties ?? {};
  const coords = feature.geometry?.coordinates;
  const kind = p.osm_type ? PHOTON_TYPES[p.osm_type] : undefined;
  if (!kind || !p.osm_id || !p.name || !coords) return null;
  const city = p.city ?? "Antwerpen";
  const line1 = [p.street, p.housenumber].filter(Boolean).join(" ");
  const place = p.district && p.district !== city ? p.district : city;
  const line2 = [p.postcode, place].filter(Boolean).join(" ");
  return {
    osmId: `${kind}/${p.osm_id}`,
    name: p.name,
    address: [line1, line2].filter(Boolean).join(", ") || city,
    city,
    lat: coords[1],
    lng: coords[0],
    key: p.osm_key ?? "",
    value: p.osm_value ?? "",
    postcode: p.postcode,
    rawCity: p.city,
  };
}

// ---------------------------------------------------------------------------
// Adres opzoeken (straat + huisnummer + postcode) → locatie op de kaart.

export async function geocodeAddress(
  street: string,
  postcode: string,
): Promise<{ lat: number; lng: number; address: string; city: string; postcode?: string; corrected?: boolean } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("street", street);
  url.searchParams.set("postalcode", postcode);
  url.searchParams.set("country", "België");
  url.searchParams.set("countrycodes", "be");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "nl");

  const response = await fetch(url, {
    headers: NOMINATIM_HEADERS,
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`Nominatim ${response.status}`);
  const [item] = (await response.json()) as NominatimResult[];
  // Niets gevonden (bv. een tikfout: "Schrijnwerkerstraat")? Dan Photon proberen,
  // dat ook een straatnaam met kleine fouten herkent.
  if (!item) return geocodeAddressFuzzy(street, postcode);
  const { address, city } = shortAddress(item);
  return {
    lat: Number(item.lat),
    lng: Number(item.lon),
    address,
    city,
    postcode: item.address?.postcode,
  };
}

// Reserve: Photon zoekt "straat huisnummer postcode" met tolerantie voor tikfouten.
// Geeft de juiste schrijfwijze van de straat terug (corrected: true).
async function geocodeAddressFuzzy(
  street: string,
  postcode: string,
): Promise<{ lat: number; lng: number; address: string; city: string; postcode?: string; corrected?: boolean } | null> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", `${street} ${postcode}`);
  url.searchParams.set("lat", "51.2194");
  url.searchParams.set("lon", "4.4025");
  url.searchParams.set("limit", "10");
  url.searchParams.set("lang", "default"); // lokale namen: "Antwerpen", niet "Antwerp"
  try {
    const response = await fetch(url, { headers: NOMINATIM_HEADERS, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const data = (await response.json()) as { features?: PhotonFeature[] };
    const number = (street.match(/\d+\s*[a-zA-Z]?/g) ?? []).pop()?.replace(/\s+/g, "").toLowerCase();
    const candidates = (data.features ?? []).filter(
      (f) =>
        f.properties?.postcode === postcode &&
        (f.properties as { countrycode?: string }).countrycode === "BE" &&
        f.geometry?.coordinates,
    );
    // Liefst exact het huisnummer, anders de straat zelf.
    const best =
      candidates.find((f) => number && f.properties?.housenumber?.toLowerCase() === number) ??
      candidates.find((f) => f.properties?.osm_key === "highway" || f.properties?.street) ??
      candidates[0];
    if (!best) return null;
    const p = best.properties ?? {};
    const [lng, lat] = best.geometry!.coordinates!;
    const streetName = p.street ?? (p.osm_key === "highway" ? p.name : undefined);
    const address = streetName ? [streetName, p.housenumber ?? number].filter(Boolean).join(" ") : street;
    return { lat, lng, address, city: p.city ?? "Antwerpen", postcode: p.postcode, corrected: Boolean(streetName) };
  } catch {
    return null;
  }
}
