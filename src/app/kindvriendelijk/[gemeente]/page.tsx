import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlaceCards, SeoFooter, SeoHeader } from "@/components/SeoChrome";
import { seoPlaces, towns } from "@/lib/seo";
import { SITE_URL } from "@/lib/slug";

export const revalidate = 3600;

async function load(gemeente: string) {
  const places = await seoPlaces();
  const town = towns(places).find((t) => t.slug === gemeente);
  if (!town) return null;
  return { town, places: places.filter((p) => p.townSlug === gemeente) };
}

export async function generateMetadata({ params }: { params: Promise<{ gemeente: string }> }): Promise<Metadata> {
  const { gemeente } = await params;
  const data = await load(gemeente);
  if (!data) return { title: "Niet gevonden | TinyTable" };
  const title = `Kindvriendelijke restaurants en cafés in ${data.town.name} | TinyTable`;
  const description = `${data.places.length} locaties in ${data.town.name} met info over verschoningstafel, kinderstoelen, speelhoek, kinderaanbod en meer. Ingevuld door ouders.`;
  const url = `${SITE_URL}/kindvriendelijk/${gemeente}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "TinyTable", locale: "nl_BE" } };
}

export default async function TownPage({ params }: { params: Promise<{ gemeente: string }> }) {
  const { gemeente } = await params;
  const data = await load(gemeente);
  if (!data) notFound();
  return (
    <main className="zaak-page">
      <SeoHeader />
      <article className="zaak-card">
        <h1>Kindvriendelijk eten en drinken in {data.town.name}</h1>
        <p>
          Restaurants, cafés en koffiebars in {data.town.name}, gesorteerd op hoe kindvriendelijk ze zijn. Per horecazaak zie je of
          er een verschoningstafel, kinderstoelen, een speelhoek, een kinderaanbod, een buitenspeeltuin is en of je er vlot
          binnen kunt met een kinderwagen. De info komt van ouders.
        </p>
        <PlaceCards places={data.places} />
      </article>
      <SeoFooter />
    </main>
  );
}
