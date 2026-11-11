export const ANTWERP = {
  lat: 51.2194,
  lng: 4.4025,
  zoom: 14,
};

// Antwerpen met alle districten: van Berendrecht-Zandvliet-Lillo in het
// noorden tot Hoboken en Wilrijk in het zuiden.
export const ANTWERP_BOUNDS = {
  south: 51.13,
  west: 4.2,
  north: 51.4,
  east: 4.52,
};

// Postcodes van de stad Antwerpen en haar districten.
export const ANTWERP_POSTCODES = new Set([
  "2000", "2018", "2020", "2030", "2040", "2050", "2060", // Antwerpen, haven, Berendrecht-Zandvliet-Lillo, Linkeroever
  "2100", // Deurne
  "2140", // Borgerhout
  "2170", // Merksem
  "2180", // Ekeren
  "2600", // Berchem
  "2610", // Wilrijk
  "2660", // Hoboken
]);

const DISTRICT_NAMES = new Set([
  "antwerpen", "berchem", "borgerhout", "deurne", "ekeren", "hoboken", "merksem",
  "wilrijk", "berendrecht", "zandvliet", "lillo", "linkeroever", "antwerpen-noord",
]);

// Ligt een adres in Antwerpen of een van haar districten?
export function isAntwerpAddress(postcode?: string, city?: string): boolean {
  const code = postcode?.trim().slice(0, 4);
  if (code) return ANTWERP_POSTCODES.has(code);
  return DISTRICT_NAMES.has((city ?? "").trim().toLowerCase());
}

export function isInAntwerp(lat: number, lng: number): boolean {
  return (
    lat >= ANTWERP_BOUNDS.south &&
    lat <= ANTWERP_BOUNDS.north &&
    lng >= ANTWERP_BOUNDS.west &&
    lng <= ANTWERP_BOUNDS.east
  );
}
