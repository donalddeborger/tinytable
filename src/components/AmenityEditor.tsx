"use client";

import { AMENITIES } from "@/lib/score";
import type { Amenities } from "@/lib/types";
import { AMENITY_ICON } from "@/components/Icons";

type Props = {
  value: Amenities;
  onChange: (next: Amenities) => void;
};

export function AmenityEditor({ value, onChange }: Props) {
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
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </span>
            <span className="tri" role="group" aria-label={item.label}>
              <button
                type="button"
                className={current === true ? "on-yes" : ""}
                onClick={() => onChange({ ...value, [item.key]: true })}
              >
                Ja
              </button>
              <button
                type="button"
                className={current === false ? "on-no" : ""}
                onClick={() => onChange({ ...value, [item.key]: false })}
              >
                Nee
              </button>
              <button
                type="button"
                className={current === null ? "on-unknown" : ""}
                onClick={() => onChange({ ...value, [item.key]: null })}
                aria-label="Weet ik niet"
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
              <strong>{item.label}</strong>
              <small>{state === "yes" ? "Ja" : state === "no" ? "Nee" : "Onbekend"}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}
