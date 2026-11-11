import { ratingText, scoreTone, WELCOME_MIN } from "@/lib/score";
import { ChairMark } from "@/components/Icons";

// Wissel hier het symbool (bv. naar een ster) als je iets anders wilt.
const HEART =
  "M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z";

function Symbol({ fill, size }: { fill: number; size: number }) {
  // fill: 0, 0.5 of 1
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

export function Hearts({
  rating,
  size = 16,
}: {
  rating: number | null;
  size?: number;
}) {
  return (
    <span
      className={`hearts tone-${scoreTone(rating)}`}
      role="img"
      aria-label={`Kindvriendelijkheid: ${ratingText(rating)}`}
      title={ratingText(rating)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = rating === null ? 0 : rating >= n ? 1 : rating >= n - 0.5 ? 0.5 : 0;
        return <Symbol key={n} fill={fill} size={size} />;
      })}
    </span>
  );
}

// Label "Kleine gasten welkom" (vanaf 3 hartjes).
export function WelcomeBadge({ large = false }: { large?: boolean }) {
  if (large) {
    return (
      <div className="welcome-banner">
        <span className="welcome-mark">
          <ChairMark size={40} chair="var(--ink)" />
        </span>
        <span>
          <strong>Kleine gasten welkom</strong>
          <small>TinyTable-label: minstens {WELCOME_MIN} van de 5 voorzieningen</small>
        </span>
      </div>
    );
  }
  return (
    <span className="welcome-badge">
      <ChairMark size={15} chair="var(--ink)" />
      Kleine gasten welkom
    </span>
  );
}
