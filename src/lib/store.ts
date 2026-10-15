import { promises as fs } from "fs";
import path from "path";
import type { Place, PlaceInput } from "./types";

const FILE = path.join(process.cwd(), "data", "places.json");

async function readAll(): Promise<Place[]> {
  const raw = await fs.readFile(FILE, "utf8");
  return JSON.parse(raw) as Place[];
}

async function writeAll(places: Place[]): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(places, null, 2), "utf8");
}

export async function listPlaces(): Promise<Place[]> {
  return readAll();
}

export async function getPlace(id: string): Promise<Place | undefined> {
  const places = await readAll();
  return places.find((place) => place.id === id);
}

export async function addPlace(input: PlaceInput): Promise<Place> {
  const places = await readAll();
  const place: Place = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    type: input.type,
    address: input.address.trim(),
    city: input.city?.trim() || "Antwerpen",
    lat: input.lat,
    lng: input.lng,
    amenities: input.amenities,
    updatedAt: new Date().toISOString(),
    note: input.note?.trim() || undefined,
  };
  places.push(place);
  await writeAll(places);
  return place;
}

export async function updatePlace(
  id: string,
  patch: Partial<Pick<Place, "amenities" | "note" | "name" | "address" | "type">>,
): Promise<Place | undefined> {
  const places = await readAll();
  const index = places.findIndex((place) => place.id === id);
  if (index === -1) return undefined;
  const next: Place = {
    ...places[index],
    ...patch,
    amenities: patch.amenities ?? places[index].amenities,
    note:
      patch.note !== undefined
        ? patch.note.trim() || undefined
        : places[index].note,
    updatedAt: new Date().toISOString(),
  };
  places[index] = next;
  await writeAll(places);
  return next;
}
