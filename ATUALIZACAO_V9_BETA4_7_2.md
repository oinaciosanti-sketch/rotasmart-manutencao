# Beta 4.7.2 — Correção de sequência e navegação mobile
Requer Beta 4.7.1. Exporte a carteira e faça backup do banco antes de executar o SQL separado, no Supabase de homologação. Suba apenas os arquivos do ZIP na branch v9-online. Não use dados reais durante os testes.

- A ordem RELATIVA dos atendimentos protegidos é preservada. Seus números de posição podem mudar quando um atendimento não iniciado é deslocado ou retirado. Horários, estados, materiais, fotos, relatórios e IDs de execução não são alterados pela migração.
- O X de Montar rota libera uma ocorrência ainda não iniciada na jornada selecionada, se existir, e depois remove a programação da carteira. São duas operações, não uma única transação. A liberação é auditada. Se o salvamento da carteira falhar, confira o estado e tente retirar novamente depois da atualização. Se houver uma ocorrência em outra data, o X não a remove automaticamente.
- Após remover ou reordenar, confirme e envie a rota para sincronizar a sequência remanescente. Se houver duplicidade antiga, confira a Central de operações nas duas datas; libere apenas a ocorrência incorreta não iniciada. Não há exclusão automática na migração.
- Navegação inferior fixa: Hoje, Semana, Histórico, Pendências. Semana e demais consultas são somente leitura; execução em Hoje. Uma jornada anterior iniciada e ainda aberta aparece separadamente em Hoje para permitir seu encerramento. O servidor rejeita execução de jornadas futuras.
- Estoque permanece local nesta versão. O consumo sincronizado exige migração para um saldo único no Supabase e finalização atômica com registro de consumo; não há integração de estoque implementada neste pacote.

Validação: análise sintática TypeScript e casos simulados de ordem relativa; build Next.js completo, execução PostgreSQL e testes em dispositivos não realizados. Homologue com chamados fictícios antes de uso operacional.
