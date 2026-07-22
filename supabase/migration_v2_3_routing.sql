-- RotaSmart 2.3 — dados opcionais de roteamento por ruas.
-- Pode ser executada mais de uma vez no SQL Editor do Supabase.
begin;

alter table if exists public.routes
  add column if not exists road_distance_km numeric,
  add column if not exists road_duration_minutes integer,
  add column if not exists route_geometry jsonb,
  add column if not exists route_source text,
  add column if not exists route_calculated_at timestamptz;

alter table if exists public.routes
  drop constraint if exists routes_route_source_check;

alter table if exists public.routes
  add constraint routes_route_source_check
  check (route_source is null or route_source in ('tomtom','openrouteservice','graphhopper','osrm','google','haversine'));

commit;
notify pgrst, 'reload schema';
