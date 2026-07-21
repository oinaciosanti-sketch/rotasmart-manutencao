-- RotaSmart 2.2 — execute depois de migration_v2_2.sql.
-- Técnicos leem somente seus registros. Escritas operacionais usam RPCs seguras.
drop policy if exists "active users read analysts" on public.analysts;
drop policy if exists "active users read technicians" on public.technicians;
drop policy if exists "active users read branches" on public.branches;
drop policy if exists "active users read tickets" on public.tickets;
drop policy if exists "active users read routes" on public.routes;
drop policy if exists "active users read route stops" on public.route_stops;
drop policy if exists "active users read settings" on public.app_settings;
drop policy if exists "technician reads own technician" on public.technicians;
drop policy if exists "technician reads own tickets" on public.tickets;
drop policy if exists "technician reads own routes" on public.routes;
drop policy if exists "technician reads own stops" on public.route_stops;

create policy "active office reads analysts" on public.analysts for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active office reads technicians" on public.technicians for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active office reads branches" on public.branches for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active office reads tickets" on public.tickets for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active office reads routes" on public.routes for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active office reads route stops" on public.route_stops for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active office reads settings" on public.app_settings for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "technician reads own technician" on public.technicians for select to authenticated using(id=(select public.current_technician_id()));
create policy "technician reads own tickets" on public.tickets for select to authenticated using(technician_id=(select public.current_technician_id()));
create policy "technician reads own routes" on public.routes for select to authenticated using(technician_id=(select public.current_technician_id()));
create policy "technician reads own stops" on public.route_stops for select to authenticated using(exists(select 1 from public.routes r where r.id=route_id and r.technician_id=(select public.current_technician_id())));

-- Perfis pendentes/inativos continuam vendo somente o próprio profile pela policy 2.1.
-- Nenhuma policy direta de UPDATE é concedida ao técnico; as RPCs validam ownership.
