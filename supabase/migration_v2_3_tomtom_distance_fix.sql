-- RotaSmart 2.3 - persistência atômica de rotas e métricas TomTom.
-- Seguro para executar mais de uma vez no SQL Editor do Supabase.
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

create or replace function public.save_route_plan(
  p_technician_id uuid,
  p_route_date date,
  p_planning_status text,
  p_tickets jsonb,
  p_road_distance_km numeric default null,
  p_road_duration_minutes integer default null,
  p_route_geometry jsonb default null,
  p_route_source text default null,
  p_route_calculated_at timestamptz default null
)
returns public.routes
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_route public.routes;
  v_item jsonb;
  v_ticket_id uuid;
  v_order integer;
begin
  if public.current_app_role() not in ('admin','analista') then
    raise exception using errcode = '42501', message = 'Usuário sem permissão para salvar rotas.';
  end if;

  if p_planning_status not in ('em_rota_rascunho','rota_confirmada') then
    raise exception using errcode = '22023', message = 'Status de planejamento inválido.';
  end if;

  insert into public.routes (
    technician_id, route_date, status, road_distance_km,
    road_duration_minutes, route_geometry, route_source,
    route_calculated_at, created_by, updated_by
  ) values (
    p_technician_id, p_route_date,
    case when p_planning_status = 'rota_confirmada' then 'confirmada' else 'rascunho' end,
    p_road_distance_km, p_road_duration_minutes, p_route_geometry,
    p_route_source, p_route_calculated_at, auth.uid(), auth.uid()
  )
  on conflict (technician_id, route_date) do update set
    status = excluded.status,
    road_distance_km = coalesce(excluded.road_distance_km, routes.road_distance_km),
    road_duration_minutes = coalesce(excluded.road_duration_minutes, routes.road_duration_minutes),
    route_geometry = coalesce(excluded.route_geometry, routes.route_geometry),
    route_source = coalesce(excluded.route_source, routes.route_source),
    route_calculated_at = coalesce(excluded.route_calculated_at, routes.route_calculated_at),
    updated_by = auth.uid(),
    updated_at = now()
  returning * into v_route;

  -- Somente paradas que deixaram esta rota são desplanejadas.
  update public.tickets ticket
  set technician_id = null,
      planned_date = null,
      route_id = null,
      route_order = null,
      planning_status = 'nao_planejado',
      updated_by = auth.uid(),
      updated_at = now()
  where ticket.route_id = v_route.id
    and not exists (
      select 1
      from jsonb_array_elements(coalesce(p_tickets, '[]'::jsonb)) item
      where (item->>'id')::uuid = ticket.id
    );

  delete from public.route_stops stop
  where stop.route_id = v_route.id
    and not exists (
      select 1
      from jsonb_array_elements(coalesce(p_tickets, '[]'::jsonb)) item
      where (item->>'id')::uuid = stop.ticket_id
    );

  for v_item in select value from jsonb_array_elements(coalesce(p_tickets, '[]'::jsonb)) loop
    v_ticket_id := (v_item->>'id')::uuid;
    v_order := greatest(1, coalesce((v_item->>'order')::integer, 1));

    -- Um chamado só pode pertencer a uma rota operacional.
    delete from public.route_stops
    where ticket_id = v_ticket_id and route_id <> v_route.id;

    update public.tickets
    set technician_id = p_technician_id,
        planned_date = p_route_date,
        route_id = v_route.id,
        route_order = v_order,
        planning_status = p_planning_status,
        status = case when p_planning_status = 'rota_confirmada' then 'Programado' else status end,
        updated_by = auth.uid(),
        updated_at = now()
    where id = v_ticket_id
      and coalesce(active, true) = true
      and deleted_at is null;

    if not found then
      raise exception using errcode = 'P0002', message = 'Chamado não encontrado, excluído ou inativo.';
    end if;

    insert into public.route_stops (route_id, ticket_id, stop_order, latitude, longitude)
    values (
      v_route.id, v_ticket_id, v_order,
      nullif(v_item->>'latitude','')::numeric,
      nullif(v_item->>'longitude','')::numeric
    )
    on conflict (route_id, ticket_id) do update set
      stop_order = excluded.stop_order,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      updated_at = now();
  end loop;

  select * into v_route from public.routes where id = v_route.id;
  return v_route;
end;
$$;

grant execute on function public.save_route_plan(uuid,date,text,jsonb,numeric,integer,jsonb,text,timestamptz) to authenticated;

commit;
notify pgrst, 'reload schema';
