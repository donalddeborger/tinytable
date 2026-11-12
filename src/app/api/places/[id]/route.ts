import { NextResponse } from "next/server";
import { getPlace, updatePlace, WriteError } from "@/lib/store";
import { clientId, isBot } from "@/lib/client";
import { parsePlacePatch } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  try {
    const place = await getPlace(id);
    if (!place) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }
    return NextResponse.json(place);
  } catch (error) {
    console.error("Plek ophalen mislukt:", error);
    return NextResponse.json(
      { error: "De locatie kon niet worden geladen" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (isBot(body)) {
    return NextResponse.json({ error: "Ongeldige gegevens" }, { status: 400 });
  }
  const patch = parsePlacePatch(body);
  if (!patch) {
    return NextResponse.json({ error: "Geen voorzieningen" }, { status: 400 });
  }

  try {
    const place = await updatePlace(id, patch, clientId(request));
    if (!place) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }
    return NextResponse.json(place);
  } catch (error) {
    if (error instanceof WriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Plek bijwerken mislukt:", error);
    return NextResponse.json(
      { error: "De info kon niet worden bewaard" },
      { status: 500 },
    );
  }
}
