-- RotaSmart 2.2 — separa o status administrativo da execução informada pelo técnico.
-- Execute no SQL Editor depois das migrações 2.2. Seguro para executar novamente.

update public.tickets
set technician_status=case
  when technician_status in ('concluido','atendimento_finalizado') then 'atendido'
  when technician_status in ('em_atendimento','atendido','pendente','nao_iniciado') then technician_status
  else 'nao_iniciado'
end;

alter table public.tickets alter column technician_status set default 'nao_iniciado';

do $$ declare constraint_name text; begin
  for constraint_name in
    select conname from pg_constraint
    where conrelid='public.tickets'::regclass
      and contype='c'
      and pg_get_constraintdef(oid) ilike '%technician_status%'
  loop
    execute format('alter table public.tickets drop constraint %I',constraint_name);
  end loop;
end $$;

alter table public.tickets add constraint tickets_technician_status_check
check(technician_status in ('nao_iniciado','em_atendimento','atendido','pendente'));

create or replace function public.technician_update_ticket(p_ticket_id uuid,p_action text,p_notes text default null,p_reason text default null)
returns public.tickets language plpgsql security definer set search_path=public as $$
declare result public.tickets%rowtype; allowed boolean;
begin
  select exists(select 1 from public.tickets t where t.id=p_ticket_id and (public.current_app_role()='admin' or t.technician_id=public.current_technician_id())) into allowed;
  if not allowed then raise exception 'Chamado não autorizado.';end if;
  if p_action='start' then
    update public.tickets set service_started_at=coalesce(service_started_at,now()),technician_status='em_atendimento',technician_notes=coalesce(p_notes,technician_notes),updated_by=auth.uid() where id=p_ticket_id returning * into result;
  elsif p_action='finish' then
    select * into result from public.tickets where id=p_ticket_id;
    if result.service_started_at is null then raise exception 'Inicie o atendimento antes de finalizar.';end if;
    update public.tickets set service_finished_at=now(),technician_status=case when technician_status='pendente' then 'pendente' else 'em_atendimento' end,technician_notes=coalesce(p_notes,technician_notes),updated_by=auth.uid() where id=p_ticket_id returning * into result;
  elsif p_action='complete' then
    select * into result from public.tickets where id=p_ticket_id;
    if result.service_started_at is null then raise exception 'Inicie o atendimento antes de marcar como atendido.';end if;
    update public.tickets set service_finished_at=coalesce(service_finished_at,now()),technician_status='atendido',completed_by_technician_at=now(),technician_pending_reason=null,technician_notes=coalesce(p_notes,technician_notes),updated_by=auth.uid() where id=p_ticket_id returning * into result;
  elsif p_action='pending' then
    if coalesce(trim(p_reason),'')='' then raise exception 'Motivo da pendência obrigatório.';end if;
    if coalesce(trim(p_notes),'')='' then raise exception 'Observação obrigatória para pendenciar.';end if;
    update public.tickets set technician_status='pendente',technician_notes=p_notes,technician_pending_reason=p_reason,updated_by=auth.uid() where id=p_ticket_id returning * into result;
  elsif p_action='notes' then
    update public.tickets set technician_notes=p_notes,updated_by=auth.uid() where id=p_ticket_id returning * into result;
  else raise exception 'Ação de chamado inválida.';end if;
  return result;
end $$;

grant execute on function public.technician_update_ticket(uuid,text,text,text) to authenticated;
notify pgrst,'reload schema';
