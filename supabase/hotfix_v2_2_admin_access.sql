-- RotaSmart 2.2 — recuperação de acesso para perfis existentes.
-- Seguro para executar mais de uma vez. Não cria admin e não apaga dados.

-- Religa cada profile à conta Auth que possui exatamente o mesmo e-mail.
update public.profiles p
set user_id=u.id,updated_at=now(),updated_by=u.id
from auth.users u
where lower(trim(p.email))=lower(trim(u.email))
  and p.user_id is distinct from u.id;

-- Corrige somente administradores que continuam marcados como ativo=true.
-- Perfis realmente inativados/bloqueados têm ativo=false e não são reativados.
update public.profiles
set status='ativo',updated_at=now()
where role='admin' and ativo=true and status is distinct from 'ativo';

-- Atualiza a função de claim para tolerar vínculo antigo divergente pelo mesmo e-mail.
create or replace function public.claim_my_pending_profile()
returns public.profiles language plpgsql security definer set search_path=public
as $$
declare result public.profiles%rowtype; auth_email text:=coalesce(auth.jwt()->>'email','');
begin
  select * into result from public.profiles where user_id=auth.uid() limit 1;
  if found then
    update public.profiles set last_sign_in_at=now() where id=result.id returning * into result;
    return result;
  end if;
  update public.profiles set user_id=auth.uid(),last_sign_in_at=now(),updated_at=now(),updated_by=auth.uid()
  where id=(select id from public.profiles where lower(trim(email))=lower(trim(auth_email)) order by created_at limit 1)
  returning * into result;
  if found then return result;end if;
  if not exists(select 1 from public.profiles where user_id is not null) then
    insert into public.profiles(user_id,nome,email,role,status,ativo,created_by,updated_by,last_sign_in_at)
    values(auth.uid(),split_part(auth_email,'@',1),auth_email,'admin','ativo',true,auth.uid(),auth.uid(),now()) returning * into result;
  else
    insert into public.profiles(user_id,nome,email,role,status,ativo,created_by,updated_by,last_sign_in_at)
    values(auth.uid(),split_part(auth_email,'@',1),auth_email,'visualizador','pendente',false,auth.uid(),auth.uid(),now()) returning * into result;
  end if;
  return result;
end $$;
grant execute on function public.claim_my_pending_profile() to authenticated;

notify pgrst,'reload schema';

-- Resultado esperado para o seu perfil: role=admin, status=ativo, ativo=true e user_id preenchido.
select p.nome,p.email,p.role,p.status,p.ativo,p.user_id,u.id as auth_user_id
from public.profiles p left join auth.users u on lower(trim(u.email))=lower(trim(p.email))
order by p.created_at;
