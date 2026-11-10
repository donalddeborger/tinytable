import { AMENITIES } from "./score";
import type { Amenities, PlaceInput, PlacePatch, PlaceType } from "./types";

const TYPES: PlaceType[] = ["restaurant", "bar", "cafe"];

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function parseAmenities(value: unknown): Amenities | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const result = {} as Amenities;
  for (const { key } of AMENITIES) {
    const v = source[key];
    result[key] = v === true ? true : v === false ? false : null;
  }
  return result;
}

export function parseNote(value: unknown): string | undefined {
  return text(value, 500) || undefined;
}

const OSM_ID = /^(node|way|relation)\/\d{1,15}$/;

export function parseOsmId(value: unknown): string | undefined {
  return typeof value === "string" && OSM_ID.test(value) ? value : undefined;
}

export function parsePlacePatch(body: unknown): PlacePatch | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const amenities = parseAmenities(b.amenities);
  if (!amenities) return null;
  return {
    amenities,
    note: parseNote(b.note),
    name: text(b.name, 120) || undefined,
    address: text(b.address, 300) || undefined,
    type: TYPES.includes(b.type as PlaceType) ? (b.type as PlaceType) : undefined,
  };
}

export function parsePlaceInput(
  body: unknown,
): { ok: true; value: PlaceInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Ongeldige gegevens" };
  }
  const b = body as Record<string, unknown>;

  const name = text(b.name, 120);
  if (!name) return { ok: false, error: "Geef de plek een naam" };

  const type = TYPES.includes(b.type as PlaceType)
    ? (b.type as PlaceType)
    : "restaurant";

  const lat = Number(b.lat);
  const lng = Number(b.lng);
  if (
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    Math.abs(lat) > 90 || Math.abs(lng) > 180
  ) {
    return { ok: false, error: "Ongeldige locatie" };
  }

  const amenities = parseAmenities(b.amenities);
  if (!amenities) return { ok: false, error: "Geen voorzieningen" };

  return {
    ok: true,
    value: {
      name,
      type,
      address: text(b.address, 300),
      city: text(b.city, 80) || "Antwerpen",
      lat,
      lng,
      amenities,
      note: parseNote(b.note),
      osmId: parseOsmId(b.osmId),
    },
  };
}
