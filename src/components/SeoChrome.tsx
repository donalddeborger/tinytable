import Link from "next/link";
import { AMENITY_PAGES, seoPlaces, towns } from "@/lib/seo";
import { isSuperWelcome, isWelcome } from "@/lib/score";
import type { SeoPlace } from "@/lib/seo";

const TYPE_NL = { restaurant: "Restaurant", cafe: "Café", bar: "Koffiebar" } as const;

export function SeoHeader() {
  return (
    <header className="zaak-top">
      <Link href="/" className="brand" aria-label="TinyTable – naar de kaart">
        <span className="wordmark" aria-hidden="true">
          <span className="wm-tiny">TINY</span>
          <span className="wm-table">TABLE</span>
        </span>
        <small>Kindvriendelijk eten &amp; drinken · Antwerpen</small>
      </Link>
    </header>
  );
}

export async function SeoFooter() {
  let townList: { slug: string; name: string }[] = [];
  try {
    townList = towns(await seoPlaces());
  } catch {
    townList = [];
  }
  return (
    <footer className="seo-footer">
      {townList.length ? (
        <nav aria-label="Per gemeente">
          <h2>Per gemeente</h2>
          <ul>
            {townList.map((t) => (
              <li key={t.slug}>
                <Link href={`/kindvriendelijk/${t.slug}`}>{t.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <nav aria-label="Per voorziening">
        <h2>Per voorziening</h2>
        <ul>
          {AMENITY_PAGES.map((a) => (
            <li key={a.slug}>
              <Link href={`/met/${a.slug}`}>{a.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <p>
        <Link href="/">Naar de kaart</Link> · <Link href="/over">Over TinyTable, contact &amp; privacy</Link>
      </p>
    </footer>
  );
}

export function PlaceCards({ places }: { places: SeoPlace[] }) {
  return (
    <ul className="seo-cards">
      {places.map((p) => (
        <li key={p.id}>
          <Link href={`/zaak/${p.slug}`} className="seo-card">
            <strong>{p.name}</strong>
            <span className="muted small">
              {TYPE_NL[p.type]} · {p.address}
            </span>
            <span className="small">
              {p.rating === null ? "Nog niet beoordeeld" : `${String(p.rating).replace(".", ",")} van de 5 hartjes`}
              {isSuperWelcome(p.amenities) ? " · Super kindvriendelijk" : isWelcome(p.amenities) ? " · Kindvriendelijk" : ""}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
