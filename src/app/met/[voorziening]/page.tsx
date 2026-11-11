import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlaceCards, SeoFooter, SeoHeader } from "@/components/SeoChrome";
import { AMENITY_PAGES, seoPlaces } from "@/lib/seo";
import { SITE_URL } from "@/lib/slug";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ voorziening: string }> }): Promise<Metadata> {
  const { voorziening } = await params;
  const page = AMENITY_PAGES.find((a) => a.slug === voorziening);
  if (!page) return { title: "Niet gevonden | TinyTable" };
  const title = `Restaurants en cafés ${page.title} in Antwerpen | TinyTable`;
  const description = `Overzicht van kindvriendelijke zaken in Antwerpen ${page.title}, ingevuld door ouders.`;
  const url = `${SITE_URL}/met/${voorziening}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "TinyTable", locale: "nl_BE" } };
}

export default async function AmenityPage({ params }: { params: Promise<{ voorziening: string }> }) {
  const { voorziening } = await params;
  const page = AMENITY_PAGES.find((a) => a.slug === voorziening);
  if (!page) notFound();
  const places = (await seoPlaces()).filter((p) => p.amenities[page.key] === true);
  return (
    <main className="zaak-page">
      <SeoHeader />
      <article className="zaak-card">
        <h1>Restaurants en cafés {page.title}</h1>
        <p>
          {places.length === 0
            ? "Nog geen zaken gevonden. Ken jij er een? Voeg ze toe via de kaart."
            : `${places.length} ${places.length === 1 ? "zaak" : "zaken"} in Antwerpen ${page.title}, volgens ouders en OpenStreetMap.`}
        </p>
        <PlaceCards places={places} />
      </article>
      <SeoFooter />
    </main>
  );
}
