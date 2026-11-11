"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AddPlaceModal, PlaceSheet } from "@/components/PlaceSheet";
import { PlaceList, type SortMode } from "@/components/PlaceList";
import {
  AMENITY_ICON,
  CloseIcon,
  ListIcon,
  LocateIcon,
  LogoMark,
  MapIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/Icons";
import { AMENITIES } from "@/lib/score";
import { ANTWERP, isInAntwerp } from "@/lib/antwerp";
import type { LatLng } from "@/lib/geo";
import type { AmenityKey, Place, Venue } from "@/lib/types";

const MapCanvas = dynamic(
  () => import("@/components/MapCanvas").then((mod) => mod.MapCanvas),
  { ssr: false, loading: () => <div className="map map-loading" /> },
);

type SearchHit = {
  key: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  source: "local" | "venue" | "street";
  place?: Place;
  venue?: Venue;
};

export function AppShell() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [filter, setFilter] = useState<AmenityKey | "all">("all");
  const [sort, setSort] = useState<SortMode>("score");
  const [view, setView] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [flyTo, setFlyTo] = useState<LatLng | null>(null);
  const [adding, setAdding] = useState<{ venue: Venue | null } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/places")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: Place[]) => setPlaces(data))
      .catch(() => setToast("De plekken konden niet worden geladen"))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setHits([]);
      return;
    }

    const local: SearchHit[] = places
      .filter((place) =>
        place.name.toLowerCase().includes(trimmed.toLowerCase()),
      )
      .map((place) => ({
        key: `local-${place.id}`,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        source: "local",
        place,
      }));
    setHits(local.slice(0, 8));
    if (trimmed.length < 3) return;

    const timer = window.setTimeout(() => {
      void fetch(`/api/geocode?venues=1&q=${encodeURIComponent(trimmed)}`)
        .then((response) => (response.ok ? response.json() : []))
        .then((remote: Venue[]) => {
          const extra: SearchHit[] = remote
            .filter(
              (item) =>
                !places.some((p) => p.osmId && p.osmId === item.osmId) &&
                !local.some(
                  (hit) =>
                    Math.abs(hit.lat - item.lat) < 0.0004 &&
                    Math.abs(hit.lng - item.lng) < 0.0004,
                ),
            )
            .map((item) => ({
              key: item.osmId,
              name: item.name,
              address: item.address,
              lat: item.lat,
              lng: item.lng,
              source: item.type ? "venue" : "street",
              venue: item,
            }));
          setHits([...local, ...extra].slice(0, 8));
        })
        .catch(() => undefined);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [query, places]);

  const filtered = useMemo(
    () =>
      filter === "all" ? places : places.filter((place) => place.amenities[filter] === true),
    [places, filter],
  );

  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selected?.id) ?? selected,
    [places, selected],
  );

  function locate(then?: () => void) {
    if (!navigator.geolocation) {
      setToast("Je browser kan je locatie niet bepalen");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(next);
        if (isInAntwerp(next.lat, next.lng)) {
          setFlyTo(next);
        } else {
          setToast("TinyTable start in Antwerpen — andere steden volgen.");
          setFlyTo(ANTWERP);
        }
        then?.();
      },
      () => setToast("Locatie kon niet worden bepaald"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function selectPlace(place: Place) {
    setSelected(place);
    setAdding(null);
    setFlyTo({ lat: place.lat, lng: place.lng });
    setView("map");
  }

  function startAdding(venue: Venue | null = null) {
    setSelected(null);
    setAdding({ venue });
  }

  const overlayOpen = Boolean(selectedPlace || adding);

  return (
    <div className="app" data-view={view} data-overlay={overlayOpen ? "1" : "0"}>
      <aside className="panel">
        <div className="panel-top">
          <div className="brand-row">
            <a className="brand" href="/" aria-label="TinyTable">
              <LogoMark size={34} />
              <span>
                <strong>TinyTable</strong>
                <small>Kindvriendelijk eten in Antwerpen</small>
              </span>
            </a>
            <button className="btn btn-primary desktop-only" onClick={() => startAdding()}>
              <PlusIcon size={18} /> Toevoegen
            </button>
          </div>

          <div className="search">
            <SearchIcon size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Zoek een restaurant, café of koffiebar"
              aria-label="Zoeken"
              enterKeyHint="search"
            />
            {query ? (
              <button className="icon-btn ghost" onClick={() => setQuery("")} aria-label="Wissen">
                <CloseIcon size={16} />
              </button>
            ) : null}
            {hits.length > 0 ? (
              <div className="results">
                {hits.map((hit) => (
                  <button
                    key={hit.key}
                    className="result"
                    onClick={() => {
                      setQuery("");
                      setHits([]);
                      if (hit.place) {
                        selectPlace(hit.place);
                      } else if (hit.venue && hit.source === "venue") {
                        setView("map");
                        setFlyTo({ lat: hit.lat, lng: hit.lng });
                        startAdding(hit.venue);
                      } else {
                        setSelected(null);
                        setView("map");
                        setFlyTo({ lat: hit.lat, lng: hit.lng });
                      }
                    }}
                  >
                    <span className={`result-icon ${hit.source}`}>
                      {hit.source === "local" ? <LogoMark size={22} /> : <PinIcon size={18} />}
                    </span>
                    <span>
                      <strong>{hit.name}</strong>
                      <small>
                        {hit.source === "local"
                          ? "In TinyTable"
                          : hit.source === "venue"
                            ? "Nog geen info · tik om toe te voegen"
                            : "Toon op de kaart"}
                        {" · "}
                        {hit.address}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="chips" role="group" aria-label="Filter op voorziening">
            <button
              className={`chip ${filter === "all" ? "on" : ""}`}
              onClick={() => setFilter("all")}
            >
              Alles
            </button>
            {AMENITIES.map((item) => {
              const Icon = AMENITY_ICON[item.key];
              return (
                <button
                  key={item.key}
                  className={`chip am-${item.key} ${filter === item.key ? "on" : ""}`}
                  onClick={() => setFilter(filter === item.key ? "all" : item.key)}
                >
                  <Icon size={16} /> {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel-list">
          {loaded ? (
            <PlaceList
              places={filtered}
              origin={userLocation}
              sort={sort}
              onSortChange={(next) => {
                if (next === "distance" && !userLocation) {
                  locate(() => setSort("distance"));
                } else {
                  setSort(next);
                }
              }}
              onSelect={selectPlace}
              onAdd={() => startAdding()}
              selectedId={selectedPlace?.id ?? null}
            />
          ) : (
            <div className="skeletons" aria-label="Laden">
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          )}
        </div>
      </aside>

      <main className="map-area">
        <MapCanvas
          places={filtered}
          selectedId={selectedPlace?.id ?? null}
          userLocation={userLocation}
          flyTo={flyTo}
          picking={false}
          filter="all"
          onSelect={selectPlace}
          onPick={() => undefined}
        />

        <div className="map-buttons">
          <button className="icon-btn floating" onClick={() => locate()} aria-label="Mijn locatie">
            <LocateIcon size={20} />
          </button>
          <button className="fab mobile-only" onClick={() => startAdding()} aria-label="Plek toevoegen">
            <PlusIcon size={24} />
          </button>
        </div>

        {toast ? <div className="toast" role="status">{toast}</div> : null}

        {selectedPlace ? (
          <PlaceSheet
            key={selectedPlace.id + selectedPlace.updatedAt}
            place={selectedPlace}
            origin={userLocation}
            onClose={() => setSelected(null)}
            onSaved={(place) => {
              setPlaces((current) => current.map((item) => (item.id === place.id ? place : item)));
              setSelected(place);
              setToast("Bedankt! De info is bijgewerkt.");
            }}
          />
        ) : null}
      </main>

      <div className="view-toggle mobile-only" role="group" aria-label="Weergave">
        <button className={view === "map" ? "on" : ""} onClick={() => setView("map")}>
          <MapIcon size={18} /> Kaart
        </button>
        <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>
          <ListIcon size={18} /> Lijst
        </button>
      </div>

      {adding ? (
        <AddPlaceModal
          initialVenue={adding.venue}
          existing={places}
          onOpenExisting={(place) => {
            setToast("Deze zaak staat al in TinyTable");
            selectPlace(place);
          }}
          onClose={() => setAdding(null)}
          onSaved={(place) => {
            setPlaces((current) => [...current, place]);
            setAdding(null);
            setSelected(place);
            setFlyTo({ lat: place.lat, lng: place.lng });
            setToast("Plek toegevoegd — bedankt voor het delen!");
          }}
        />
      ) : null}
    </div>
  );
}
