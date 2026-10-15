export type PlaceType = "restaurant" | "bar" | "cafe";

export type AmenityKey =
  | "changingTable"
  | "highChairs"
  | "playCorner"
  | "kidsMenu";

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
};
