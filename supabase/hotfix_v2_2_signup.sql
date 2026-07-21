-- RotaSmart 2.2 — corrige "Database error saving new user" no cadastro.
-- Seguro para executar mais de uma vez. Não remove usuários nem profiles.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
declare pending_profile public.profiles%rowtype; assigned_role text; assigned_status text;
begin
  -- Primeiro tenta vincular um profile preparado pelo administrador.
  select * into pending_profile
  from public.profiles
  where lower(trim(email))=lower(trim(coalesce(new.email,''))) and user_id is null
  order by created_at limit 1 for update;

  if found then
    update public.profiles
    set user_id=new.id,last_sign_in_at=now(),updated_at=now(),updated_by=new.id
    where id=pending_profile.id;
  else
    -- Somente o primeiro usuário pode nascer admin. Os demais ficam pendentes.
    if exists(select 1 from public.profiles where user_id is not null) then
      assigned_role:='visualizador';assigned_status:='pendente';
    else
      assigned_role:='admin';assigned_status:='ativo';
    end if;

    -- Não usar ON CONFLICT(user_id): o índice existente é parcial e não pode
    -- ser inferido pelo PostgreSQL sem uma cláusula WHERE correspondente.
    if not exists(select 1 from public.profiles where user_id=new.id) then
      insert into public.profiles(id,user_id,nome,email,role,status,ativo,created_by,updated_by,last_sign_in_at)
      values(gen_random_uuid(),new.id,coalesce(new.raw_user_meta_data->>'nome',split_part(new.email,'@',1)),coalesce(new.email,''),assigned_role,assigned_status,assigned_status='ativo',new.id,new.id,now());
    end if;
  end if;
  return new;
exception when others then
  raise log 'RotaSmart handle_new_user falhou para %: %',coalesce(new.email,'sem email'),sqlerrm;
  raise;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
notify pgrst,'reload schema';

-- Diagnóstico: o resultado deve mostrar a função e o trigger ativos.
select trigger_name,event_manipulation,event_object_table,action_statement
from information_schema.triggers
where trigger_name='on_auth_user_created';
