"use client";

import { AMENITIES } from "@/lib/score";
import type { Amenities } from "@/lib/types";

type Props = {
  value: Amenities;
  onChange: (next: Amenities) => void;
};

export function AmenityEditor({ value, onChange }: Props) {
  return (
    <div className="amenities">
      {AMENITIES.map((item) => {
        const current = value[item.key];
        return (
          <div
            key={item.key}
            className={`amenity ${current === true ? "yes" : current === false ? "no" : ""}`}
          >
            <strong>{item.label}</strong>
            <div className="toggles">
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
                className={current === null ? "on-null" : ""}
                onClick={() => onChange({ ...value, [item.key]: null })}
              >
                ?
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AmenityGlance({ amenities }: { amenities: Amenities }) {
  return (
    <div className="amenities">
      {AMENITIES.map((item) => {
        const current = amenities[item.key];
        const status =
          current === true ? "Ja" : current === false ? "Nee" : "Onbekend";
        return (
          <div
            key={item.key}
            className={`amenity ${current === true ? "yes" : current === false ? "no" : ""}`}
          >
            <div>{item.label}</div>
            <div className="status">{status}</div>
          </div>
        );
      })}
    </div>
  );
}
