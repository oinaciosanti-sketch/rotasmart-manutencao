-- RotaSmart 2.2 — execute depois de policies_v2_1.sql.
-- Migração incremental: nenhuma tabela ou dado existente é removido.
alter table public.profiles add column if not exists technician_id uuid references public.technicians(id) on delete set null;
alter table public.routes add column if not exists route_started_at timestamptz;
alter table public.routes add column if not exists route_finished_at timestamptz;
alter table public.routes add column if not exists route_start_odometer numeric;
alter table public.routes add column if not exists route_end_odometer numeric;
alter table public.routes add column if not exists route_actual_km numeric;
alter table public.routes add column if not exists execution_status text;
alter table public.tickets add column if not exists service_started_at timestamptz;
alter table public.tickets add column if not exists service_finished_at timestamptz;
alter table public.tickets add column if not exists technician_status text default 'nao_iniciado';
alter table public.tickets add column if not exists technician_notes text;
alter table public.tickets add column if not exists technician_pending_reason text;
alter table public.tickets add column if not exists completed_by_technician_at timestamptz;

do $$ declare constraint_name text; begin
  for constraint_name in select conname from pg_constraint where conrelid='public.profiles'::regclass and contype='c' and pg_get_constraintdef(oid) ilike '%role%' loop
    execute format('alter table public.profiles drop constraint %I',constraint_name);
  end loop;
  for constraint_name in select conname from pg_constraint where conrelid='public.profiles'::regclass and contype='c' and pg_get_constraintdef(oid) ilike '%status%' loop
    execute format('alter table public.profiles drop constraint %I',constraint_name);
  end loop;
end $$;
alter table public.profiles add constraint profiles_role_v2_2_check check(role in ('admin','analista','tecnico','visualizador'));
alter table public.profiles add constraint profiles_status_v2_2_check check(status in ('pendente','ativo','inativo','bloqueado'));
create index if not exists profiles_technician_idx on public.profiles(technician_id) where technician_id is not null;

create or replace function public.current_technician_id()
returns uuid language sql stable security definer set search_path=public
as $$ select technician_id from public.profiles where user_id=(select auth.uid()) and role='tecnico' and status='ativo' and ativo=true limit 1 $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
declare pending_profile public.profiles%rowtype; assigned_role text; assigned_status text;
begin
  select * into pending_profile from public.profiles where lower(email)=lower(coalesce(new.email,'')) and user_id is null order by created_at limit 1 for update;
  if found then
    update public.profiles set user_id=new.id,last_sign_in_at=now(),updated_at=now(),updated_by=new.id where id=pending_profile.id;
  else
    if exists(select 1 from public.profiles where user_id is not null) then assigned_role:='visualizador';assigned_status:='pendente'; else assigned_role:='admin';assigned_status:='ativo'; end if;
    insert into public.profiles(id,user_id,nome,email,role,status,ativo,created_by,updated_by,last_sign_in_at)
    values(gen_random_uuid(),new.id,coalesce(new.raw_user_meta_data->>'nome',split_part(new.email,'@',1)),coalesce(new.email,''),assigned_role,assigned_status,assigned_status='ativo',new.id,new.id,now());
  end if;
  return new;
end $$;

create or replace function public.claim_my_pending_profile()
returns public.profiles language plpgsql security definer set search_path=public
as $$
declare result public.profiles%rowtype; auth_email text:=coalesce(auth.jwt()->>'email','');
begin
  select * into result from public.profiles where user_id=auth.uid() limit 1;
  if found then update public.profiles set last_sign_in_at=now() where id=result.id returning * into result;return result;end if;
  update public.profiles set user_id=auth.uid(),last_sign_in_at=now(),updated_at=now(),updated_by=auth.uid()
  where id=(select id from public.profiles where lower(email)=lower(auth_email) and (user_id is null or user_id<>auth.uid()) order by created_at limit 1) returning * into result;
  if found then return result;end if;
  if not exists(select 1 from public.profiles where user_id is not null) then
    insert into public.profiles(user_id,nome,email,role,status,ativo,created_by,updated_by,last_sign_in_at) values(auth.uid(),split_part(auth_email,'@',1),auth_email,'admin','ativo',true,auth.uid(),auth.uid(),now()) returning * into result;
  else
    insert into public.profiles(user_id,nome,email,role,status,ativo,created_by,updated_by,last_sign_in_at) values(auth.uid(),split_part(auth_email,'@',1),auth_email,'visualizador','pendente',false,auth.uid(),auth.uid(),now()) returning * into result;
  end if;
  return result;
