# Beta 3.2 — Integridade da carteira
1. Execute o SQL Beta3.2 no Supabase de teste. Ele substitui somente a função field_dispatch; não altera jornadas antigas.
2. Envie os quatro arquivos app à branch v9-online. Não use main.
3. Na Execução em campo, procure Integridade da carteira. Recupere individualmente os vínculos e chamados ausentes, revise e publique. Status Novo, urgência Média e duração 60 min são provisórios quando o chamado não existe. Não são dados oficiais. Se o técnico não existir na carteira, cadastre-o antes. Não recupera dados ausentes da jornada.
4. Teste recarregar a mesma aba com alterações não publicadas. Rascunho em sessionStorage não é backup permanente; exporte antes de fechar a aba. Se a revisão online mudou, exporte o rascunho e revise manualmente antes de continuar.
5. Teste envio de jornada com alterações pendentes (bloqueado) e após publicação. SQL verifica os dados publicados e a correspondência dos chamados. Não reenvie a jornada existente.
6. Dados fictícios somente. Build e SQL não executados nesta preparação; valide no ambiente beta.
