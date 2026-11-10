"use client";

import { useState } from "react";
import { AmenityEditor, AmenityGlance } from "@/components/AmenityEditor";
import { emptyAmenities, kidScore, scoreLabel } from "@/lib/score";
import type { Amenities, Place, PlaceType } from "@/lib/types";

const TYPE_LABEL: Record<PlaceType, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  cafe: "Café",
};

function scoreColor(score: number | null): string {
  if (score === null) return "#c4b0a4";
  if (score >= 8) return "#1f8a7a";
  if (score >= 5) return "#f4b942";
  if (score >= 3) return "#ff6b4a";
  return "#d64545";
}

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

type Props = {
  place: Place;
  onClose: () => void;
  onSaved: (place: Place) => void;
};

export function PlaceSheet({ place, onClose, onSaved }: Props) {
  const [editing, setEditing] = useState(
    // Nog niets bekend? Dan meteen het invulformulier tonen.
    Object.values(place.amenities ?? {}).every((value) => value === null)
  );
  const [amenities, setAmenities] = useState<Amenities>(place.amenities);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const score = kidScore(place.amenities);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const next = await sendJson<Place>(`/api/places/${place.id}`, "PATCH", {
        amenities,
        note,
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
    <aside className="sheet">
      <button className="close" onClick={onClose} aria-label="Sluiten">
        ×
      </button>
      <p className="meta">{TYPE_LABEL[place.type]} · {place.city}</p>
      <h2>{place.name}</h2>
      <p className="meta">{place.address}</p>

      <div className="score-row">
        <div className="score-bubble" style={{ background: scoreColor(score) }}>
          {score ?? "?"}
        </div>
        <div>
          <strong>{scoreLabel(score)}</strong>
          <p className="meta">
            Score op 10, op basis van wat andere ouders invulden.
          </p>
        </div>
      </div>

      {editing ? (
        <>
          <AmenityEditor value={amenities} onChange={setAmenities} />
          <label className="field">
            Extra toelichting (optioneel)
            <textarea
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Bijv. verschoningstafel zit in het toilet"
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="actions">
            <button className="ghost-btn" onClick={() => setEditing(false)}>
              Annuleren
            </button>
            <button className="primary-btn" onClick={save} disabled={saving}>
              {saving ? "Bewaren…" : "Info bijwerken"}
            </button>
          </div>
        </>
      ) : (
        <>
          <AmenityGlance amenities={place.amenities} />
          {place.note ? <p className="meta">{place.note}</p> : null}
          <div className="actions">
            <button
              className="primary-btn"
              onClick={() => {
                setAmenities(place.amenities);
                setEditing(true);
              }}
            >
              Klopt dit niet?
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

export function AddPlaceModal({
  draft,
  onClose,
  onSaved,
}: {
  draft: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  onClose: () => void;
  onSaved: (place: Place) => void;
}) {
  const [name, setName] = useState(draft.name);
  const [address, setAddress] = useState(draft.address);
  const [type, setType] = useState<PlaceType>("restaurant");
  const [amenities, setAmenities] = useState<Amenities>(emptyAmenities());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) {
      setError("Geef de plek een naam");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const place = await sendJson<Place>("/api/places", "POST", {
        name,
        address,
        type,
        lat: draft.lat,
        lng: draft.lng,
        amenities,
        note,
      });
      onSaved(place);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal">
      <button className="close" onClick={onClose} aria-label="Sluiten">
        ×
      </button>
      <p className="meta">Plek toevoegen · geen account nodig</p>
      <h2>Wat is er voor kinderen?</h2>
      <label className="field">
        Naam
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="field">
        Adres
        <input
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </label>
      <label className="field">
        Type
        <select
          value={type}
          onChange={(event) => setType(event.target.value as PlaceType)}
        >
          <option value="restaurant">Restaurant</option>
          <option value="bar">Bar</option>
          <option value="cafe">Café</option>
        </select>
      </label>
      <AmenityEditor value={amenities} onChange={setAmenities} />
      <label className="field">
        Extra toelichting (optioneel)
        <textarea
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="actions">
        <button className="ghost-btn" onClick={onClose}>
          Annuleren
        </button>
        <button className="primary-btn" onClick={save} disabled={saving}>
          {saving ? "Bewaren…" : "Publiceren"}
        </button>
      </div>
    </div>
  );
}
