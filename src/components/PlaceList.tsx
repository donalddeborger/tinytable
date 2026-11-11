"use client";

import { AMENITIES, isWelcome, kidRating, scoreLabel } from "@/lib/score";
import { distanceKm, formatDistance, type LatLng } from "@/lib/geo";
import type { Place } from "@/lib/types";
import { AMENITY_ICON, LocateIcon, TYPE_EMOJI, TYPE_LABEL } from "@/components/Icons";
import { Hearts, WelcomeBadge } from "@/components/Rating";

export type SortMode = "score" | "distance";

type Props = {
  places: Place[];
  origin: LatLng | null;
  sort: SortMode;
  onSortChange: (sort: SortMode) => void;
  onSelect: (place: Place) => void;
  onAdd: () => void;
  selectedId: string | null;
};

export function sortPlaces(
  places: Place[],
  sort: SortMode,
  origin: LatLng | null,
): Place[] {
  const list = [...places];
  if (sort === "distance" && origin) {
    list.sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b));
  } else {
    list.sort(
      (a, b) =>
        (kidRating(b.amenities) ?? -1) - (kidRating(a.amenities) ?? -1) ||
        a.name.localeCompare(b.name, "nl"),
    );
  }
  return list;
}

export function AmenityDots({ place }: { place: Place }) {
  return (
    <span className="amenity-dots">
      {AMENITIES.map((item) => {
        const Icon = AMENITY_ICON[item.key];
        const value = place.amenities[item.key];
        const state = value === true ? "yes" : value === false ? "no" : "unknown";
        return (
          <span
            key={item.key}
            className={`dot dot-${state} am-${item.key}`}
            title={`${item.label}: ${value === true ? "ja" : value === false ? "nee" : "onbekend"}`}
          >
            <Icon size={15} />
          </span>
        );
      })}
    </span>
  );
}

export function PlaceList({
  places,
  origin,
  sort,
  onSortChange,
  onSelect,
  onAdd,
  selectedId,
}: Props) {
  const sorted = sortPlaces(places, sort, origin);

  return (
    <div className="place-list">
      <div className="list-head">
        <p className="list-count">
          <strong>{places.length}</strong>{" "}
          {places.length === 1 ? "plek" : "plekken"}
        </p>
        <div className="segmented small" role="group" aria-label="Sorteren">
          <button
            className={sort === "score" ? "on" : ""}
            onClick={() => onSortChange("score")}
          >
            Beste score
          </button>
          <button
            className={sort === "distance" ? "on" : ""}
            onClick={() => onSortChange("distance")}
          >
            <LocateIcon size={14} /> Dichtbij
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty">
          <p>Nog geen plekken die hieraan voldoen.</p>
          <button className="btn btn-primary" onClick={onAdd}>
            Voeg de eerste toe
          </button>
        </div>
      ) : (
        <ul className="cards">
          {sorted.map((place) => {
            const rating = kidRating(place.amenities);
            return (
              <li key={place.id}>
                <button
                  className={`card ${place.id === selectedId ? "selected" : ""}`}
                  onClick={() => onSelect(place)}
                >
                  <span className={`type-tile type-${place.type}`} aria-hidden>
                    {TYPE_EMOJI[place.type]}
                  </span>
                  <span className="card-body">
                    <span className="card-title">{place.name}</span>
                    <span className="card-rating">
                      <Hearts rating={rating} size={16} />
                      <small>{scoreLabel(rating)}</small>
                    </span>
                    {isWelcome(place.amenities) ? <WelcomeBadge /> : null}
                    <span className="card-meta">
                      {TYPE_LABEL[place.type]}
                      {origin ? ` · ${formatDistance(distanceKm(origin, place))}` : ""}
                      {" · "}
                      {place.address.split(",")[0]}
                    </span>
                    <AmenityDots place={place} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
