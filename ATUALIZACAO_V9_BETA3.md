# RotaSmart V9.0 Beta 3 — Execução em campo (piloto)

1. Preserve a V8.13 e exporte qualquer rascunho Beta 2.1. Use exclusivamente dados fictícios.
2. No Supabase rotasmart-online, execute o arquivo RotaSmart_V9.0_Beta3_Banco.sql fornecido separadamente. O script é transacional, não remove tabelas existentes e deve ser executado uma única vez. Confirme field_journeys e field_jobs com rls=true. Não use o reescritor automático de RLS: o script já ativa RLS na transação.
3. Envie a pasta app deste ZIP à raiz da branch v9-online, nunca main. Aguarde Ready. Variáveis existentes não mudam.
4. Em Authentication > Users, crie uma conta exclusiva de teste, sem compartilhar a senha administrativa. Mantenha signup público desativado. Autorize a conta com o SQL abaixo, trocando o e-mail pelo e-mail exato da conta criada. Não autorize a conta do administrador. O nome do perfil deve coincidir com o nome de um técnico cadastrado no Planner.

```sql
INSERT INTO public.profiles(user_id,nome,email,role,status,ativo)
SELECT id,'Tecnico Teste',email,'tecnico','ativo',true FROM auth.users
WHERE email='SUBSTITUIR_EMAIL_DE_TESTE' AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id=auth.users.id);
SELECT nome,role,status,ativo FROM public.profiles WHERE email='SUBSTITUIR_EMAIL_DE_TESTE';
```

5. No PC, como administrador, cadastre Tecnico Teste, filial e dois chamados fictícios. Atribua técnico e data no Planner. Publique a carteira. Abra Execução em campo, selecione conta, técnico e data, marque os chamados e envie a jornada. A ordem segue routeOrder quando presente.
6. No celular, em sessão separada, entre com a conta técnica. Confirme KM inicial, inicie, descreva, marque atendido ou pendente; repita e confirme KM final. No PC, acompanhe a página Execução em campo sem recarregar. Consultas a cada 3 segundos.
7. Teste acesso cruzado com outra conta técnica sem jornada, e confirme que ela não lê a carteira ou jornadas alheias. Teste KM negativo, final inferior ao inicial, início concorrente, conclusão sem relatório. Nenhum dado real até validação de segurança e autorização.

Limitações: uma jornada por técnico/dia, sem edição ou cancelamento após envio; portal e acompanhamento consultam as últimas 100 jornadas; status técnico separado do Movidesk e não refletido automaticamente no Kanban/Planner/mapa. A carteira administrativa continua com publicação manual. Estoque local, sem push, GPS, offline ou migração de dados. SQL não executado em PostgreSQL neste ambiente; sintaxe TS conferida por transpileModule, não substitui build/typecheck completo nem teste RLS real. Não faça merge com main.
