// Stuurt Donald een e-mail bij een nieuwe handmatige inzending (via Resend).
// Nodig in Vercel: RESEND_API_KEY en NOTIFY_EMAIL. Ontbreken ze, dan gebeurt er niets.

const AMENITY_NL: Record<string, string> = {
  changingTable: "Verschoningstafel",
  highChairs: "Kinderstoelen",
  playCorner: "Speelhoek",
  kidsMenu: "Kindermenu",
  playground: "Buitenspeeltuin",
  stroller: "Kinderwagenvriendelijk",
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
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;

  const rows = Object.entries(AMENITY_NL)
    .map(([k, label]) => {
      const v = place.amenities[k];
      return `<li>${label}: ${v === true ? "ja" : v === false ? "nee" : "?"}</li>`;
    })
    .join("");
  const map = `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=18/${place.lat}/${place.lng}`;
  const editor = "https://supabase.com/dashboard/project/rcthoxizcfdkhssmwxcq/editor";

  const html = `
    <h2>Nieuwe zaak wacht op goedkeuring</h2>
    <p><strong>${escape(place.name)}</strong> (${TYPE_NL[place.type] ?? place.type})<br>${escape(place.address)}</p>
    <ul>${rows}</ul>
    ${place.note ? `<p>Toelichting: ${escape(place.note)}</p>` : ""}
    <p><a href="${map}">Bekijk de locatie op de kaart</a></p>
    <p>Goedkeuren: open <a href="${editor}">Supabase</a> → tabel <em>places</em> → zet <em>approved</em> op true. Of vraag het aan Claude.</p>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? "TinyTable <onboarding@resend.dev>",
        to: [to],
        subject: `TinyTable: nieuwe zaak "${place.name}" wacht op goedkeuring`,
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
