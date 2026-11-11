import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter, SeoHeader } from "@/components/SeoChrome";
import { seoPlaces, towns } from "@/lib/seo";
import { SITE_URL } from "@/lib/slug";

export const revalidate = 3600;

const title = "Kindvriendelijke zaken per gemeente | TinyTable";
const description =
  "Alle gemeenten in de provincie Antwerpen met kindvriendelijke restaurants, cafés en koffiebars op TinyTable.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/gemeenten` },
  openGraph: { title, description, url: `${SITE_URL}/gemeenten`, siteName: "TinyTable", locale: "nl_BE" },
};

export default async function TownsPage() {
  let list: { slug: string; name: string; count: number }[] = [];
  try {
    list = towns(await seoPlaces()).sort((a, b) => a.name.localeCompare(b.name, "nl"));
  } catch {
    list = [];
  }
  return (
    <main className="zaak-page">
      <SeoHeader />
      <article className="zaak-card">
        <h1>Per gemeente</h1>
        <p className="muted">Kies een gemeente om alle kindvriendelijke zaken daar te zien.</p>
        <ul className="town-list">
          {list.map((t) => (
            <li key={t.slug}>
              <Link href={`/kindvriendelijk/${t.slug}`} className="seo-card town-card">
                <strong>{t.name}</strong>
                <span className="muted small">
                  {t.count} {t.count === 1 ? "zaak" : "zaken"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p>
          <Link href="/">← Terug naar de kaart</Link>
        </p>
      </article>
      <SeoFooter />
    </main>
  );
}
