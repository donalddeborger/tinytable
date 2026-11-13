import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { SeoFooter, SeoHeader } from "@/components/SeoChrome";
import { seoPlaces, type SeoPlace } from "@/lib/seo";
import { SITE_URL } from "@/lib/slug";

export const revalidate = 3600;

const title = "Voor horecazaken: word gevonden door ouders | TinyTable";
const description =
  "Is jouw restaurant, café of koffiebar kindvriendelijk? Zet je zaak gratis op TinyTable, vul je voorzieningen aan en druk je sticker met QR-code af.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/voor-horeca` },
  openGraph: { title, description, url: `${SITE_URL}/voor-horeca`, siteName: "TinyTable", locale: "nl_BE" },
};

export default async function OwnersPage() {
  let places: SeoPlace[] = [];
  try {
    places = (await seoPlaces()).sort((a, b) => a.name.localeCompare(b.name, "nl"));
  } catch {
    places = [];
  }
  return (
    <main className="zaak-page">
      <SeoHeader />
      <article className="zaak-card prose">
        <h1>Voor horecazaken</h1>
        <p className="lead">
          Ouders met jonge kinderen zoeken op TinyTable waar ze in Antwerpen ontspannen kunnen gaan eten of iets drinken. Is
          jouw restaurant, café of koffiebar kindvriendelijk? Laat het hen weten. Het is gratis.
        </p>

        <h2>Waarom op TinyTable?</h2>
        <ul className="owner-benefits">
          <li>
            <strong>Nieuwe gasten:</strong> ouders kiezen bewust voor zaken waar ze weten dat er een kinderstoel of
            verschoningstafel is.
          </li>
          <li>
            <strong>Je voorzieningen in één oogopslag:</strong> verschoningstafel, kinderstoelen, speelhoek, kinderaanbod,
            buitenspeeltuin en plaats voor de kinderwagen.
          </li>
          <li>
            <strong>Een label om te tonen:</strong> vanaf 2 hartjes ben je <em>Kindvriendelijk</em>, vanaf 4 hartjes{" "}
            <em>Super kindvriendelijk</em>. <Link href="/over#hartjes">Hoe werken de hartjes?</Link>
          </li>
          <li>
            <strong>Gratis en zonder account.</strong>
          </li>
        </ul>

        <h2>Zo werkt het</h2>
        <ol className="owner-steps">
          <li>
            <strong>Zoek je zaak op de kaart.</strong> Open <Link href="/">tinytable.be</Link>, typ de naam in de zoekbalk en
            klik op je zaak.
          </li>
          <li>
            <strong>Staat je zaak er nog niet?</strong> <Link href="/?toevoegen">Voeg ze toe</Link>: zoek de naam of vul het adres
            in en duid aan wat je aanbiedt.
          </li>
          <li>
            <strong>Klopt de info niet helemaal?</strong> Klik bij je zaak op <em>Info aanpassen</em> en vul de voorzieningen aan.
            Hoe meer je invult, hoe meer hartjes.
          </li>
          <li>
            <strong>Toon het aan je gasten.</strong> Druk je gratis sticker met QR-code af voor aan de deur, de toog of op
            tafel. Gasten scannen hem en zien meteen wat je voor kinderen hebt.
          </li>
        </ol>

        <h2 id="sticker">Sticker afdrukken</h2>
        {places.length ? (
          <>
            <p>Kies je zaak. Je sticker opent in een nieuw venster, klaar om af te drukken op stickerpapier of A6-karton.</p>
            <ul className="owner-list">
              {places.map((p) => (
                <li key={p.id}>
                  <Link href={`/zaak/${p.slug}/sticker`} target="_blank">
                    {p.name}
                  </Link>
                  <span className="muted small"> · {p.town}</span>
                </li>
              ))}
            </ul>
            <p className="muted small">Staat je zaak er niet bij? Voeg ze eerst toe; je sticker is daarna meteen beschikbaar.</p>
          </>
        ) : (
          <p>Voeg eerst je zaak toe; daarna kan je je sticker afdrukken.</p>
        )}

        <h2 id="contact">Vragen of iets aanpassen?</h2>
        <p>
          Wil je iets laten corrigeren, je zaak laten verwijderen of heb je een vraag? Stuur ons een bericht. Vermeld de naam
          van je zaak.
        </p>
        <ContactForm />

        <p>
          <Link href="/">← Terug naar de kaart</Link>
        </p>
      </article>
      <SeoFooter />
    </main>
  );
}
