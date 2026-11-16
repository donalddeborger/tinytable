# TinyTable – projectgids voor Claude

TinyTable (www.tinytable.be) is een kaart en lijst van kindvriendelijke restaurants, cafés en koffiebars in Antwerpen (provincie). Eigenaar: Donald. Communiceer met hem in het **Nederlands (Vlaams)**, kort en concreet.

## Stack
- Next.js 15 (App Router), React 19, TypeScript. Kaart: react-leaflet + maplibre (OpenFreeMap-tegels).
- Database: Supabase (project `rcthoxizcfdkhssmwxcq`), tabel `public.places`.
- Hosting: Vercel (Hobby), team `team_sLErRt70YASopuenSDbTKisi`, project `prj_aeVp3QiTzZdLXRj1DMVF52qXW3DG`. **Elke push naar `main` deployt automatisch naar productie.**
- Analytics: `@vercel/analytics` (`track()` voor events). E-mail: Resend (`src/lib/notify.ts`).
- Vertalingen: `src/lib/i18n.tsx` (nl + en; `Dict = typeof nl`, foutmeldingen van de server via `SERVER_ERRORS_EN`).

## Belangrijke bestanden
- `src/components/AppShell.tsx` – hoofdscherm: zoekbalk, filters (incl. "Nu open"), menu, welkomst-/actie-pop-up, teller, bedankvenster.
- `src/components/PlaceSheet.tsx` – pop-up van een locatie + toevoegen/aanpassen.
- `src/components/PlaceList.tsx`, `MapCanvas.tsx` (pins), `Rating.tsx`, `HeartRow.tsx`, `Icons.tsx`.
- `src/lib/score.ts` – hartjes en labels. `src/lib/hours.ts` – openingsuren (OSM-notatie).
- `src/lib/osm.ts` – zoeken/adres (Nominatim + Photon als tikfout-tolerante reserve).
- API: `src/app/api/places/*` (toevoegen, handmatig, aanpassen, bevestigen), `api/contact`, `api/geocode`.
- SEO-pagina's: `/zaak/[slug]` (+ `/sticker`, `opengraph-image`), `/kindvriendelijk/[gemeente]`, `/met/[voorziening]`, `/gemeenten`, `/voor-horeca`, `/over`.

## Regels voor de inhoud
- Hartjes (max 5): verschoningstafel, kinderstoelen, speelhoek, kinderaanbod = 1 hartje elk; buitenspeeltuin en kinderwagentoegankelijk = ½. Onbekend telt niet.
- Labels: **Kindvriendelijk** vanaf 2 hartjes, **Super kindvriendelijk** vanaf 4. Pinkleur volgt het label (groen ≥4, geel ≥2, oranje ≥1, rood <1). Sterretje op de pin alleen bij 5 hartjes.
- "Nog aan te vullen" bij locaties zonder label met ≥3 onbekende voorzieningen.
- Voorzieningen heten: Verschoningstafel, Kinderstoelen, Speelhoek, **Kinderaanbod** (niet "kindermenu"), Buitenspeeltuin, **Kinderwagentoegankelijk**.
- Woordkeuze: gebruik **"horecazaak"** of **"locatie"**, niet "zaak" (uitzondering: "Is dit jouw zaak?") en niet "plek" (uitzondering: losse zinnen als "Ken je een leuke plek?", "plekjes" in de actie).
- Geen persoonlijke gegevens van Donald (telefoon, e-mail) op de site.

## Database en veiligheid
- RLS staat aan: bezoekers lezen alleen `approved = true`. Schrijven kan alleen via de functies `add_place_v3`, `add_place_manual_v1`, `update_place_v3`, `confirm_place_v1`, beveiligd met `TINYTABLE_API_TOKEN` (alleen server-side, staat in Vercel). Supabase-waarschuwingen over SECURITY DEFINER zijn hierdoor bewust.
- Handmatig toegevoegde horecazaken (`manual = true`) staan op `approved = false` tot Donald ze goedkeurt. Niet gevonden adres → voorlopig op het centrum van Antwerpen; adres opzoeken vóór goedkeuren.
- Openingsuren in kolom `opening_hours`, OSM-notatie, bv. `Mo-Fr 08:00-17:00; Sa-Su 09:00-18:00`.
- **Nooit** `.env.local` of geheime sleutels committen. Destructieve SQL (DELETE) eerst met Donald bevestigen.
- Er draait een wekelijkse back-up van de database (Claude-taak "TinyTable wekelijkse back-up").

## Werkwijze
- Na een wijziging: `npx tsc --noEmit` om te controleren. Pas daarna committen en pushen (alleen als Donald dat vraagt), dan de Vercel-deploy controleren.
- Commitberichten kort, in het Nederlands.
- Bij visuele wijzigingen: eerst een ontwerp of voorstel tonen als Donald daarom vraagt.
