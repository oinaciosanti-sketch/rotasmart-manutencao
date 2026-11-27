# Beta 4.4 — Smart Sync (primeira etapa)
Base: Beta 4.3 com hotfix. Não requer SQL novo. Exporte o rascunho antes de instalar.
- Comparação canônica da carteira, independente da ordem das chaves JSONB; arrays preservam ordem.
- Salvamento automático após 1 segundo sem alterações, mantendo CAS por revisão. Falhas mantêm rascunho e oferecem nova tentativa; conflitos exigem receber versão online explicitamente após exportar.
- Montar rota preserva ordem planejada explícita mesmo na primeira consulta de campo.
- Confirme a rota, aguarde carteira salva na nuvem, depois confirme o envio ao técnico. A RPC existente verifica sequência. Planner e execução exibem a sequência enviada, não o rascunho.
- Estoque permanece local, ambiente de homologação com dados fictícios. Não há fusão automática de conflitos nem recepção automática da carteira administrativa nesta etapa.
- Testar inversão 99995/99996 e verificar no celular, Planner e Execução. Não alterar posições iniciadas/encerradas.
- Verificação local: sintaxe TypeScript via transpileModule e testes unitários da comparação; build completo e integração Supabase/Vercel não executados.
