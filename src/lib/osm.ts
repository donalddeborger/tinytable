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
