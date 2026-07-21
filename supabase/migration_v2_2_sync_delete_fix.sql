-- RotaSmart 2.2 - Supabase como fonte da verdade e exclusão lógica auditável.
-- Execute uma vez no SQL Editor antes de publicar o código desta versão.

begin;

alter table if exists public.tickets
  add column if not exists active boolean not null default true,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id) on delete set null;

update public.tickets
set active = true
where active is null;

-- Elimina somente referências sem chamado ou incompatíveis com a rota atual.
delete from public.route_stops rs
where not exists (
  select 1 from public.tickets t where t.id = rs.ticket_id
);

delete from public.route_stops rs
using public.tickets t
where t.id = rs.ticket_id
  and (
    t.active = false
    or t.deleted_at is not null
    or t.route_id is null
    or t.route_id <> rs.route_id
    or t.planning_status = 'nao_planejado'
  );

-- Chamados sem uma parada válida deixam de ser considerados planejados.
update public.tickets t
set technician_id = null,
    planned_date = null,
    route_id = null,
    route_order = null,
    planning_status = 'nao_planejado',
    updated_at = now()
where t.active = true
  and t.deleted_at is null
  and t.route_id is not null
  and not exists (
    select 1 from public.route_stops rs
    where rs.ticket_id = t.id
      and rs.route_id = t.route_id
  );

create index if not exists tickets_active_deleted_idx
  on public.tickets(active, deleted_at);

create index if not exists route_stops_ticket_id_idx
  on public.route_stops(ticket_id);

-- Mantém proteção também para eventuais exclusões físicas administrativas futuras.
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
    execute format('alter table public.route_stops drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.route_stops
  add constraint route_stops_ticket_id_fkey
  foreign key (ticket_id)
  references public.tickets(id)
  on delete cascade;

commit;

notify pgrst, 'reload schema';
