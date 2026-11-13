import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { SeoFooter, SeoHeader } from "@/components/SeoChrome";
import { SITE_URL } from "@/lib/slug";

export const metadata: Metadata = {
  title: "Over TinyTable – hoe het werkt, contact en privacy",
  description:
    "TinyTable toont welke restaurants, cafés en koffiebars in Antwerpen kindvriendelijk zijn, ingevuld door ouders. Lees hoe de hartjes werken, neem contact op of lees hoe we met gegevens omgaan.",
  alternates: { canonical: `${SITE_URL}/over` },
};

export default function AboutPage() {
  return (
    <main className="zaak-page">
      <SeoHeader />
      <article className="zaak-card prose">
        <h1>Over TinyTable</h1>
        <p>
          TinyTable helpt ouders met jonge kinderen om snel een restaurant, café of koffiebar te vinden waar kleine gasten
          welkom zijn. Je ziet in één oogopslag of er een verschoningstafel, kinderstoelen, een speelhoek, een kinderaanbod, een
          buitenspeeltuin is en of de horecazaak kinderwagenvriendelijk is. We starten in Antwerpen; de rest van de provincie volgt.
        </p>

        <h2>Wie vult de info in?</h2>
        <p>
          Ouders zoals jij. Iedereen kan een horecazaak toevoegen of aanvullen, zonder account. Een deel van de locaties komt uit{" "}
          <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>, een open kaart die
          door vrijwilligers wordt bijgehouden; die locaties staan als &ldquo;nog niet bevestigd&rdquo; tot een ouder de info bevestigt.
          Horecazaken die niet in de zoekfunctie staan, worden eerst nagekeken voor ze op de kaart verschijnen.
        </p>

        <h2 id="hartjes">Hoe werken de hartjes?</h2>
        <ul>
          <li>Verschoningstafel, kinderstoelen, speelhoek en kinderaanbod (kindermenu, kinderportie, babyccino…): elk 1 hartje.</li>
          <li>Buitenspeeltuin en kinderwagenvriendelijk: elk een half hartje.</li>
          <li>Vanaf 2 hartjes krijgt een horecazaak het label <strong>Kindvriendelijk</strong>, met 4 of 5 hartjes <strong>Super kindvriendelijk</strong>.</li>
        </ul>

        <h2 id="contact">Contact</h2>
        <p>Een fout gezien, een idee of een vraag? Laat het ons weten.</p>
        <ContactForm />

        <h2 id="privacy">Privacy</h2>
        <ul>
          <li>Je hebt geen account nodig en we vragen geen persoonsgegevens om de site te gebruiken.</li>
          <li>
            Om misbruik te voorkomen bewaren we bij een toevoeging of aanpassing een versleutelde, niet terug te rekenen code
            die is afgeleid van je IP-adres. Je IP-adres zelf bewaren we niet.
          </li>
          <li>We tellen bezoeken met Vercel Web Analytics. Dat werkt zonder cookies en zonder persoonsgegevens.</li>
          <li>Je taalkeuze (NL/EN) wordt alleen in je eigen browser bewaard.</li>
          <li>Je locatie gebruiken we alleen als je zelf op &ldquo;Mijn locatie&rdquo; of &ldquo;Dichtbij&rdquo; tikt; ze verlaat je toestel niet.</li>
          <li>Een bericht via het contactformulier komt per e-mail bij ons terecht en wordt alleen gebruikt om te antwoorden.</li>
        </ul>
        <p>
          <Link href="/">Terug naar de kaart</Link>
        </p>
      </article>
      <SeoFooter />
    </main>
  );
}
