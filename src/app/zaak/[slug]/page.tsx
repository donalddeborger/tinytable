import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPlaces } from "@/lib/store";
import { placeSlugs, placeTown, SITE_URL, slugify } from "@/lib/slug";
import { isSuperWelcome, isWelcome, kidRating } from "@/lib/score";
import { routeUrl } from "@/lib/geo";
import { formatHours } from "@/lib/hours";
import { SeoFooter } from "@/components/SeoChrome";
import { HeartRow, nlRatingLabel } from "@/components/HeartRow";
import type { AmenityKey, Place } from "@/lib/types";

// Elk uur opnieuw opbouwen, zodat nieuwe info ook bij Google terechtkomt.
export const revalidate = 3600;

const AMENITY_NL: { key: AmenityKey; label: string; schema: string }[] = [
  { key: "changingTable", label: "Verschoningstafel", schema: "Verschoningstafel" },
  { key: "highChairs", label: "Kinderstoelen", schema: "Kinderstoelen" },
  { key: "playCorner", label: "Speelhoek", schema: "Speelhoek" },
  { key: "kidsMenu", label: "Kinderaanbod", schema: "Kinderaanbod" },
  { key: "playground", label: "Buitenspeeltuin", schema: "Buitenspeeltuin" },
  { key: "stroller", label: "Kinderwagentoegankelijk", schema: "Kinderwagentoegankelijk" },
];

const TYPE_NL: Record<Place["type"], { label: string; lower: string; this: string; schema: string }> = {
  restaurant: { label: "Restaurant", lower: "restaurant", this: "dit restaurant", schema: "Restaurant" },
  cafe: { label: "Café", lower: "café", this: "dit café", schema: "BarOrPub" },
  bar: { label: "Koffiebar", lower: "koffiebar", this: "deze koffiebar", schema: "CafeOrCoffeeShop" },
};

async function findPlace(slug: string): Promise<{ place: Place; slug: string } | null> {
  const places = await listPlaces();
  const slugs = placeSlugs(places);
  const place = places.find((p) => slugs.get(p.id) === slug);
  return place ? { place, slug } : null;
}

function present(place: Place) {
  return AMENITY_NL.filter((a) => place.amenities[a.key] === true).map((a) => a.label.toLowerCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await findPlace(slug);
  if (!found) return { title: "Locatie niet gevonden | TinyTable" };
  const { place } = found;
  const town = placeTown(place);
  const type = TYPE_NL[place.type];
  const label = isSuperWelcome(place.amenities)
    ? "super kindvriendelijk"
    : isWelcome(place.amenities)
      ? "kindvriendelijk"
      : null;
  const has = present(place);
  const title = label
    ? `${place.name} – ${label} ${type.lower} in ${town} | TinyTable`
    : `${place.name}, ${type.lower} in ${town} – kindvriendelijk? | TinyTable`;
  const description = has.length
    ? `${place.name} (${place.address}) heeft ${has.join(", ")}. Bekijk wat ouders zeggen over ${type.this} op TinyTable.`
    : `Is ${place.name} (${place.address}) kindvriendelijk? Bekijk het of vul zelf aan op TinyTable.`;
  const url = `${SITE_URL}/zaak/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "TinyTable", locale: "nl_BE", type: "website" },
  };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findPlace(slug);
  if (!found) notFound();
  const { place } = found;

  const town = placeTown(place);
  const type = TYPE_NL[place.type];
  const rating = kidRating(place.amenities);
  const superWelcome = isSuperWelcome(place.amenities);
  const welcome = isWelcome(place.amenities);

  // Gestructureerde gegevens voor Google (schema.org).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type.schema,
    name: place.name,
    url: `${SITE_URL}/zaak/${slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: place.address.split(",")[0],
      postalCode: place.address.match(/\b(\d{4})\b/)?.[1],
      addressLocality: town,
      addressCountry: "BE",
    },
    geo: { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng },
    amenityFeature: AMENITY_NL.filter((a) => typeof place.amenities[a.key] === "boolean").map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a.schema,
      value: place.amenities[a.key] === true,
    })),
  };

  return (
    <main className="zaak-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="zaak-top">
        <Link href="/" className="brand" aria-label="TinyTable – naar de kaart">
          <span className="wordmark" aria-hidden="true">
            <span className="wm-tiny">TINY</span>
            <span className="wm-table">TABLE</span>
          </span>
          <small>Kindvriendelijk eten &amp; drinken · Antwerpen</small>
        </Link>
      </header>

      <article className="zaak-card">
        <p className="zaak-type">
          {type.label} · {town}
        </p>
        <h1>{place.name}</h1>
        <p className="muted">{place.address}</p>
        {place.openingHours ? <p className="muted small">Openingsuren: {formatHours(place.openingHours)}</p> : null}

        <div className="zaak-score">
          <p className="zaak-hearts">
            <HeartRow rating={rating} size={22} label={nlRatingLabel(rating)} />
            {rating === null ? <span className="muted small">Nog niet beoordeeld</span> : null}
          </p>
          {welcome ? (
            <p className={`welcome-badge${superWelcome ? " is-super" : ""}`}>
              {superWelcome ? "Super kindvriendelijk" : "Kindvriendelijk"}
            </p>
          ) : null}
        </div>

        <h2>Wat is er voor kinderen?</h2>
        <ul className="zaak-amenities">
          {AMENITY_NL.map((a) => {
            const value = place.amenities[a.key];
            return (
              <li key={a.key} className={`state-${value === true ? "yes" : value === false ? "no" : "unknown"}`}>
                <span>{a.label}</span>
                <strong>{value === true ? "Ja" : value === false ? "Nee" : "Onbekend"}</strong>
              </li>
            );
          })}
        </ul>

        {place.note ? <p className="note">“{place.note}”</p> : null}

        <div className="actions">
          <Link className="btn btn-primary" href={`/?zaak=${slug}`}>
            Bekijk op de kaart
          </Link>
          <a className="btn btn-soft" href={routeUrl(place)} target="_blank" rel="noopener noreferrer">
            Wandelroute
          </a>
        </div>
        <p className="muted small">
          {place.source === "osm" && !place.confirmCount
            ? "Deze info komt uit OpenStreetMap en is nog niet bevestigd door ouders. Klopt ze? Bevestig of pas aan via de kaart."
            : "Klopt er iets niet? Pas de info aan via de kaart. TinyTable wordt ingevuld door ouders."}
        </p>
        <p className="small">
          <Link href={`/kindvriendelijk/${slugify(town)}`}>Meer kindvriendelijke horecazaken in {town}</Link>
        </p>
        <p className="muted small">
          Is dit jouw zaak? <Link href={`/zaak/${slug}/sticker`}>Druk je TinyTable-sticker met QR-code af</Link> of lees{" "}
          <Link href="/voor-horeca">alles voor horecazaken</Link>.
        </p>
      </article>
      <SeoFooter />
    </main>
  );
}
