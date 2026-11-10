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
