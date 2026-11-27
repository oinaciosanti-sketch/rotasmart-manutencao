# RotaSmart V9.0 Beta 3.1
Aplicar somente na branch v9-online, na raiz do repositório. Preservar main. Não executar novo SQL: utiliza field_journeys e field_jobs instaladas na Beta 3.

## Mudanças
- Consulta de eventos centralizada a cada 3 segundos no painel administrativo; associação por número, técnico e data, sem gravar estados do técnico na carteira ou alterar o status oficial. Se houver mais de uma correspondência, não associa automaticamente.
- Kanban mostra situação operacional e status da carteira. Planner indica execução, atendimento ou pendência; Dashboard tem contadores operacionais do dia, separados dos oficiais e sujeitos aos filtros.
- Montar rota: após confirmar e publicar a carteira, usar Enviar rota ao técnico. Usa ordem atual e origem, conta técnica única pelo nome. Uma jornada por técnico/dia, sem edição após envio. A publicação da carteira ainda é manual, não é uma transação conjunta com envio.
- Portal do técnico: cabeçalho, largura mobile, data brasileira, progresso, duração e cartões concluídos recolhíveis. Mantém os três botões e regras de servidor da Beta 3.

## Teste
1. Publicar ou exportar rascunho antes do deploy.
2. Conferir Beta 3.1. Usar dados fictícios. A jornada de 27/11 já enviada deve permanecer.
3. Iniciar/finalizar no celular, verificar Kanban e Planner sem recarregar, Dashboard em execução do dia. Status Movidesk não deve mudar.
4. Testar envio de rota em outra data, após encerrar a jornada anterior. Verificar ordem e origem no celular. Não tentar reenviar a jornada já criada.
5. Testar erros de conexão e conta técnica não autorizada; não migrar dados reais.

Limites: últimos 100 registros de jornadas por data; consulta por polling, não WebSocket. Sem integração do mapa em tempo real, notificações, estoque online ou modo offline. A associação depende de número/técnico/data iguais à jornada; reagendamento não transfere eventos antigos. Build completo e homologação em navegador pendentes.
