// "cafe" = Belgisch café; "bar" = koffiebar (zo opgeslagen in de database).
export type PlaceType = "restaurant" | "bar" | "cafe";

export type AmenityKey =
  | "changingTable"
  | "highChairs"
  | "playCorner"
  | "kidsMenu"
  | "playground";

export type AmenityValue = boolean | null;

export type Amenities = Record<AmenityKey, AmenityValue>;

export type Place = {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  city: string;
  lat: number;
  lng: number;
  amenities: Amenities;
  updatedAt: string;
  note?: string;
  osmId?: string;
  // Naam en adres liggen vast (opgezocht of nagekeken).
  locked?: boolean;
};

export type PlaceInput = {
  name: string;
  type: PlaceType;
  address: string;
  city?: string;
  lat: number;
  lng: number;
  amenities: Amenities;
  note?: string;
  osmId?: string;
};

export type PlacePatch = {
  amenities: Amenities;
  note?: string;
  name?: string;
  address?: string;
  type?: PlaceType;
};

// Een zoekresultaat uit OpenStreetMap.
export type Venue = {
  osmId: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  type: PlaceType | null; // null = geen horecazaak (bv. een straat)
};
