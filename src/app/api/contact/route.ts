import { NextResponse } from "next/server";
import { isBot } from "@/lib/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Contactformulier: stuurt het bericht per e-mail door (zelfde Resend-instelling als de meldingen).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || isBot(body)) return NextResponse.json({ error: "Ongeldige gegevens" }, { status: 400 });
  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const message = clean(body.message, 3000);
  if (message.length < 5) return NextResponse.json({ error: "Schrijf een bericht" }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Ongeldig e-mailadres" }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return NextResponse.json({ error: "Versturen lukt nu niet" }, { status: 503 });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM ?? "TinyTable <onboarding@resend.dev>",
      to: [to],
      ...(email ? { reply_to: email } : {}),
      subject: `TinyTable: bericht van ${name || "een bezoeker"}`,
      html: `<p><strong>${escape(name || "Anoniem")}</strong>${email ? ` (${escape(email)})` : ""} schreef:</p><p style="white-space:pre-wrap">${escape(message)}</p>`,
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  if (!response?.ok) return NextResponse.json({ error: "Versturen lukt nu niet" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
