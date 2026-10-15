"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AddPlaceModal, PlaceSheet } from "@/components/PlaceSheet";
import { AMENITIES } from "@/lib/score";
import { ANTWERP, isInAntwerp } from "@/lib/antwerp";
import type { AmenityKey, Place } from "@/lib/types";

const MapCanvas = dynamic(
  () => import("@/components/MapCanvas").then((mod) => mod.MapCanvas),
  { ssr: false },
);

type SearchHit = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  source: "local" | "map";
  place?: Place;
};

export function AppShell() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [filter, setFilter] = useState<AmenityKey | "all">("all");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(
    ANTWERP,
  );
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState<{
    name: string;
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/places")
      .then((response) => response.json())
      .then((data: Place[]) => setPlaces(data));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setHits([]);
      return;
    }

    const local = places
      .filter((place) =>
        `${place.name} ${place.address}`.toLowerCase().includes(trimmed.toLowerCase()),
      )
      .map((place) => ({
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        source: "local" as const,
        place,
      }));

    const timer = window.setTimeout(() => {
      void fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`)
        .then((response) => response.json())
        .then(
          (
            remote: { name: string; address: string; lat: number; lng: number }[],
          ) => {
            const extra = remote
              .filter(
                (item) =>
                  !local.some(
                    (hit) =>
                      Math.abs(hit.lat - item.lat) < 0.0004 &&
                      Math.abs(hit.lng - item.lng) < 0.0004,
                  ),
              )
              .map((item) => ({ ...item, source: "map" as const }));
            setHits([...local, ...extra].slice(0, 8));
          },
        );
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, places]);

  function locate() {
    if (!navigator.geolocation) {
      setToast("Locatie wordt niet ondersteund");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(next);
        if (isInAntwerp(next.lat, next.lng)) {
          setFlyTo(next);
        } else {
          setToast("We focussen nu op Antwerpen, later volgen andere steden.");
          setFlyTo(ANTWERP);
        }
      },
      () => setToast("Locatie kon niet worden bepaald"),
    );
  }

  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selected?.id) ?? selected,
    [places, selected],
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 10h16M6 10v8M18 10v8M8 18h8M9 10V7a3 3 0 0 1 6 0v3"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1>Tinytable</h1>
            <p>Kindvriendelijke horeca</p>
          </div>
        </div>

        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek een restaurant of bar in Antwerpen"
            aria-label="Zoeken"
          />
          {hits.length > 0 ? (
            <div className="results">
              {hits.map((hit) => (
                <button
                  key={`${hit.source}-${hit.name}-${hit.lat}`}
                  className="result"
                  onClick={() => {
                    setQuery("");
                    setHits([]);
                    setFlyTo({ lat: hit.lat, lng: hit.lng });
                    if (hit.place) {
                      setSelected(hit.place);
                    } else {
                      setSelected(null);
                      setDraft({
                        name: hit.name,
                        address: hit.address,
                        lat: hit.lat,
                        lng: hit.lng,
                      });
                    }
                  }}
                >
                  <strong>{hit.name}</strong>
                  <span>
                    {hit.source === "local"
                      ? "Al in Tinytable"
                      : "Nog geen kindinfo · tik om toe te voegen"}
                    {" · "}
                    {hit.address}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="top-actions">
          <button className="icon-btn" onClick={locate} title="Mijn locatie">
            ◎
          </button>
          <button
            className="primary-btn"
            onClick={() => {
              setPicking(true);
              setSelected(null);
              setToast("Tik op de kaart om een plek te pinzetten");
            }}
          >
            + Plek
          </button>
        </div>
      </header>

      <div className="map-stage">
        <div className="filters">
          <button
            className={`chip ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Alles
          </button>
          {AMENITIES.map((item) => (
            <button
              key={item.key}
              className={`chip ${filter === item.key ? "active" : ""}`}
              onClick={() => setFilter(item.key)}
            >
              {item.short}
            </button>
          ))}
        </div>

        <MapCanvas
          places={places}
          selectedId={selectedPlace?.id ?? null}
          userLocation={userLocation}
          flyTo={flyTo}
          picking={picking}
          filter={filter}
          onSelect={(place) => {
            setSelected(place);
            setDraft(null);
          }}
          onPick={(lat, lng) => {
            setPicking(false);
            setDraft({
              name: "",
              address: "Antwerpen",
              lat,
              lng,
            });
          }}
        />

        {picking ? (
          <div className="pick-banner">Tik op de kaart om de locatie te kiezen</div>
        ) : null}

        {toast ? <div className="toast">{toast}</div> : null}

        {selectedPlace ? (
          <PlaceSheet
            key={selectedPlace.id + selectedPlace.updatedAt}
            place={selectedPlace}
            onClose={() => setSelected(null)}
            onSaved={(place) => {
              setPlaces((current) =>
                current.map((item) => (item.id === place.id ? place : item)),
              );
              setSelected(place);
              setToast("Bedankt, de info is bijgewerkt");
            }}
          />
        ) : null}

        {draft ? (
          <AddPlaceModal
            draft={draft}
            onClose={() => setDraft(null)}
            onSaved={(place) => {
              setPlaces((current) => [...current, place]);
              setDraft(null);
              setSelected(place);
              setToast("Plek toegevoegd voor andere ouders");
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
