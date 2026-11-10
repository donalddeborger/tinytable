import { getSupabase } from "./supabase";
import { emptyAmenities } from "./score";
import type { Amenities, Place, PlaceInput, PlaceType } from "./types";

// Zoals de rij in de Supabase-tabel 'places' eruitziet.
type PlaceRow = {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  city: string;
  lat: number;
  lng: number;
  amenities: Partial<Amenities> | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

const COLUMNS =
  "id, name, type, address, city, lat, lng, amenities, note, created_at, updated_at";

function toPlace(row: PlaceRow): Place {
  return {
    id: String(row.id),
    name: row.name,
    type: row.type,
    address: row.address,
    city: row.city,
    lat: row.lat,
    lng: row.lng,
    amenities: { ...emptyAmenities(), ...(row.amenities ?? {}) },
    updatedAt: row.updated_at,
    note: row.note ?? undefined,
  };
}

export async function listPlaces(): Promise<Place[]> {
  const { data, error } = await getSupabase()
    .from("places")
    .select(COLUMNS)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as PlaceRow[]).map(toPlace);
}

export async function getPlace(id: string): Promise<Place | undefined> {
  const { data, error } = await getSupabase()
    .from("places")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toPlace(data as PlaceRow) : undefined;
}

export async function addPlace(input: PlaceInput): Promise<Place> {
  const { data, error } = await getSupabase()
    .rpc("add_place", {
      p_name: input.name,
      p_type: input.type,
      p_address: input.address,
      p_city: input.city || "Antwerpen",
      p_lat: input.lat,
      p_lng: input.lng,
      p_amenities: input.amenities,
      p_note: input.note ?? null,
    })
    .single();
  if (error) throw error;
  return toPlace(data as PlaceRow);
}

export async function updatePlace(
  id: string,
  patch: { amenities: Amenities; note?: string },
): Promise<Place | undefined> {
  const { data, error } = await getSupabase()
    .rpc("update_place", {
      p_id: id,
      p_amenities: patch.amenities,
      p_note: patch.note ?? null,
    })
    .maybeSingle();
  if (error) throw error;
  const row = data as PlaceRow | null;
  return row && row.id ? toPlace(row) : undefined;
}
