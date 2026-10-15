"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { ANTWERP } from "@/lib/antwerp";
import { kidScore } from "@/lib/score";
import type { AmenityKey, Place } from "@/lib/types";
import "leaflet/dist/leaflet.css";

type Props = {
  places: Place[];
  selectedId: string | null;
  userLocation: { lat: number; lng: number } | null;
  flyTo: { lat: number; lng: number } | null;
  picking: boolean;
  filter: AmenityKey | "all";
  onSelect: (place: Place) => void;
  onPick: (lat: number, lng: number) => void;
};

function scoreColor(score: number | null): string {
  if (score === null) return "#c4b0a4";
  if (score >= 8) return "#1f8a7a";
  if (score >= 5) return "#f4b942";
  if (score >= 3) return "#ff6b4a";
  return "#d64545";
}

function markerIcon(place: Place, selected: boolean) {
  const score = kidScore(place.amenities);
  const color = scoreColor(score);
  const label = score === null ? "?" : String(score);
  return L.divIcon({
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    html: `<div class="pin" style="background:${color};${selected ? "transform:rotate(-45deg) scale(1.18);" : ""}"><span>${label}</span></div>`,
  });
}

function FlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], 16, { duration: 0.8 });
  }, [map, target]);
  return null;
}

function ClickCatcher({
  enabled,
  onPick,
}: {
  enabled: boolean;
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      if (!enabled) return;
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function MapCanvas({
  places,
  selectedId,
  userLocation,
  flyTo,
  picking,
  filter,
  onSelect,
  onPick,
}: Props) {
  const visible = useMemo(
    () =>
      places.filter((place) =>
        filter === "all" ? true : place.amenities[filter] === true,
      ),
    [places, filter],
  );

  const userIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#2a1a12;border:3px solid white;box-shadow:0 0 0 8px rgba(42,26,18,.15)"></div>`,
      }),
    [],
  );

  return (
    <MapContainer
      className="map"
      center={[ANTWERP.lat, ANTWERP.lng]}
      zoom={ANTWERP.zoom}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo target={flyTo} />
      <ClickCatcher enabled={picking} onPick={onPick} />
      {visible.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={markerIcon(place, place.id === selectedId)}
          eventHandlers={{ click: () => onSelect(place) }}
        />
      ))}
      {userLocation ? (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
        />
      ) : null}
    </MapContainer>
  );
}
