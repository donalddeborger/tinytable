import { getSupabase } from "./supabase";
import { emptyAmenities } from "./score";
import type { Amenities, Place, PlaceInput, PlacePatch, PlaceType } from "./types";

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
  osm_id: string | null;
  manual?: boolean | null;
  source?: string | null;
  confirm_count?: number | null;
  last_confirmed_at?: string | null;
  opening_hours?: string | null;
};

// Fout die we veilig aan de bezoeker kunnen tonen, met HTTP-status.
export class WriteError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function apiToken(): string {
  const token = process.env.TINYTABLE_API_TOKEN;
  if (!token) throw new Error("TINYTABLE_API_TOKEN ontbreekt");
  return token;
}

function toWriteError(error: { code?: string; message?: string }): Error {
  switch (error.code) {
    case "23505":
      return new WriteError("Deze zaak staat al in TinyTable", 409);
    case "TT400":
    case "22023":
      return new WriteError(error.message ?? "Ongeldige gegevens", 400);
    case "TT429":
      return new WriteError(error.message ?? "Even te veel aanpassingen", 429);
    default:
      return new Error(`${error.code ?? ""} ${error.message ?? "Onbekende fout"}`);
  }
}

const COLUMNS =
  "id, name, type, address, city, lat, lng, amenities, note, created_at, updated_at, osm_id, manual, source, confirm_count, last_confirmed_at, opening_hours";

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
    osmId: row.osm_id ?? undefined,
    locked: Boolean(row.osm_id) || Boolean(row.manual),
    source: row.source === "osm" ? "osm" : "user",
    confirmCount: row.confirm_count ?? 0,
    lastConfirmedAt: row.last_confirmed_at ?? undefined,
    openingHours: row.opening_hours ?? undefined,
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

export async function addPlace(input: PlaceInput, client: string): Promise<Place> {
  const { data, error } = await getSupabase()
    .rpc("add_place_v3", {
      p_token: apiToken(),
      p_client: client,
      p_name: input.name,
      p_type: input.type,
      p_address: input.address,
      p_city: input.city || "Antwerpen",
      p_lat: input.lat,
      p_lng: input.lng,
      p_amenities: input.amenities,
      p_note: input.note ?? null,
      p_osm_id: input.osmId ?? null,
    })
    .single();
  if (error) throw toWriteError(error);
  return toPlace(data as PlaceRow);
}

export async function updatePlace(
  id: string,
  patch: PlacePatch,
  client: string,
): Promise<Place | undefined> {
  const { data, error } = await getSupabase()
    .rpc("update_place_v3", {
      p_token: apiToken(),
      p_client: client,
      p_id: id,
      p_amenities: patch.amenities,
      p_note: patch.note ?? null,
      p_name: patch.name ?? null,
      p_address: patch.address ?? null,
      p_type: patch.type ?? null,
    })
    .maybeSingle();
  if (error) throw toWriteError(error);
  const row = data as PlaceRow | null;
  return row && row.id ? toPlace(row) : undefined;
}

// Handmatig toegevoegd (niet gevonden in de zoekfunctie): wacht op goedkeuring.
export async function addManualPlace(input: PlaceInput, client: string): Promise<void> {
  const { error } = await getSupabase().rpc("add_place_manual_v1", {
    p_token: apiToken(),
    p_client: client,
    p_name: input.name,
    p_type: input.type,
    p_address: input.address,
    p_city: input.city || "Antwerpen",
    p_lat: input.lat,
    p_lng: input.lng,
    p_amenities: input.amenities,
    p_note: input.note ?? null,
  });
  if (error) throw toWriteError(error);
}

// "Klopt dit nog?" → Ja: telt als bevestiging door een ouder.
export async function confirmPlace(id: string, client: string): Promise<Place | undefined> {
  const { data, error } = await getSupabase()
    .rpc("confirm_place_v1", { p_token: apiToken(), p_client: client, p_id: id })
    .maybeSingle();
  if (error) throw toWriteError(error);
  const row = data as PlaceRow | null;
  return row && row.id ? toPlace(row) : undefined;
}
