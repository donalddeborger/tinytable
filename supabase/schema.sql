-- Tinytable — databaseschema voor Supabase
-- Plak dit volledig in Supabase → SQL Editor → New query, en klik op Run.
-- Het script is veilig om opnieuw te draaien.

-- 1. Een eventuele bestaande, oude tabel 'places' bewaren als 'places_oud'
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'places')
     and not exists (select 1 from information_schema.columns
                     where table_schema = 'public' and table_name = 'places'
                       and column_name = 'updated_at')
     and not exists (select 1 from information_schema.tables
                     where table_schema = 'public' and table_name = 'places_oud')
  then
    alter table public.places rename to places_oud;
  end if;
end $$;

-- 2. De nieuwe tabel
create table if not exists public.places (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  type        text not null default 'restaurant'
              check (type in ('restaurant', 'bar', 'cafe')),
  address     text not null default '' check (char_length(address) <= 300),
  city        text not null default 'Antwerpen',
  lat         double precision not null check (lat between -90 and 90),
  lng         double precision not null check (lng between -180 and 180),
  amenities   jsonb not null default
              '{"changingTable":null,"highChairs":null,"playCorner":null,"kidsMenu":null}'::jsonb,
  note        text check (char_length(note) <= 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3. updated_at automatisch bijwerken bij elke wijziging
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists places_set_updated_at on public.places;
create trigger places_set_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

-- 4. Beveiliging: iedereen mag lezen, schrijven kan alleen via de server
--    (de website gebruikt daarvoor de geheime sleutel, nooit in de browser).
alter table public.places enable row level security;

drop policy if exists "Iedereen mag plekken lezen" on public.places;
create policy "Iedereen mag plekken lezen"
  on public.places for select
  to anon, authenticated
  using (true);

-- 5. Gegevens uit de oude tabel overnemen (als die er was)
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'places_oud')
     and not exists (select 1 from public.places)
  then
    insert into public.places (name, type, address, city, lat, lng, amenities, note)
    select
      r->>'name',
      case when r->>'type' in ('restaurant','bar','cafe') then r->>'type' else 'restaurant' end,
      coalesce(r->>'address', ''),
      coalesce(nullif(r->>'city', ''), 'Antwerpen'),
      (r->>'lat')::double precision,
      (r->>'lng')::double precision,
      coalesce(r->'amenities',
        '{"changingTable":null,"highChairs":null,"playCorner":null,"kidsMenu":null}'::jsonb),
      nullif(r->>'note', '')
    from public.places_oud t, lateral to_jsonb(t) as r
    where r->>'name' is not null and r->>'lat' is not null and r->>'lng' is not null;
  end if;
end $$;

-- 6. De echte plekken uit de eerste versie (data/places.json) toevoegen,
--    als ze er nog niet in staan.
insert into public.places (name, type, address, city, lat, lng, amenities)
select v.name, v.type, v.address, v.city, v.lat, v.lng, v.amenities::jsonb
from (values
  ('Bar Bruk', 'cafe', 'Karel De Preterlei 222, 2140 Antwerpen', 'Antwerpen',
   51.20023593490327, 4.449836799220926,
   '{"changingTable":false,"highChairs":true,"playCorner":false,"kidsMenu":false}'),
  ('Bobette', 'cafe', 'De Leescorfstraat 2, 2140 Borgerhout', 'Antwerpen',
   51.20059376667489, 4.447587461649962,
   '{"changingTable":false,"highChairs":false,"playCorner":false,"kidsMenu":false}'),
  ('Aan het Strand Van Oostende', 'restaurant', 'Antwerpen', 'Antwerpen',
   51.20758909004148, 4.430004025407014,
   '{"changingTable":null,"highChairs":true,"playCorner":false,"kidsMenu":true}')
) as v(name, type, address, city, lat, lng, amenities)
where not exists (select 1 from public.places p where lower(p.name) = lower(v.name));
