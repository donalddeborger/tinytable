import { knownCount, WELCOME_MIN } from "@/lib/score";
import type { Amenities } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { ChairMark } from "@/components/Icons";
import { HeartRow } from "@/components/HeartRow";

export function Hearts({
  rating,
  size = 16,
}: {
  rating: number | null;
  size?: number;
}) {
  const { t, ratingText } = useI18n();
  return <HeartRow rating={rating} size={size} label={`${t.kidFriendliness}: ${ratingText(rating)}`} />;
}

// Grijs labeltje als er nog veel voorzieningen onbekend zijn.
export function InfoBadge({ amenities }: { amenities: Partial<Amenities> | null | undefined }) {
  const { t } = useI18n();
  const title = t.needsInfoTitle(knownCount(amenities));
  return (
    <span className="info-badge" title={title}>
      {t.needsInfo}
    </span>
  );
}

// Label "Kindvriendelijk" (2 hartjes) of "Super kindvriendelijk" (5 hartjes).
export function WelcomeBadge({ large = false, isSuper = false }: { large?: boolean; isSuper?: boolean }) {
  const { t } = useI18n();
  const label = isSuper ? t.superWelcome : t.welcome;
  if (large) {
    return (
      <div className={`welcome-banner${isSuper ? " is-super" : ""}`}>
        <span className="welcome-mark">
          <ChairMark size={40} chair="var(--ink)" />
        </span>
        <span>
          <strong>{label}</strong>
          <small>{isSuper ? t.superRule : t.welcomeRule(WELCOME_MIN)}</small>
        </span>
      </div>
    );
  }
  return (
    <span className={`welcome-badge${isSuper ? " is-super" : ""}`}>
      <ChairMark size={15} chair="var(--ink)" />
      {label}
    </span>
  );
}
