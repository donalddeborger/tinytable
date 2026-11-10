"use client";

import { useEffect, useState } from "react";
import { AmenityEditor, AmenityGlance } from "@/components/AmenityEditor";
import { Hearts } from "@/components/Rating";
import { CloseIcon, EditIcon, RouteIcon, SearchIcon, TYPE_EMOJI, TYPE_LABEL } from "@/components/Icons";
import { emptyAmenities, kidRating, ratingText, scoreLabel } from "@/lib/score";
import { distanceKm, formatDistance, routeUrl, type LatLng } from "@/lib/geo";
import type { Amenities, Place, PlaceType, Venue } from "@/lib/types";

async function sendJson<T>(url: string, method: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? "Er ging iets mis, probeer het opnieuw");
  }
  return data as T;
}

function updatedLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" });
}

type Props = {
  place: Place;
  origin: LatLng | null;
  onClose: () => void;
  onSaved: (place: Place) => void;
};

export function PlaceSheet({ place, origin, onClose, onSaved }: Props) {
  const [editing, setEditing] = useState(
    // Nog niets bekend? Dan meteen het invulformulier tonen.
    Object.values(place.amenities ?? {}).every((value) => value === null),
  );
  const [amenities, setAmenities] = useState<Amenities>(place.amenities);
  const [note, setNote] = useState("");
  const [trap, setTrap] = useState("");
  const [name, setName] = useState(place.name);
  const [address, setAddress] = useState(place.address);
  const [type, setType] = useState<PlaceType>(place.type);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rating = kidRating(place.amenities);

  function startEditing() {
    setAmenities(place.amenities);
    setName(place.name);
    setAddress(place.address);
    setType(place.type);
    setEditing(true);
  }

  async function save() {
    if (!name.trim()) {
      setError("Geef de plek een naam");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const next = await sendJson<Place>(`/api/places/${place.id}`, "PATCH", {
        amenities,
        note,
        name,
        address,
        type,
        website: trap,
      });
      setEditing(false);
      onSaved(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis");
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="sheet" aria-label={place.name}>
      <div className="grabber" aria-hidden />
      <button className="icon-btn close" onClick={onClose} aria-label="Sluiten">
        <CloseIcon size={18} />
      </button>

      <div className="sheet-head">
        <span className="chip-static">
          {TYPE_EMOJI[place.type]} {TYPE_LABEL[place.type]}
          {origin ? ` · ${formatDistance(distanceKm(origin, place))}` : ""}
        </span>
        <h2>{place.name}</h2>
        <p className="muted">{place.address}</p>
      </div>

      <div className="score-card">
        <div>
          <Hearts rating={rating} size={26} />
          <strong>{scoreLabel(rating)}</strong>
          <p className="muted small">
            {rating === null
              ? "Help andere ouders en vul in wat er is"
              : `${ratingText(rating)} · op basis van wat ouders invulden`}
          </p>
        </div>
      </div>

      {editing ? (
        <div className="edit-block">
          <h3>Gegevens</h3>
          <label className="field">
            <span>Naam</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="field">
            <span>Adres</span>
            <input value={address} onChange={(event) => setAddress(event.target.value)} />
          </label>
          <TypePicker value={type} onChange={setType} />

          <h3>Wat is er voor kinderen?</h3>
          <AmenityEditor value={amenities} onChange={setAmenities} />
          <label className="field">
            <span>Extra toelichting (optioneel)</span>
            <textarea
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Bijv. verschoningstafel zit in het toilet beneden"
            />
          </label>
          <BotTrap value={trap} onChange={setTrap} />
          {error ? <p className="form-error">{error}</p> : null}
          <div className="actions">
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>
              Annuleren
            </button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Bewaren…" : "Bewaren"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="actions">
            <a
              className="btn btn-primary"
              href={routeUrl(place)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <RouteIcon size={18} /> Route
            </a>
            <button
              className="btn btn-soft"
              onClick={startEditing}
            >
              <EditIcon size={18} /> Info aanpassen
            </button>
          </div>

          <AmenityGlance amenities={place.amenities} />

          {place.note ? <p className="note">“{place.note}”</p> : null}
          {place.updatedAt ? (
            <p className="muted small updated">Laatst bijgewerkt op {updatedLabel(place.updatedAt)}</p>
          ) : null}
        </>
      )}
    </aside>
  );
}

// Onzichtbaar veld: mensen zien het niet, spambots vullen het wel in.
function BotTrap({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="bot-trap" aria-hidden="true">
      <label>
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}

function TypePicker({
  value,
  onChange,
}: {
  value: PlaceType;
  onChange: (type: PlaceType) => void;
}) {
  return (
    <div className="field">
      <span>Soort zaak</span>
      <div className="segmented" role="group" aria-label="Soort zaak">
        {(["restaurant", "cafe", "bar"] as PlaceType[]).map((t) => (
          <button
            key={t}
            type="button"
            className={value === t ? "on" : ""}
            onClick={() => onChange(t)}
          >
            {TYPE_EMOJI[t]} {TYPE_LABEL[t]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AddPlaceModal({
  initialVenue,
  existing,
  onOpenExisting,
  onClose,
  onSaved,
}: {
  initialVenue: Venue | null;
  existing: Place[];
  onOpenExisting: (place: Place) => void;
  onClose: () => void;
  onSaved: (place: Place) => void;
}) {
  const [venue, setVenue] = useState<Venue | null>(initialVenue);
  const [lookingUp, setLookingUp] = useState(false);
  const [trap, setTrap] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Venue[]>([]);
  const [searching, setSearching] = useState(false);
  const [type, setType] = useState<PlaceType>(initialVenue?.type ?? "restaurant");
  const [amenities, setAmenities] = useState<Amenities>(emptyAmenities());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (venue || q.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(() => {
      void fetch(`/api/geocode?venues=1&q=${encodeURIComponent(q)}`)
        .then((response) => (response.ok ? response.json() : []))
        .then((data: Venue[]) => setResults(data))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [query, venue]);

  function findExisting(v: Venue): Place | undefined {
    return existing.find(
      (p) =>
        p.osmId === v.osmId ||
        (Math.abs(p.lat - v.lat) < 0.0003 &&
          Math.abs(p.lng - v.lng) < 0.0003 &&
          p.name.toLowerCase() === v.name.toLowerCase()),
    );
  }

  function choose(v: Venue) {
    const already = findExisting(v);
    if (already) {
      onOpenExisting(already);
      return;
    }
    setVenue(v);
    setType(v.type ?? "restaurant");
    setError(null);

    // Geen huisnummer in OpenStreetMap? Zoek het adres op via de locatie.
    const street = v.address.split(",")[0] ?? "";
    if (!/\d/.test(street)) {
      setLookingUp(true);
      void fetch(`/api/address?lat=${v.lat}&lng=${v.lng}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { address: string; hasNumber: boolean } | null) => {
          if (data?.hasNumber && data.address) {
            setVenue((current) =>
              current && current.osmId === v.osmId ? { ...current, address: data.address } : current,
            );
          }
        })
        .catch(() => undefined)
        .finally(() => setLookingUp(false));
    }
  }

  async function save() {
    if (!venue) return;
    setSaving(true);
    setError(null);
    try {
      const place = await sendJson<Place>("/api/places", "POST", {
        name: venue.name,
        address: venue.address,
        city: venue.city,
        type,
        lat: venue.lat,
        lng: venue.lng,
        amenities,
        note,
        osmId: venue.osmId,
        website: trap,
      });
      onSaved(place);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className="sheet dialog"
        role="dialog"
        aria-label="Plek toevoegen"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grabber" aria-hidden />
        <button className="icon-btn close" onClick={onClose} aria-label="Sluiten">
          <CloseIcon size={18} />
        </button>
        <div className="sheet-head">
          <span className="chip-static">Nieuwe plek · geen account nodig</span>
          <h2>Plek toevoegen</h2>
        </div>

        {!venue ? (
          <>
            <p className="muted small step-hint">
              Zoek de zaak op. Naam en adres komen uit OpenStreetMap, zo kloppen ze altijd.
            </p>
            <div className="search search-inline">
              <SearchIcon size={18} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Naam van het restaurant, café of bar"
                aria-label="Zaak zoeken"
              />
            </div>
            <div className="venue-results">
              {searching ? <p className="muted small">Zoeken…</p> : null}
              {!searching && query.trim().length >= 3 && results.length === 0 ? (
                <p className="muted small">
                  Niets gevonden in Antwerpen. Probeer een andere schrijfwijze of voeg de straat toe.
                </p>
              ) : null}
              {results.map((v) => {
                const already = findExisting(v);
                return (
                  <button key={v.osmId} className="venue" onClick={() => choose(v)}>
                    <span className={`type-tile small type-${v.type ?? "restaurant"}`} aria-hidden>
                      {TYPE_EMOJI[v.type ?? "restaurant"]}
                    </span>
                    <span className="venue-body">
                      <strong>{v.name}</strong>
                      <small>{v.address}</small>
                    </span>
                    {already ? <span className="badge">Al in TinyTable</span> : null}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="venue picked">
              <span className={`type-tile small type-${type}`} aria-hidden>
                {TYPE_EMOJI[type]}
              </span>
              <span className="venue-body">
                <strong>{venue.name}</strong>
                <small>{lookingUp ? "Adres opzoeken…" : venue.address}</small>
              </span>
              {initialVenue ? null : (
                <button className="link-btn dark" onClick={() => setVenue(null)}>
                  Wijzig
                </button>
              )}
            </div>

            <TypePicker value={type} onChange={setType} />

            <h3>Wat is er voor kinderen?</h3>
            <AmenityEditor value={amenities} onChange={setAmenities} />
            <label className="field">
              <span>Extra toelichting (optioneel)</span>
              <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <BotTrap value={trap} onChange={setTrap} />
            {error ? <p className="form-error">{error}</p> : null}
            <div className="actions">
              <button className="btn btn-ghost" onClick={onClose}>
                Annuleren
              </button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? "Bewaren…" : "Publiceren"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
