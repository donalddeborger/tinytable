-- Tinytable — databaseschema (Supabase / Postgres)
-- Dit is toegepast op het Supabase-project TinyTable (migratie: tinytable_places_v2).
--
-- Ontwerp:
-- * Iedereen mag plekken LEZEN (Row Level Security: select-policy).
-- * Niemand mag rechtstreeks in de tabel schrijven.
-- * Toevoegen en bijwerken gaat enkel via twee functies (add_place, update_place)
--   die de invoer controleren. Zo volstaat de publieke sleutel en is er
--   geen geheime sleutel nodig in de website.

drop table if exists public.places cascade;

create table public.places (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  type        text not null default 'restaurant'
              check (type in ('restaurant', 'bar', 'cafe')),
  address     text not null default '' check (char_length(address) <= 300),
  city        text not null default 'Antwerpen' check (char_length(city) <= 80),
  lat         double precision not null check (lat between -90 and 90),
  lng         double precision not null check (lng between -180 and 180),
  amenities   jsonb not null default
              '{"changingTable":null,"highChairs":null,"playCorner":null,"kidsMenu":null}'::jsonb,
  note        text check (char_length(note) <= 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.places enable row level security;

create policy "Iedereen mag plekken lezen"
  on public.places for select
  to anon, authenticated
  using (true);

revoke insert, update, delete, truncate on public.places from anon, authenticated;

-- Houdt enkel de vier gekende voorzieningen over, met waarde true/false/null.
create or replace function public.clean_amenities(input jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_build_object(
    'changingTable', case when jsonb_typeof(input->'changingTable') = 'boolean' then input->'changingTable' else 'null'::jsonb end,
    'highChairs',    case when jsonb_typeof(input->'highChairs')    = 'boolean' then input->'highChairs'    else 'null'::jsonb end,
    'playCorner',    case when jsonb_typeof(input->'playCorner')    = 'boolean' then input->'playCorner'    else 'null'::jsonb end,
    'kidsMenu',      case when jsonb_typeof(input->'kidsMenu')      = 'boolean' then input->'kidsMenu'      else 'null'::jsonb end
  );
$$;

create or replace function public.add_place(
  p_name text,
  p_type text,
  p_address text,
  p_city text,
  p_lat double precision,
  p_lng double precision,
  p_amenities jsonb,
  p_note text default null
)
returns public.places
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.places;
begin
  if coalesce(btrim(p_name), '') = '' then
    raise exception 'Geef de plek een naam' using errcode = '22023';
  end if;

  insert into public.places (name, type, address, city, lat, lng, amenities, note)
  values (
    left(btrim(p_name), 120),
    case when p_type in ('restaurant', 'bar', 'cafe') then p_type else 'restaurant' end,
    left(coalesce(btrim(p_address), ''), 300),
    coalesce(nullif(left(btrim(p_city), 80), ''), 'Antwerpen'),
    p_lat,
    p_lng,
    public.clean_amenities(p_amenities),
    nullif(left(btrim(p_note), 500), '')
  )
  returning * into result;

  return result;
end;
$$;

create or replace function public.update_place(
  p_id uuid,
  p_amenities jsonb,
  p_note text default null
)
returns public.places
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.places;
begin
  update public.places
     set amenities  = public.clean_amenities(p_amenities),
         -- een lege toelichting wist de bestaande niet
         note       = coalesce(nullif(left(btrim(p_note), 500), ''), note),
         updated_at = now()
   where id = p_id
  returning * into result;

  return result; -- null als de plek niet bestaat
end;
$$;

revoke all on function public.add_place(text, text, text, text, double precision, double precision, jsonb, text) from public;
revoke all on function public.update_place(uuid, jsonb, text) from public;
grant execute on function public.add_place(text, text, text, text, double precision, double precision, jsonb, text) to anon, authenticated;
grant execute on function public.update_place(uuid, jsonb, text) to anon, authenticated;

-- Echte plekken uit de eerste versie
insert into public.places (name, type, address, city, lat, lng, amenities) values
  ('Bar Bruk', 'cafe', 'Karel De Preterlei 222, 2140 Antwerpen', 'Antwerpen',
   51.20023593490327, 4.449836799220926,
   '{"changingTable":false,"highChairs":true,"playCorner":false,"kidsMenu":false}'),
  ('Bobette', 'cafe', 'De Leescorfstraat 2, 2140 Borgerhout', 'Antwerpen',
   51.20059376667489, 4.447587461649962,
   '{"changingTable":false,"highChairs":false,"playCorner":false,"kidsMenu":false}'),
  ('Aan het Strand Van Oostende', 'restaurant', 'Antwerpen', 'Antwerpen',
   51.20758909004148, 4.430004025407014,
   '{"changingTable":null,"highChairs":true,"playCorner":false,"kidsMenu":true}');

-- ---------------------------------------------------------------
-- Uitbreiding (10 nov 2026): OpenStreetMap-koppeling en bewerken
-- van naam/adres/soort. Nieuwe functies naast de oude (de oude
-- add_place/update_place mogen weg zodra niets ze nog gebruikt).
-- ---------------------------------------------------------------

alter table public.places add column if not exists osm_id text check (char_length(osm_id) <= 40);
create unique index if not exists places_osm_id_key on public.places (osm_id) where osm_id is not null;

create or replace function public.add_place_v2(
  p_name text, p_type text, p_address text, p_city text,
  p_lat double precision, p_lng double precision,
  p_amenities jsonb, p_note text default null, p_osm_id text default null
)
returns public.places
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.places;
begin
  if coalesce(btrim(p_name), '') = '' then
    raise exception 'Geef de plek een naam' using errcode = '22023';
  end if;

  insert into public.places (name, type, address, city, lat, lng, amenities, note, osm_id)
  values (
    left(btrim(p_name), 120),
    case when p_type in ('restaurant', 'bar', 'cafe') then p_type else 'restaurant' end,
    left(coalesce(btrim(p_address), ''), 300),
    coalesce(nullif(left(btrim(p_city), 80), ''), 'Antwerpen'),
    p_lat, p_lng,
    public.clean_amenities(p_amenities),
    nullif(left(btrim(p_note), 500), ''),
    nullif(left(btrim(p_osm_id), 40), '')
  )
  returning * into result;
  return result;
end;
$$;

create or replace function public.update_place_v2(
  p_id uuid,
  p_amenities jsonb,
  p_note text default null,
  p_name text default null,
  p_address text default null,
  p_type text default null
)
returns public.places
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.places;
begin
  update public.places
     set amenities  = public.clean_amenities(p_amenities),
         note       = coalesce(nullif(left(btrim(p_note), 500), ''), note),
         name       = coalesce(nullif(left(btrim(p_name), 120), ''), name),
         address    = coalesce(nullif(left(btrim(p_address), 300), ''), address),
         type       = case when p_type in ('restaurant', 'bar', 'cafe') then p_type else type end,
         updated_at = now()
   where id = p_id
  returning * into result;
  return result;
end;
$$;

revoke all on function public.add_place_v2(text, text, text, text, double precision, double precision, jsonb, text, text) from public;
revoke all on function public.update_place_v2(uuid, jsonb, text, text, text, text) from public;
grant execute on function public.add_place_v2(text, text, text, text, double precision, double precision, jsonb, text, text) to anon, authenticated;
grant execute on function public.update_place_v2(uuid, jsonb, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------
-- Bescherming tegen misbruik (10 nov 2026)
-- Schrijven kan alleen nog via de website-server: die kent een geheim
-- token (Vercel-variabele TINYTABLE_API_TOKEN, ook bewaard in
-- private.settings). Per bezoeker (gehashte IP) geldt een limiet,
-- links in teksten worden geweigerd en elke wijziging wordt gelogd
-- in private.place_edits zodat ze teruggedraaid kan worden.
-- Het token zelf staat NIET in dit bestand.
-- ---------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.settings (key text primary key, value text not null);
create table if not exists private.write_log (
  id bigserial primary key,
  client text not null,
  action text not null check (action in ('add', 'edit')),
  created_at timestamptz not null default now()
);
create index if not exists write_log_client_time on private.write_log (client, created_at desc);
create table if not exists private.place_edits (
  id bigserial primary key,
  place_id uuid not null,
  action text not null,
  client text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);
create index if not exists place_edits_place on private.place_edits (place_id, created_at desc);
-- insert into private.settings (key, value) values ('api_token', '<geheim token>');

-- private.guard(token, client, action, texts): controleert token, links,
-- limiet per bezoeker (20 toevoegingen / 40 aanpassingen per uur) en
-- globaal (100 / 300 per uur), en logt de actie.
-- public.add_place_v3(p_token, p_client, ...) en
-- public.update_place_v3(p_token, p_client, p_id, ...) roepen guard aan,
-- schrijven naar public.places en loggen in private.place_edits.
-- add_place_v3 aanvaardt enkel locaties in Antwerpen.
-- (Volledige definities: zie Supabase, migratie van 10 nov 2026.)

-- ---------------------------------------------------------------
-- 11 nov 2026: vijfde voorziening "playground" (buitenspeeltuin) in
-- public.clean_amenities. Type "bar" betekent voortaan koffiebar;
-- "cafe" is een Belgisch café.
-- ---------------------------------------------------------------
create or replace function public.clean_amenities(input jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_build_object(
    'changingTable', case when jsonb_typeof(input->'changingTable') = 'boolean' then input->'changingTable' else 'null'::jsonb end,
    'highChairs',    case when jsonb_typeof(input->'highChairs')    = 'boolean' then input->'highChairs'    else 'null'::jsonb end,
    'playCorner',    case when jsonb_typeof(input->'playCorner')    = 'boolean' then input->'playCorner'    else 'null'::jsonb end,
    'kidsMenu',      case when jsonb_typeof(input->'kidsMenu')      = 'boolean' then input->'kidsMenu'      else 'null'::jsonb end,
    'playground',    case when jsonb_typeof(input->'playground')    = 'boolean' then input->'playground'    else 'null'::jsonb end
  );
$$;
comment on column public.places.type is 'restaurant | cafe (Belgisch café) | bar (= koffiebar)';

-- 11 nov 2026: update_place_v3 laat naam en adres ongemoeid voor zaken met
-- een osm_id (opgezocht via de zoekfunctie); alleen zaken zonder osm_id
-- kunnen nog van naam/adres veranderen.

-- ---------------------------------------------------------------------------
-- 11 nov 2026: handmatig toevoegen met goedkeuring
-- (migratie manual_places_with_review, live)
--   places.approved (default true) en places.manual (default false)
--   leesbeleid "Iedereen mag plekken lezen": using (approved)
--   add_place_manual_v1(...): voegt toe met approved = false, manual = true
--   update_place_v3: alleen goedgekeurde zaken; naam/adres vast bij osm_id of manual
-- Goedkeuren: in Supabase Table Editor → places → filter approved = false → zet op true.

-- 11 nov 2026: hele provincie Antwerpen (migratie province_antwerp_bounds, live)
--   add_place_v3 en add_place_manual_v1: lat 50.95–51.51, lng 4.10–5.30
--   (app filtert daarnaast op postcode 2000–2999)

-- 11 nov 2026 (migratie stroller_confirmations_osm_hours, live)
--   clean_amenities: 6de sleutel 'stroller' (kinderwagenvriendelijk)
--   places: source ('user'|'osm'), confirm_count, last_confirmed_at, opening_hours
--   confirm_place_v1(p_token, p_client, p_id): "Klopt dit nog?" → Ja
--   update_place_v3: telt ook als bevestiging (confirm_count + 1)

-- 11 nov 2026: opgeruimd (lege tabel en ongebruikte oude functies verwijderd)
--   drop table public.places_oud; drop function add_place, update_place, add_place_v2, update_place_v2
