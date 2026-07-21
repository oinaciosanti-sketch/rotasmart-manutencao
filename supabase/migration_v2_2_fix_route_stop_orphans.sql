-- RotaSmart 2.2 - limpeza de vínculos antigos e proteção contra route_stops órfãos.
-- Seguro para executar novamente. Não exclui chamados válidos.

begin;

-- Remove somente paradas cujo chamado já não existe.
delete from public.route_stops rs
where not exists (
  select 1 from public.tickets t where t.id = rs.ticket_id
);

-- Remove paradas que já não correspondem à rota atualmente vinculada ao chamado.
delete from public.route_stops rs
using public.tickets t
where t.id = rs.ticket_id
  and (
    t.route_id is null
    or t.route_id <> rs.route_id
    or t.planning_status = 'nao_planejado'
  );

-- Um chamado marcado como planejado sem parada válida volta para disponíveis.
update public.tickets t
set technician_id = null,
    planned_date = null,
    route_id = null,
    route_order = null,
    planning_status = 'nao_planejado',
    updated_at = now()
where t.route_id is not null
  and not exists (
    select 1
    from public.route_stops rs
    where rs.ticket_id = t.id
      and rs.route_id = t.route_id
  );

-- Substitui qualquer FK antiga de ticket_id por uma FK com exclusão em cascata.
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_attribute att
      on att.attrelid = con.conrelid
     and att.attnum = any(con.conkey)
    where con.conrelid = 'public.route_stops'::regclass
      and con.contype = 'f'
      and att.attname = 'ticket_id'
  loop
    execute format(
      'alter table public.route_stops drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

alter table public.route_stops
  add constraint route_stops_ticket_id_fkey
  foreign key (ticket_id)
  references public.tickets(id)
  on delete cascade;

create index if not exists route_stops_ticket_id_idx
  on public.route_stops(ticket_id);

commit;

notify pgrst, 'reload schema';
