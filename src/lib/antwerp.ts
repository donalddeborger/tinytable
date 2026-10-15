export const ANTWERP = {
  lat: 51.2194,
  lng: 4.4025,
  zoom: 14,
};

export const ANTWERP_BOUNDS = {
  south: 51.16,
  west: 4.29,
  north: 51.28,
  east: 4.5,
};

export function isInAntwerp(lat: number, lng: number): boolean {
  return (
    lat >= ANTWERP_BOUNDS.south &&
    lat <= ANTWERP_BOUNDS.north &&
    lng >= ANTWERP_BOUNDS.west &&
    lng <= ANTWERP_BOUNDS.east
  );
}
