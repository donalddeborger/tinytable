import { NextResponse } from "next/server";
import { confirmPlace, WriteError } from "@/lib/store";
import { clientId, isBot } from "@/lib/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  if (isBot(body)) return NextResponse.json({ error: "Ongeldige gegevens" }, { status: 400 });
  try {
    const place = await confirmPlace(id, clientId(request));
    if (!place) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    return NextResponse.json(place);
  } catch (error) {
    if (error instanceof WriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Bevestigen mislukt:", error);
    return NextResponse.json({ error: "De info kon niet worden bewaard" }, { status: 500 });
  }
}
