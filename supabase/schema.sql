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
