"use client";

import { AMENITIES } from "@/lib/score";
import type { Amenities } from "@/lib/types";
import { AMENITY_ICON } from "@/components/Icons";
import { useI18n } from "@/lib/i18n";

type Props = {
  value: Amenities;
  onChange: (next: Amenities) => void;
};

export function AmenityEditor({ value, onChange }: Props) {
  const { t, amenity } = useI18n();
  return (
    <div className="amenity-editor">
      {AMENITIES.map((item) => {
        const Icon = AMENITY_ICON[item.key];
        const current = (value ?? {})[item.key];
        return (
          <div key={item.key} className="editor-row">
            <span className={`amenity-icon am-${item.key} state-${current === true ? "yes" : current === false ? "no" : "unknown"}`}>
              <Icon size={20} />
            </span>
            <span className="editor-label">
              <strong>{amenity(item.key).label}</strong>
              <small>{amenity(item.key).hint}</small>
            </span>
            <span className="tri" role="group" aria-label={amenity(item.key).label}>
              <button
                type="button"
                className={current === true ? "on-yes" : ""}
                onClick={() => onChange({ ...value, [item.key]: true })}
              >
                {t.yes}
              </button>
              <button
                type="button"
                className={current === false ? "on-no" : ""}
                onClick={() => onChange({ ...value, [item.key]: false })}
              >
                {t.no}
              </button>
              <button
                type="button"
                className={current === null ? "on-unknown" : ""}
                onClick={() => onChange({ ...value, [item.key]: null })}
                aria-label={t.dontKnow}
              >
                ?
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AmenityGlance({ amenities }: { amenities: Amenities }) {
  const { t, amenity } = useI18n();
  return (
    <div className="amenity-grid">
      {AMENITIES.map((item) => {
        const Icon = AMENITY_ICON[item.key];
        const current = amenities[item.key];
        const state = current === true ? "yes" : current === false ? "no" : "unknown";
        return (
          <div key={item.key} className={`amenity-tile am-${item.key} state-${state}`}>
            <span className="amenity-icon">
              <Icon size={22} />
            </span>
            <span>
              <strong>{amenity(item.key).label}</strong>
              <small>{state === "yes" ? t.yes : state === "no" ? t.no : t.unknown}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}
