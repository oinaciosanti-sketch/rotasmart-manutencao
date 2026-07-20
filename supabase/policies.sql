-- Execute depois de schema.sql. Todas as tabelas expostas usam RLS.
alter table public.profiles enable row level security;
alter table public.analysts enable row level security;
alter table public.technicians enable row level security;
alter table public.branches enable row level security;
alter table public.tickets enable row level security;
alter table public.routes enable row level security;
alter table public.route_stops enable row level security;
alter table public.app_settings enable row level security;

create or replace function public.current_app_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = (select auth.uid()) and ativo = true $$;

grant execute on function public.current_app_role() to authenticated;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on public.analysts, public.technicians, public.branches, public.tickets, public.routes, public.route_stops, public.app_settings to authenticated;
grant update on public.profiles to authenticated;

create policy "authenticated read profiles" on public.profiles for select to authenticated using (true);
create policy "admin updates profiles" on public.profiles for update to authenticated using ((select public.current_app_role()) = 'admin') with check ((select public.current_app_role()) = 'admin');

create policy "authenticated read analysts" on public.analysts for select to authenticated using (true);
create policy "authenticated read technicians" on public.technicians for select to authenticated using (true);
create policy "authenticated read branches" on public.branches for select to authenticated using (true);
create policy "authenticated read tickets" on public.tickets for select to authenticated using (true);
create policy "authenticated read routes" on public.routes for select to authenticated using (true);
create policy "authenticated read route stops" on public.route_stops for select to authenticated using (true);
create policy "authenticated read settings" on public.app_settings for select to authenticated using (true);

create policy "admin manages analysts" on public.analysts for all to authenticated using ((select public.current_app_role()) = 'admin') with check ((select public.current_app_role()) = 'admin');
create policy "admin manages technicians" on public.technicians for all to authenticated using ((select public.current_app_role()) = 'admin') with check ((select public.current_app_role()) = 'admin');
create policy "admin manages branches" on public.branches for all to authenticated using ((select public.current_app_role()) = 'admin') with check ((select public.current_app_role()) = 'admin');
create policy "admin manages settings" on public.app_settings for all to authenticated using ((select public.current_app_role()) = 'admin') with check ((select public.current_app_role()) = 'admin');

create policy "staff manages tickets" on public.tickets for all to authenticated using ((select public.current_app_role()) in ('admin','analista')) with check ((select public.current_app_role()) in ('admin','analista'));
create policy "staff manages routes" on public.routes for all to authenticated using ((select public.current_app_role()) in ('admin','analista')) with check ((select public.current_app_role()) in ('admin','analista'));
create policy "staff manages route stops" on public.route_stops for all to authenticated using ((select public.current_app_role()) in ('admin','analista')) with check ((select public.current_app_role()) in ('admin','analista'));

-- A service_role nunca deve ser usada no navegador. Ela ignora RLS e fica apenas no backend do Supabase.
