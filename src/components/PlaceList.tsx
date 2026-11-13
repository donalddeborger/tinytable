"use client";

import { AMENITIES, isSuperWelcome, isWelcome, kidRating, needsInfo } from "@/lib/score";
import { useI18n } from "@/lib/i18n";
import { distanceKm, type LatLng } from "@/lib/geo";
import type { Place } from "@/lib/types";
import { AMENITY_ICON, LocateIcon, ShareIcon, TYPE_EMOJI } from "@/components/Icons";
import { shareLink, useCanShare } from "@/lib/share";
import { Hearts, InfoBadge, WelcomeBadge } from "@/components/Rating";

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
  // "Dichtbij": alleen zaken met minstens 1 hartje.
  const list =
    sort === "distance" && origin
      ? places.filter((place) => (kidRating(place.amenities) ?? 0) >= 1)
      : [...places];
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
  const { t, amenity } = useI18n();
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
            title={`${amenity(item.key).label.replace(/\u00AD/g, "")}: ${value === true ? t.yes : value === false ? t.no : t.unknown}`}
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
  const { t, typeLabel, formatDistance } = useI18n();
  const canShare = useCanShare();

  return (
    <div className="place-list">
      <div className="list-head">
        <p className="list-count">
          <strong>{sorted.length}</strong>{" "}
          {sorted.length === 1 ? t.place : t.places}
        </p>
        <div className="segmented small" role="group" aria-label={t.sort}>
          <button
            className={sort === "score" ? "on" : ""}
            onClick={() => onSortChange("score")}
          >
            {t.bestScore}
          </button>
          <button
            className={sort === "distance" ? "on" : ""}
            onClick={() => onSortChange("distance")}
          >
            <LocateIcon size={14} /> {t.nearby}
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty">
          <p>{t.emptyList}</p>
          <button className="btn btn-primary" onClick={onAdd}>
            {t.addFirst}
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
                      {isWelcome(place.amenities) ? (
                        <WelcomeBadge isSuper={isSuperWelcome(place.amenities)} />
                      ) : needsInfo(place.amenities) ? (
                        <InfoBadge amenities={place.amenities} />
                      ) : null}
                    </span>
                    <span className="card-meta">
                      {typeLabel(place.type)}
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
      {canShare ? (
        <div className="list-share">
          <p>{t.shareSiteAsk}</p>
          <button
            className="btn btn-soft"
            onClick={() => shareLink({ title: "TinyTable", text: t.shareSiteText, path: "/" }, "Site gedeeld", { waar: "lijst" })}
          >
            <ShareIcon size={16} /> {t.shareSite}
          </button>
        </div>
      ) : null}
      <p className="list-footer">
        <a href="/over">{t.aboutLink}</a>
      </p>
    </div>
  );
}
