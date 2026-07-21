-- RotaSmart 2.1 — execute no SQL Editor depois de schema.sql/policies.sql.
-- Preserva perfis existentes e permite perfis pendentes antes da criação no Auth.
create extension if not exists pgcrypto;

alter table public.profiles add column if not exists user_id uuid;
alter table public.profiles add column if not exists status text not null default 'ativo';
alter table public.profiles add column if not exists notes text;
alter table public.profiles add column if not exists last_sign_in_at timestamptz;
alter table public.profiles add column if not exists created_by uuid;
alter table public.profiles add column if not exists updated_by uuid;
alter table public.analysts add column if not exists created_by uuid;
alter table public.analysts add column if not exists updated_by uuid;
alter table public.technicians add column if not exists created_by uuid;
alter table public.technicians add column if not exists updated_by uuid;
alter table public.branches add column if not exists created_by uuid;
alter table public.branches add column if not exists updated_by uuid;

update public.profiles p set user_id=p.id
where p.user_id is null and exists(select 1 from auth.users u where u.id=p.id);
update public.profiles set status=case when ativo then 'ativo' else 'inativo' end
where status is null or status not in ('ativo','pendente','inativo');

do $$ begin
  if exists(select 1 from pg_constraint where conname='profiles_id_fkey') then
    alter table public.profiles drop constraint profiles_id_fkey;
  end if;
end $$;
alter table public.profiles alter column id set default gen_random_uuid();

do $$ begin
  if not exists(select 1 from pg_constraint where conname='profiles_user_id_fkey') then
    alter table public.profiles add constraint profiles_user_id_fkey foreign key(user_id) references auth.users(id) on delete set null;
  end if;
  if not exists(select 1 from pg_constraint where conname='profiles_status_check') then
    alter table public.profiles add constraint profiles_status_check check(status in ('ativo','pendente','inativo'));
  end if;
end $$;
create unique index if not exists profiles_user_id_unique on public.profiles(user_id) where user_id is not null;
create unique index if not exists profiles_email_unique on public.profiles(lower(email));

create or replace function public.current_app_role()
returns text language sql stable security definer set search_path=public
as $$ select role from public.profiles where user_id=(select auth.uid()) and ativo=true and status='ativo' limit 1 $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
declare pending_profile public.profiles%rowtype;
declare assigned_role text;
begin
  select * into pending_profile from public.profiles
  where lower(email)=lower(coalesce(new.email,'')) and user_id is null
  order by created_at limit 1 for update;
  if found then
    update public.profiles set user_id=new.id,status='ativo',ativo=true,
      nome=coalesce(nullif(nome,''),new.raw_user_meta_data->>'nome',split_part(new.email,'@',1)),
      last_sign_in_at=now(),updated_at=now(),updated_by=new.id
    where id=pending_profile.id;
  else
    select case when exists(select 1 from public.profiles where user_id is not null) then 'visualizador' else 'admin' end into assigned_role;
    insert into public.profiles(id,user_id,nome,email,role,status,ativo,created_by,updated_by,last_sign_in_at)
    values(gen_random_uuid(),new.id,coalesce(new.raw_user_meta_data->>'nome',split_part(new.email,'@',1)),coalesce(new.email,''),assigned_role,'ativo',true,new.id,new.id,now())
    on conflict(user_id) do update set last_sign_in_at=now(),updated_at=now();
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.claim_my_pending_profile()
returns public.profiles language plpgsql security definer set search_path=public
as $$
declare result public.profiles%rowtype;
declare auth_email text:=coalesce(auth.jwt()->>'email','');
begin
  select * into result from public.profiles where user_id=auth.uid() limit 1;
  if found then
    update public.profiles set last_sign_in_at=now() where id=result.id returning * into result;
    return result;
  end if;
  update public.profiles set user_id=auth.uid(),status='ativo',ativo=true,last_sign_in_at=now(),updated_at=now(),updated_by=auth.uid()
  where id=(select id from public.profiles where lower(email)=lower(auth_email) and user_id is null order by created_at limit 1)
  returning * into result;
  if found then return result; end if;
  insert into public.profiles(user_id,nome,email,role,status,ativo,created_by,updated_by,last_sign_in_at)
  values(auth.uid(),split_part(auth_email,'@',1),auth_email,'visualizador','ativo',true,auth.uid(),auth.uid(),now()) returning * into result;
  return result;
end;
$$;
grant execute on function public.claim_my_pending_profile() to authenticated;

alter table public.profiles enable row level security;
drop policy if exists "authenticated read profiles" on public.profiles;
drop policy if exists "admin updates profiles" on public.profiles;
drop policy if exists "admin manages profiles" on public.profiles;
drop policy if exists "self reads profile" on public.profiles;
create policy "self reads profile" on public.profiles for select to authenticated using(user_id=(select auth.uid()));
create policy "admin manages profiles" on public.profiles for all to authenticated
using((select public.current_app_role())='admin') with check((select public.current_app_role())='admin');

drop policy if exists "authenticated read analysts" on public.analysts;
drop policy if exists "authenticated read technicians" on public.technicians;
drop policy if exists "authenticated read branches" on public.branches;
drop policy if exists "authenticated read tickets" on public.tickets;
drop policy if exists "authenticated read routes" on public.routes;
drop policy if exists "authenticated read route stops" on public.route_stops;
drop policy if exists "authenticated read settings" on public.app_settings;
drop policy if exists "active users read analysts" on public.analysts;
drop policy if exists "active users read technicians" on public.technicians;
drop policy if exists "active users read branches" on public.branches;
drop policy if exists "active users read tickets" on public.tickets;
drop policy if exists "active users read routes" on public.routes;
drop policy if exists "active users read route stops" on public.route_stops;
drop policy if exists "active users read settings" on public.app_settings;
create policy "active users read analysts" on public.analysts for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active users read technicians" on public.technicians for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active users read branches" on public.branches for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active users read tickets" on public.tickets for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active users read routes" on public.routes for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active users read route stops" on public.route_stops for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));
create policy "active users read settings" on public.app_settings for select to authenticated using((select public.current_app_role()) in ('admin','analista','visualizador'));

grant select,insert,update,delete on public.profiles to authenticated;
-- As políticas de escrita do 2.0 permanecem: admin gerencia cadastros;
-- admin/analista gerenciam chamados, rotas e paradas; visualizador somente lê.
