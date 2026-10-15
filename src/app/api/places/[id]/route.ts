import { NextResponse } from "next/server";
import { getPlace, updatePlace } from "@/lib/store";
import type { Amenities } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const place = await getPlace(id);
  if (!place) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  return NextResponse.json(place);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    amenities?: Amenities;
    note?: string;
  };

  if (!body.amenities) {
    return NextResponse.json({ error: "Geen voorzieningen" }, { status: 400 });
  }

  const place = await updatePlace(id, {
    amenities: body.amenities,
    note: body.note,
  });

  if (!place) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  return NextResponse.json(place);
}
