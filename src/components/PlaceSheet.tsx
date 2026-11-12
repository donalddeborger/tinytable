"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { AmenityEditor, AmenityGlance } from "@/components/AmenityEditor";
import { Hearts, WelcomeBadge } from "@/components/Rating";
import { CloseIcon, EditIcon, RouteIcon, SearchIcon, ShareIcon, TYPE_EMOJI } from "@/components/Icons";
import { useI18n } from "@/lib/i18n";
import { formatHours, todayHours } from "@/lib/hours";
import { emptyAmenities, isSuperWelcome, isWelcome, kidRating } from "@/lib/score";
import { distanceKm, routeUrl, type LatLng } from "@/lib/geo";
import type { Amenities, Place, PlaceType, Venue } from "@/lib/types";
import { isProvincePostcode } from "@/lib/antwerp";

async function sendJson<T>(url: string, method: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? "");
  }
  return data as T;
}

type Props = {
  place: Place;
  pageHref: string;
  origin: LatLng | null;
  onClose: () => void;
  onSaved: (place: Place) => void;
  onConfirmed: (place: Place) => void;
};

export function PlaceSheet({ place, pageHref, origin, onClose, onSaved, onConfirmed }: Props) {
  const { t, typeLabel, ratingText, formatDistance, formatDate, serverError } = useI18n();
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

  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function confirm() {
    setConfirming(true);
    try {
      const next = await sendJson<Place>(`/api/places/${place.id}/confirm`, "POST", { website: "" });
      setConfirmed(true);
      onConfirmed(next);
    } catch {
      setConfirmed(true);
    } finally {
      setConfirming(false);
    }
  }

  // Zaken die via de zoekfunctie zijn toegevoegd: naam en adres liggen vast.
  const locked = Boolean(place.locked ?? place.osmId);

  async function save() {
    if (!locked && !name.trim()) {
      setError(t.needName);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const next = await sendJson<Place>(`/api/places/${place.id}`, "PATCH", {
        amenities,
        note,
        // Opgezochte zaken: naam en adres liggen vast.
        ...(locked ? {} : { name, address }),
        type,
        website: trap,
      });
      setEditing(false);
      onSaved(next);
    } catch (e) {
      setError(serverError(e instanceof Error ? e.message : undefined));
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="sheet" aria-label={place.name}>
      <div className="grabber" aria-hidden />
      <ShareButton name={place.name} pageHref={pageHref} />
      <button className="icon-btn close" onClick={onClose} aria-label={t.close}>
        <CloseIcon size={18} />
      </button>

      <div className="sheet-head">
        <span className="chip-static">
          {TYPE_EMOJI[place.type]} {typeLabel(place.type)}
          {origin ? ` · ${formatDistance(distanceKm(origin, place))}` : ""}
        </span>
        <h2>{place.name}</h2>
        <p className="muted">{place.address}</p>
        {place.openingHours ? <OpenState hours={place.openingHours} /> : null}
      </div>

      <div className="score-card">
        <div>
          <Hearts rating={rating} size={26} />
          <p className="muted small">
            {rating === null
              ? t.helpParents
              : place.source === "osm" && !place.confirmCount
                ? `${ratingText(rating)} · ${t.fromOsm}`
                : `${ratingText(rating)} · ${t.confirmedBy(place.confirmCount ?? 1)}`}
            {place.lastConfirmedAt && place.confirmCount ? ` · ${formatDate(place.lastConfirmedAt)}` : ""}
          </p>
        </div>
      </div>

      {isWelcome(place.amenities) ? <WelcomeBadge large isSuper={isSuperWelcome(place.amenities)} /> : null}

      {editing ? (
        <div className="edit-block">
          <h3>{t.details}</h3>
          {locked ? (
            <div className="venue picked locked">
              <span className={`type-tile small type-${type}`} aria-hidden>
                {TYPE_EMOJI[type]}
              </span>
              <span className="venue-body">
                <strong>{place.name}</strong>
                <small>{place.address}</small>
              </span>
              <span className="lock-note">{t.locked}</span>
            </div>
          ) : (
            <>
              <label className="field">
                <span>{t.name}</span>
                <input value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="field">
                <span>{t.address}</span>
                <input value={address} onChange={(event) => setAddress(event.target.value)} />
              </label>
            </>
          )}
          <TypePicker value={type} onChange={setType} />

          <h3>{t.whatForKids}</h3>
          <AmenityEditor value={amenities} onChange={setAmenities} />
          <label className="field">
            <span>{t.note}</span>
            <textarea
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t.notePlaceholder}
            />
          </label>
          <BotTrap value={trap} onChange={setTrap} />
          {error ? <p className="form-error">{error}</p> : null}
          <div className="actions">
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>
              {t.cancel}
            </button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? t.saving : t.save}
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
              <RouteIcon size={18} /> {t.route}
            </a>
            <button
              className="btn btn-soft"
              onClick={startEditing}
            >
              <EditIcon size={18} /> {t.editInfo}
            </button>
          </div>

          {rating !== null ? (
            <div className="confirm-row">
              <span>{confirmed ? t.thanksConfirm : t.stillCorrect}</span>
              {confirmed ? null : (
                <span className="confirm-buttons">
                  <button className="btn btn-soft btn-compact" onClick={confirm} disabled={confirming}>
                    {t.yes}
                  </button>
                  <button className="btn btn-ghost btn-compact" onClick={startEditing}>
                    {t.noChange}
                  </button>
                </span>
              )}
            </div>
          ) : null}

          <AmenityGlance amenities={place.amenities} />

          {place.note ? <p className="note">“{place.note}”</p> : null}
          {place.updatedAt ? (
            <p className="muted small updated">
              {t.lastUpdated} {formatDate(place.updatedAt)} ·{" "}
              <a href={pageHref}>{t.placePage}</a>
            </p>
          ) : null}
        </>
      )}
    </aside>
  );
}

