import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { listPlaces } from "@/lib/store";
import { placeSlugs, SITE_URL } from "@/lib/slug";
import { isSuperWelcome, isWelcome, kidRating } from "@/lib/score";
import { PrintButton } from "@/components/PrintButton";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Sticker | TinyTable", robots: { index: false, follow: false } };

const HEART =
  "M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z";

// Afdrukbare sticker voor aan de deur of op de tafel, met QR-code naar de zaakpagina.
export default async function StickerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const places = await listPlaces();
  const slugs = placeSlugs(places);
  const place = places.find((p) => slugs.get(p.id) === slug);
  if (!place) notFound();

  const url = `${SITE_URL}/zaak/${slug}`;
  const qr = await QRCode.toString(url, { type: "svg", margin: 0, color: { dark: "#2b2238", light: "#ffffff" } });
  const rating = kidRating(place.amenities) ?? 0;
  const label = isSuperWelcome(place.amenities)
    ? "Super kindvriendelijk"
    : isWelcome(place.amenities)
      ? "Kindvriendelijk"
      : "Kleine gasten welkom";

  return (
    <main className="sticker-page">
      <div className="sticker-tools">
        <PrintButton />
        <span className="muted small">Tip: druk af op stickerpapier of A6-karton.</span>
      </div>
      <section className={`sticker${isSuperWelcome(place.amenities) ? " is-super" : ""}`}>
        <div className="wordmark" aria-label="TinyTable">
          <span className="wm-tiny">TINY</span>
          <span className="wm-table">TABLE</span>
        </div>
        <p className="sticker-label">{label}</p>
        <p className="sticker-hearts" aria-label={`${rating} van de 5 hartjes`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <svg key={n} viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path d={HEART} fill={rating >= n ? "#ff7aa2" : rating >= n - 0.5 ? "#ffc2d4" : "#efe8da"} />
            </svg>
          ))}
        </p>
        <h1>{place.name}</h1>
        <div className="sticker-qr" dangerouslySetInnerHTML={{ __html: qr }} />
        <p className="sticker-cta">Scan en bekijk wat we voor kinderen hebben</p>
        <p className="sticker-url">tinytable.be</p>
      </section>
    </main>
  );
}
