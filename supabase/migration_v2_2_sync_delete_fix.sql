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

-- Exclusão lógica atômica. A função executa as duas alterações na mesma
-- transação e não depende das policies de escrita aplicadas pelo navegador.
create or replace function public.soft_delete_ticket(p_ticket_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_ticket public.tickets;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Usuário não autenticado.';
  end if;

  if public.current_app_role() <> 'admin' then
    raise exception using errcode = '42501', message = 'Somente administradores podem excluir chamados.';
  end if;

  delete from public.route_stops
  where ticket_id = p_ticket_id;

  update public.tickets
  set active = false,
      deleted_at = now(),
      deleted_by = auth.uid(),
      technician_id = null,
      planned_date = null,
      route_id = null,
      route_order = null,
      planning_status = 'nao_planejado',
      updated_by = auth.uid(),
      updated_at = now()
  where id = p_ticket_id
    and active = true
    and deleted_at is null
  returning * into affected_ticket;

  if affected_ticket.id is null then
    raise exception using errcode = 'P0002', message = 'Chamado não encontrado ou já excluído.';
  end if;

  return jsonb_build_object(
    'id', affected_ticket.id,
    'active', affected_ticket.active,
    'deleted_at', affected_ticket.deleted_at
  );
end;
$$;

revoke all on function public.soft_delete_ticket(uuid) from public;
grant execute on function public.soft_delete_ticket(uuid) to authenticated;

commit;

notify pgrst, 'reload schema';
