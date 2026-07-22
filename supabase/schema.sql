-- RotaSmart 2.0 - schema inicial para Supabase/PostgreSQL
create extension if not exists pgcrypto;

create table if not exists public.analysts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  department text,
  initials text,
  color text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  color text,
  active boolean not null default true,
  start_latitude numeric,
  start_longitude numeric,
  start_address text,
  start_city text,
  start_uf text,
  start_time time,
  end_time time,
  initials text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  branch_number text,
  name text not null,
  cnpj text,
  address text,
  neighborhood text,
  city text,
  uf text,
  cep text,
  phone text,
  state_registration text,
  latitude numeric,
  longitude numeric,
  active boolean not null default true,
  geocode_status text,
  data_status text,
  source text,
  map_link text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  role text not null default 'analista' check (role in ('admin','analista','visualizador')),
  analyst_id uuid references public.analysts(id) on delete set null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  technician_id uuid references public.technicians(id) on delete restrict,
  route_date date not null,
  status text not null default 'rascunho',
  start_type text,
  start_description text,
  start_address text,
  start_city text,
  start_uf text,
  start_latitude numeric,
  start_longitude numeric,
  total_distance_km numeric,
  estimated_minutes integer,
  road_distance_km numeric,
  road_duration_minutes integer,
  route_geometry jsonb,
  route_source text check (route_source is null or route_source in ('tomtom','openrouteservice','graphhopper','osrm','google','haversine')),
  route_calculated_at timestamptz,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (technician_id, route_date)
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  branch_id uuid references public.branches(id) on delete set null,
  analyst_id uuid references public.analysts(id) on delete set null,
  technician_id uuid references public.technicians(id) on delete set null,
  branch_name text,
  city text,
  uf text,
  address text,
  latitude numeric,
  longitude numeric,
  description text not null,
  status text not null,
  urgency text not null,
  planned_date date,
  estimated_minutes integer,
  opened_at timestamptz,
  deadline_at timestamptz,
  notes text,
  planning_status text not null default 'nao_planejado',
  route_id uuid references public.routes(id) on delete set null,
  route_order integer,
  active boolean not null default true,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  stop_order integer not null,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (route_id, ticket_id)
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists analysts_name_unique on public.analysts (lower(name));
create unique index if not exists technicians_name_unique on public.technicians (lower(name));
create unique index if not exists branches_cnpj_unique on public.branches (regexp_replace(cnpj, '\\D', '', 'g')) where cnpj is not null and cnpj <> '';
create unique index if not exists branches_number_unique on public.branches (branch_number) where branch_number is not null and branch_number <> '';
create index if not exists tickets_planning_idx on public.tickets (planned_date, technician_id, planning_status);
create index if not exists route_stops_route_order_idx on public.route_stops (route_id, stop_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists analysts_updated_at on public.analysts;
create trigger analysts_updated_at before update on public.analysts for each row execute function public.set_updated_at();
drop trigger if exists technicians_updated_at on public.technicians;
create trigger technicians_updated_at before update on public.technicians for each row execute function public.set_updated_at();
drop trigger if exists branches_updated_at on public.branches;
create trigger branches_updated_at before update on public.branches for each row execute function public.set_updated_at();
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists tickets_updated_at on public.tickets;
create trigger tickets_updated_at before update on public.tickets for each row execute function public.set_updated_at();
drop trigger if exists routes_updated_at on public.routes;
create trigger routes_updated_at before update on public.routes for each row execute function public.set_updated_at();
drop trigger if exists route_stops_updated_at on public.route_stops;
create trigger route_stops_updated_at before update on public.route_stops for each row execute function public.set_updated_at();
drop trigger if exists app_settings_updated_at on public.app_settings;
create trigger app_settings_updated_at before update on public.app_settings for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare first_role text;
begin
  select case when exists(select 1 from public.profiles) then 'analista' else 'admin' end into first_role;
  insert into public.profiles (id, nome, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)), coalesce(new.email, ''), first_role)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