end $$;

create or replace function public.protect_last_active_admin()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if old.role='admin' and old.status='ativo' and old.ativo=true and (tg_op='DELETE' or new.role<>'admin' or new.status<>'ativo' or new.ativo=false) then
    if (select count(*) from public.profiles where role='admin' and status='ativo' and ativo=true)<=1 then raise exception 'Não é possível remover ou rebaixar o último administrador ativo do sistema.';end if;
  end if;
  if tg_op='DELETE' then return old;end if;return new;
end $$;
drop trigger if exists profiles_protect_last_admin on public.profiles;
create trigger profiles_protect_last_admin before update or delete on public.profiles for each row execute function public.protect_last_active_admin();

create or replace function public.technician_update_route(p_route_id uuid,p_action text,p_odometer numeric)
returns public.routes language plpgsql security definer set search_path=public as $$
declare result public.routes%rowtype; allowed boolean;
begin
  select exists(select 1 from public.routes r where r.id=p_route_id and (public.current_app_role()='admin' or r.technician_id=public.current_technician_id())) into allowed;
  if not allowed then raise exception 'Rota não autorizada.';end if;
  if p_action='start' then if p_odometer is null or p_odometer<0 then raise exception 'Informe um KM inicial válido.';end if;update public.routes set route_started_at=coalesce(route_started_at,now()),route_start_odometer=p_odometer,execution_status='em_andamento',status='em_andamento',updated_by=auth.uid() where id=p_route_id returning * into result;
  elsif p_action='finish' then select * into result from public.routes where id=p_route_id;if result.route_start_odometer is null or p_odometer<result.route_start_odometer then raise exception 'KM final deve ser maior ou igual ao KM inicial.';end if;update public.routes set route_finished_at=now(),route_end_odometer=p_odometer,route_actual_km=p_odometer-route_start_odometer,execution_status='concluida',status='concluida',updated_by=auth.uid() where id=p_route_id returning * into result;
  else raise exception 'Ação de rota inválida.';end if;return result;
end $$;

create or replace function public.technician_update_ticket(p_ticket_id uuid,p_action text,p_notes text default null,p_reason text default null)
returns public.tickets language plpgsql security definer set search_path=public as $$
declare result public.tickets%rowtype; allowed boolean;
begin
  select exists(select 1 from public.tickets t where t.id=p_ticket_id and (public.current_app_role()='admin' or t.technician_id=public.current_technician_id())) into allowed;
  if not allowed then raise exception 'Chamado não autorizado.';end if;
  if p_action='start' then update public.tickets set service_started_at=coalesce(service_started_at,now()),technician_status='em_atendimento',technician_notes=coalesce(p_notes,technician_notes),updated_by=auth.uid() where id=p_ticket_id returning * into result;
  elsif p_action='finish' then select * into result from public.tickets where id=p_ticket_id;if result.service_started_at is null then raise exception 'Inicie o atendimento antes de finalizar.';end if;update public.tickets set service_finished_at=now(),technician_status=case when technician_status='pendente' then 'pendente' else 'em_atendimento' end,technician_notes=coalesce(p_notes,technician_notes),updated_by=auth.uid() where id=p_ticket_id returning * into result;
  elsif p_action='complete' then select * into result from public.tickets where id=p_ticket_id;if result.service_started_at is null then raise exception 'Inicie o atendimento antes de marcar como atendido.';end if;update public.tickets set service_finished_at=coalesce(service_finished_at,now()),technician_status='atendido',completed_by_technician_at=now(),technician_pending_reason=null,technician_notes=coalesce(p_notes,technician_notes),updated_by=auth.uid() where id=p_ticket_id returning * into result;
  elsif p_action='pending' then if coalesce(trim(p_reason),'')='' then raise exception 'Motivo da pendência obrigatório.';end if;if coalesce(trim(p_notes),'')='' then raise exception 'Observação obrigatória para pendenciar.';end if;update public.tickets set technician_status='pendente',technician_notes=p_notes,technician_pending_reason=p_reason,updated_by=auth.uid() where id=p_ticket_id returning * into result;
  elsif p_action='notes' then update public.tickets set technician_notes=p_notes,updated_by=auth.uid() where id=p_ticket_id returning * into result;
  else raise exception 'Ação de chamado inválida.';end if;return result;
end $$;
grant execute on function public.technician_update_route(uuid,text,numeric) to authenticated;
grant execute on function public.technician_update_ticket(uuid,text,text,text) to authenticated;