// Deel-icoon, alleen op gsm (daar opent het deelmenu: WhatsApp, Messenger, sms…).
function ShareButton({ name, pageHref }: { name: string; pageHref: string }) {
  const { t } = useI18n();
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod|Mobi/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    setCanShare(mobile && typeof navigator.share === "function");
  }, []);
  if (!canShare) return null;
  const share = async () => {
    track("Gedeeld", { zaak: name });
    try {
      await navigator.share({ title: `${name} | TinyTable`, text: t.shareText(name), url: new URL(pageHref, window.location.origin).toString() });
    } catch {
      /* geannuleerd */
    }
  };
  return (
    <button className="icon-btn share" onClick={share} aria-label={t.share}>
      <ShareIcon size={18} />
    </button>
  );
}

function OpenState({ hours }: { hours: string }) {
  const { t, lang } = useI18n();
  const now = new Date();
  const today = todayHours(hours, now);
  if (!today) {
    return (
      <p className="open-state small">
        <span className="muted">
          {t.hoursLabel}: {formatHours(hours, lang)}
        </span>
      </p>
    );
  }
  const time = (v: string) => (v === "24:00" ? t.midnight : v);
  let line: string;
  if (today.lateUntil && today.open) line = t.openUntil(time(today.lateUntil));
  else if (today.spans.length === 0) line = t.todayClosed;
  else if (today.spans.length === 1 && today.spans[0][0] === "00:00" && today.spans[0][1] === "24:00") line = t.allDay;
  else line = t.todayOpen(today.spans.map(([a, b]) => t.hourRange(time(a), time(b))).join(t.rangeAnd));
  const title = `${t.hoursLabel}: ${formatHours(hours, lang)}`;
  if (!today.open && today.spans.length === 0) {
    return (
      <p className="open-state small" title={title}>
        <strong className="is-closed">{t.todayClosed}</strong>
      </p>
    );
  }
  return (
    <p className="open-state small" title={title}>
      <strong className={today.open ? "is-open" : "is-closed"}>{today.open ? t.openNowState : t.closedNow}</strong>
      <span className="muted"> · {line}</span>
    </p>
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
  const { t, typeLabel } = useI18n();
  return (
    <div className="field">
      <span>{t.type}</span>
      <div className="segmented" role="group" aria-label={t.type}>
        {(["restaurant", "cafe", "bar"] as PlaceType[]).map((pt) => (
          <button
            key={pt}
            type="button"
            className={value === pt ? "on" : ""}
            onClick={() => onChange(pt)}
          >
            {TYPE_EMOJI[pt]} {typeLabel(pt)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AddPlaceModal({
  initialVenue,
  initialManualName,
  existing,
  onOpenExisting,
  onClose,
  onSaved,
  onSubmitted,
}: {
  initialVenue: Venue | null;
  initialManualName?: string;
  existing: Place[];
  onOpenExisting: (place: Place) => void;
  onClose: () => void;
  onSaved: (place: Place) => void;
  onSubmitted: () => void;
}) {
  const { t, serverError } = useI18n();
  const [manual, setManual] = useState(initialManualName !== undefined);
  const [manualName, setManualName] = useState(initialManualName ?? "");
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
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
    completeAddress(v);
  }

  // Gekozen via de zoekbalk bovenaan: ook dan het huisnummer aanvullen.
  useEffect(() => {
    if (initialVenue) completeAddress(initialVenue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function completeAddress(v: Venue) {
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

  function startManual() {
    setManualName(query.trim());
    setType("restaurant");
    setAmenities(emptyAmenities());
    setError(null);
    setManual(true);
  }

  async function submitManual() {
    if (manualName.trim().length < 2) return setError(t.needName);
    if (!/\d/.test(street)) return setError(t.needStreet);
    if (!isProvincePostcode(postcode)) return setError(t.needPostcode);
    setSaving(true);
    setError(null);
    try {
      await sendJson<{ ok: boolean }>("/api/places/manual", "POST", {
        name: manualName,
        street,
        postcode,
        type,
        amenities,
        note,
        website: trap,
      });
      onSubmitted();
    } catch (e) {
      setError(serverError(e instanceof Error ? e.message : undefined));
    } finally {
      setSaving(false);
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
      setError(serverError(e instanceof Error ? e.message : undefined));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className="sheet dialog"
        role="dialog"
        aria-label={t.addPlace}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grabber" aria-hidden />
        <button className="icon-btn close" onClick={onClose} aria-label={t.close}>
          <CloseIcon size={18} />
        </button>
        <div className="sheet-head">
          <span className="chip-static">{t.newPlace}</span>
          <h2>{t.addPlace}</h2>
        </div>

        {manual ? (
          <>
            <p className="muted small step-hint">{t.manualHint}</p>
            <label className="field">
              <span>{t.name}</span>
              <input value={manualName} onChange={(event) => setManualName(event.target.value)} maxLength={120} />
            </label>
            <label className="field">
              <span>{t.streetNr}</span>
              <input
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                placeholder={t.streetPlaceholder}
                autoComplete="street-address"
                maxLength={200}
              />
            </label>
            <label className="field">
              <span>{t.postcode}</span>
              <input
                value={postcode}
                onChange={(event) => setPostcode(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder={t.postcodePlaceholder}
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={4}
              />
            </label>
            <TypePicker value={type} onChange={setType} />
            <h3>{t.whatForKids}</h3>
            <AmenityEditor value={amenities} onChange={setAmenities} />
            <label className="field">
              <span>{t.note}</span>
              <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder={t.notePlaceholder} />
            </label>
            <BotTrap value={trap} onChange={setTrap} />
            {error ? <p className="form-error">{error}</p> : null}
            <div className="actions">
              <button className="btn btn-ghost" onClick={() => setManual(false)}>
                {t.back}
              </button>
              <button className="btn btn-primary" onClick={submitManual} disabled={saving}>
                {saving ? t.sending : t.sendForReview}
              </button>
            </div>
          </>
        ) : !venue ? (
          <>
            <p className="muted small step-hint">
              {t.findHint}
            </p>
            <div className="search search-inline">
              <SearchIcon size={18} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.venuePlaceholder}
                aria-label={t.findVenue}
              />
            </div>
            <div className="venue-results">
              {searching ? <p className="muted small">{t.searching}</p> : null}
              {!searching && query.trim().length >= 3 && results.length === 0 ? (
                <p className="muted small">
                  {t.nothingFound}
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
                    {already ? <span className="badge">{t.alreadyBadge}</span> : null}
                  </button>
                );
              })}
            </div>
            {!searching && query.trim().length >= 3 ? (
              <p className="manual-cta">
                {t.notFoundQ}{" "}
                <button type="button" className="link-btn dark" onClick={startManual}>
                  {t.addManually}
                </button>
              </p>
            ) : null}
          </>
        ) : (
          <>
            <div className="venue picked">
              <span className={`type-tile small type-${type}`} aria-hidden>
                {TYPE_EMOJI[type]}
              </span>
              <span className="venue-body">
                <strong>{venue.name}</strong>
                <small>{lookingUp ? t.lookingUp : venue.address}</small>
              </span>
              {initialVenue ? null : (
                <button className="link-btn dark" onClick={() => setVenue(null)}>
                  {t.change}
                </button>
              )}
            </div>

            <TypePicker value={type} onChange={setType} />

            <h3>{t.whatForKids}</h3>
            <AmenityEditor value={amenities} onChange={setAmenities} />
            <label className="field">
              <span>{t.note}</span>
              <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder={t.notePlaceholder} />
            </label>
            <BotTrap value={trap} onChange={setTrap} />
            {error ? <p className="form-error">{error}</p> : null}
            <div className="actions">
              <button className="btn btn-ghost" onClick={onClose}>
                {t.cancel}
              </button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? t.saving : t.publish}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
