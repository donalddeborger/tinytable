import { NextResponse } from "next/server";
import { addPlace, listPlaces, WriteError } from "@/lib/store";
import { clientId, isBot } from "@/lib/client";
import { parsePlaceInput } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listPlaces());
  } catch (error) {
    console.error("Plekken ophalen mislukt:", error);
    return NextResponse.json(
      { error: "Locaties konden niet worden geladen" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (isBot(body)) {
    return NextResponse.json({ error: "Ongeldige gegevens" }, { status: 400 });
  }
  const parsed = parsePlaceInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const place = await addPlace(parsed.value, clientId(request));
    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    if (error instanceof WriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Plek toevoegen mislukt:", error);
    return NextResponse.json(
      { error: "De horecazaak kon niet worden bewaard" },
      { status: 500 },
    );
  }
}
