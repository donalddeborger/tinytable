// Startpunt van de kaart: Antwerpen-stad.
export const ANTWERP = {
  lat: 51.2194,
  lng: 4.4025,
  zoom: 14,
};

// Provincie Antwerpen: van Bornem in het westen tot Mol/Balen in het oosten,
// van Hoogstraten in het noorden tot Heist-op-den-Berg in het zuiden.
export const ANTWERP_BOUNDS = {
  south: 50.95,
  west: 4.1,
  north: 51.51,
  east: 5.3,
};

// Alle postcodes van de provincie Antwerpen liggen tussen 2000 en 2999.
export function isProvincePostcode(postcode?: string): boolean {
  const code = Number(postcode?.trim().slice(0, 4));
  return Number.isInteger(code) && code >= 2000 && code <= 2999;
}

export function isInAntwerp(lat: number, lng: number): boolean {
  return (
    lat >= ANTWERP_BOUNDS.south &&
    lat <= ANTWERP_BOUNDS.north &&
    lng >= ANTWERP_BOUNDS.west &&
    lng <= ANTWERP_BOUNDS.east
  );
}

// Ligt een adres in de provincie Antwerpen? Met postcode is dat zeker;
// zonder postcode kijken we naar de ligging op de kaart.
export function isAntwerpAddress(postcode?: string, lat?: number, lng?: number): boolean {
  if (postcode?.trim()) return isProvincePostcode(postcode);
  return lat !== undefined && lng !== undefined && isInAntwerp(lat, lng);
}
