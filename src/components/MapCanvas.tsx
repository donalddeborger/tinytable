"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import { ANTWERP } from "@/lib/antwerp";
import { kidRating, scoreTone, TONE_COLOR } from "@/lib/score";
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

function markerIcon(place: Place, selected: boolean) {
  const rating = kidRating(place.amenities);
  const color = TONE_COLOR[scoreTone(rating)];
  const label =
    rating === null
      ? "?"
      : '<svg viewBox="0 0 24 24" width="17" height="17" fill="white"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z"/></svg>';
  return L.divIcon({
    className: "",
    iconSize: [40, 48],
    iconAnchor: [20, 46],
    html: `<div class="pin${selected ? " pin-selected" : ""}" style="--pin:${color}"><span>${label}</span></div>`,
  });
}

const isMobile = () => typeof window !== "undefined" && window.innerWidth < 900;

function FlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    const zoom = Math.max(map.getZoom(), 15);
    let center = L.latLng(target.lat, target.lng);
    if (isMobile()) {
      // Op gsm bedekt de fiche het onderste deel: zet de pin hoger in beeld.
      const point = map.project(center, zoom).add([0, map.getSize().y * 0.3]);
      center = map.unproject(point, zoom);
    }
    map.flyTo(center, zoom, { duration: 0.7 });
  }, [map, target]);
  return null;
}

function FitToPlaces({ places }: { places: Place[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || places.length === 0) return;
    done.current = true;
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, {
      paddingTopLeft: isMobile() ? [40, 250] : [80, 80],
      paddingBottomRight: isMobile() ? [40, 110] : [80, 80],
      maxZoom: 15,
    });
  }, [map, places]);
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
        html: `<div class="me-dot"></div>`,
      }),
    [],
  );

  return (
    <MapContainer
      className="map"
      center={[ANTWERP.lat, ANTWERP.lng]}
      zoom={ANTWERP.zoom}
      scrollWheelZoom
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <ZoomControl position="bottomright" />
      <FlyTo target={flyTo} />
      <FitToPlaces places={places} />
      <ClickCatcher enabled={picking} onPick={onPick} />
      {visible
        .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng))
        .map((place) => (
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
