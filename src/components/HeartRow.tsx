import { scoreTone } from "@/lib/score";

// Hartjes zonder vertaling, bruikbaar op server-pagina's én in de app.
const HEART =
  "M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z";

function Symbol({ fill, size }: { fill: number; size: number }) {
  return (
    <span className="heart" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size} height={size} className="heart-empty" aria-hidden>
        <path d={HEART} />
      </svg>
      {fill > 0 ? (
        <span className="heart-fill" style={{ width: `${fill * 100}%` }}>
          <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
            <path d={HEART} />
          </svg>
        </span>
      ) : null}
    </span>
  );
}

export function HeartRow({ rating, size = 16, label }: { rating: number | null; size?: number; label: string }) {
  return (
    <span className={`hearts tone-${scoreTone(rating)}`} role="img" aria-label={label} title={label}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = rating === null ? 0 : rating >= n ? 1 : rating >= n - 0.5 ? 0.5 : 0;
        return <Symbol key={n} fill={fill} size={size} />;
      })}
    </span>
  );
}

export function nlRatingLabel(rating: number | null) {
  return rating === null ? "Nog niet beoordeeld" : `${String(rating).replace(".", ",")} van de 5 hartjes`;
}
