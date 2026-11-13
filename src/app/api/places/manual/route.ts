import { NextResponse } from "next/server";
import { isAntwerpAddress, isInAntwerp, isProvincePostcode } from "@/lib/antwerp";
import { clientId, isBot } from "@/lib/client";
import { geocodeAddress } from "@/lib/osm";
import { addManualPlace, WriteError } from "@/lib/store";
import { notifyManualPlace } from "@/lib/notify";
import { parseAmenities, parseNote } from "@/lib/validate";
import type { PlaceType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: PlaceType[] = ["restaurant", "bar", "cafe"];

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

// Zaak die niet in de zoekfunctie staat: adres wordt hier opgezocht, en de
// zaak wordt pas zichtbaar nadat ze is goedgekeurd.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || isBot(body)) {
    return NextResponse.json({ error: "Ongeldige gegevens" }, { status: 400 });
  }

  const name = text(body.name, 120);
  const street = text(body.street, 200);
  const postcode = text(body.postcode, 4);
  const amenities = parseAmenities(body.amenities);
  const type = TYPES.includes(body.type as PlaceType) ? (body.type as PlaceType) : "restaurant";

  if (name.length < 2) return NextResponse.json({ error: "Geef de horecazaak een naam" }, { status: 400 });
  if (!/\d/.test(street) || !isProvincePostcode(postcode)) {
    return NextResponse.json({ error: "Vul straat en huisnummer in" }, { status: 400 });
  }
  if (!amenities) return NextResponse.json({ error: "Geen voorzieningen" }, { status: 400 });

  let found;
  try {
    found = await geocodeAddress(street, postcode);
  } catch (error) {
    console.error("Adres opzoeken mislukt:", error);
    return NextResponse.json({ error: "Adres niet gevonden" }, { status: 502 });
  }
  if (
    !found ||
    !isInAntwerp(found.lat, found.lng) ||
    !isAntwerpAddress(found.postcode, found.lat, found.lng)
  ) {
    return NextResponse.json({ error: "Adres niet gevonden" }, { status: 400 });
  }

  try {
    const input = {
      name,
      type,
      // Het adres zoals ingevuld (met huisnummer), de locatie van de kaart.
      // Bij een verbeterde schrijfwijze (tikfout in de straat) het juiste adres bewaren.
      address: `${found.corrected ? found.address : street}, ${postcode} ${found.city}`,
      city: found.city,
      lat: found.lat,
      lng: found.lng,
      amenities,
      note: parseNote(body.note),
    };
    await addManualPlace(input, clientId(request));
    await notifyManualPlace(input);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof WriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Handmatig toevoegen mislukt:", error);
    return NextResponse.json({ error: "De horecazaak kon niet worden bewaard" }, { status: 500 });
  }
}
