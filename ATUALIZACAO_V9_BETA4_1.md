# Beta 4.1 — Jornadas e ordenação
1. Exporte o rascunho e publique a carteira de teste. Execute o SQL Beta 4.1 no Supabase antes de atualizar o código.
2. Envie a pasta app para a raiz da branch v9-online. Aguarde Ready e confirme Beta 4.1.
3. Kanban: ordenação independente por abertura, vencimento, urgência ou número. Nenhum status é alterado.
4. Filiais: cadastros provisórios visíveis por padrão; revise número, endereço e coordenadas. Não recupera registros efetivamente ausentes.
5. Execução em campo: selecione técnico e dia, pesquise e adicione chamados, arraste ou use setas, publique a carteira e envie. Novos chamados entram ao final de uma jornada aberta; registros anteriores são preservados. Reordene as paradas não iniciadas na seção de acompanhamento e confirme.
6. Montar rota continua sendo o fluxo de envio inicial. Reenvio acrescenta novos chamados; não substitui a ordem existente. Reordenação da jornada é separada do planejamento. Remoção de chamados já enviados e compartilhamento da rota diária não incluídos. Jornada encerrada não aceita novos chamados. Limite 50 por envio, 100 por jornada.
7. Teste com dados fictícios. SQL e build integral não executados neste ambiente; sintaxe TypeScript conferida por transpileModule. Publicação manual mantida.
