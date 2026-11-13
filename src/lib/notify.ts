// Stuurt Donald een e-mail bij een nieuwe locatie of handmatige inzending (via Resend).
// Nodig in Vercel: RESEND_API_KEY en NOTIFY_EMAIL. Ontbreken ze, dan gebeurt er niets.

const AMENITY_NL: Record<string, string> = {
  changingTable: "Verschoningstafel",
  highChairs: "Kinderstoelen",
  playCorner: "Speelhoek",
  kidsMenu: "Kinderaanbod",
  playground: "Buitenspeeltuin",
  stroller: "Kinderwagentoegankelijk",
};

const TYPE_NL: Record<string, string> = { restaurant: "Restaurant", cafe: "Café", bar: "Koffiebar" };

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function notifyManualPlace(place: {
  name: string;
  address: string;
  type: string;
  lat: number;
  lng: number;
  amenities: Record<string, boolean | null>;
  note?: string;
}): Promise<void> {
  const rows = Object.entries(AMENITY_NL)
    .map(([k, label]) => {
      const v = place.amenities[k];
      return `<li>${label}: ${v === true ? "ja" : v === false ? "nee" : "?"}</li>`;
    })
    .join("");
  const map = `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=18/${place.lat}/${place.lng}`;
  const editor = "https://supabase.com/dashboard/project/rcthoxizcfdkhssmwxcq/editor";

  const html = `
    <h2>Nieuwe horecazaak wacht op goedkeuring</h2>
    <p><strong>${escape(place.name)}</strong> (${TYPE_NL[place.type] ?? place.type})<br>${escape(place.address)}</p>
    <ul>${rows}</ul>
    ${place.note ? `<p>Toelichting: ${escape(place.note)}</p>` : ""}
    <p><a href="${map}">Bekijk de locatie op de kaart</a></p>
    <p>Goedkeuren: open <a href="${editor}">Supabase</a> → tabel <em>places</em> → zet <em>approved</em> op true. Of vraag het aan Claude.</p>`;

  await sendMail(`TinyTable: nieuwe horecazaak "${place.name}" wacht op goedkeuring`, html);
}

// Korte melding wanneer iemand een horecazaak toevoegt die meteen op de kaart komt.
export async function notifyAddedPlace(place: {
  name: string;
  address: string;
  type: string;
  amenities: Record<string, boolean | null>;
}): Promise<void> {
  const weights: Record<string, number> = { changingTable: 1, highChairs: 1, playCorner: 1, kidsMenu: 1, playground: 0.5, stroller: 0.5 };
  const hearts = Object.entries(weights).reduce((sum, [k, w]) => sum + (place.amenities[k] === true ? w : 0), 0);
  const yes = Object.entries(AMENITY_NL)
    .filter(([k]) => place.amenities[k] === true)
    .map(([, label]) => label);
  const html = `
    <p><strong>${escape(place.name)}</strong> (${TYPE_NL[place.type] ?? place.type}) staat nu op TinyTable.</p>
    <p>${escape(place.address)}<br>${hearts} hartje${hearts === 1 ? "" : "s"}${yes.length ? ` · ${yes.join(", ")}` : ""}</p>
    <p><a href="https://www.tinytable.be">Bekijk op tinytable.be</a></p>`;
  await sendMail(`TinyTable: "${place.name}" toegevoegd`, html);
}

async function sendMail(subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? "TinyTable <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.error("E-mail niet verstuurd:", response.status, await response.text());
  } catch (error) {
    // De inzending zelf is wel bewaard; een mislukte e-mail mag dat niet tegenhouden.
    console.error("E-mail niet verstuurd:", error);
  }
}
