import { NextResponse } from "next/server";
import { addPlace, listPlaces } from "@/lib/store";
import { parsePlaceInput } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listPlaces());
  } catch (error) {
    console.error("Plekken ophalen mislukt:", error);
    return NextResponse.json(
      { error: "Plekken konden niet worden geladen" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parsePlaceInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const place = await addPlace(parsed.value);
    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    console.error("Plek toevoegen mislukt:", error);
    return NextResponse.json(
      { error: "De plek kon niet worden bewaard" },
      { status: 500 },
    );
  }
}
