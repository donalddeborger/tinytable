import { NextResponse } from "next/server";
import { addPlace, listPlaces } from "@/lib/store";
import type { Amenities, PlaceType } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const places = await listPlaces();
  return NextResponse.json(places);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    type?: PlaceType;
    address?: string;
    city?: string;
    lat?: number;
    lng?: number;
    amenities?: Amenities;
    note?: string;
  };

  if (
    !body.name?.trim() ||
    !body.type ||
    typeof body.lat !== "number" ||
    typeof body.lng !== "number" ||
    !body.amenities
  ) {
    return NextResponse.json({ error: "Onvolledige gegevens" }, { status: 400 });
  }

  const place = await addPlace({
    name: body.name,
    type: body.type,
    address: body.address ?? "",
    city: body.city,
    lat: body.lat,
    lng: body.lng,
    amenities: body.amenities,
    note: body.note,
  });

  return NextResponse.json(place, { status: 201 });
}
