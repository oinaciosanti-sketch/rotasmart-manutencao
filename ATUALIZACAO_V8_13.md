# RotaSmart V8.13 — Sincronização inteligente e Planner com histórico

Base: pacote completo V8.10 + atualizações V8.11 e V8.12 fornecidas nesta conversa. Aplicar os cinco arquivos de código deste ZIP sobre a V8.12. Não substituir a pasta app inteira nem alterar chaves de armazenamento. Fazer backup geral e backup separado do estoque móvel antes do deploy.

## Importação
- XLSX e CSV continuam disponíveis. As 18 colunas informadas são aceitas; Número e Status são obrigatórios. Categoria, Cliente, Classificação - Manutenção, Criado por, Fechado em e outros campos adicionais permanecem em sourceFields. Responsável ausente não substitui o analista local. Sem Responsável, Todos é selecionado; confirme a origem do arquivo antes de importar.
- O status oficial conhecido sobrescreve o status local inclusive quando programado ou concluído. Resolvido/Fechado/Concluído equivalem a Concluído na interface; Reaberto equivale a Novo. Valor original permanece em sourceStatus. Status não reconhecidos e IDs com status conflitantes são ignorados com contagem na prévia.
- Chamados existentes são sincronizados mesmo se o responsável mudou; seleção de responsável limita os novos registros. Ausência de um ticket ou de campo não significa exclusão. Campos em branco não apagam o histórico existente. Backup preventivo é obrigatório.
- Se houver Data da última ação comparável nos dois registros, o mais antigo é ignorado. Sem essa coluna não é possível comprovar a ordem temporal; use sempre o arquivo mais recente. Histórico das últimas 20 importações inclui alterações de status. A última importação registrada aparece no cabeçalho do conteúdo.
- Conclusões com data atual/futura são sinalizadas para revisar a programação; não removemos automaticamente paradas. A confirmação de rota atual/futura contendo concluídos é bloqueada na interface; remoção explícita pelo Planner. O histórico de datas anteriores é mantido se já existia. Não recupera programações removidas antes da atualização.

## Planner
- Concluídos permanecem em sua data/técnico, com ✅ verde. Não concluídos com data anterior ao dia corrente em America/Sao_Paulo ficam amarelos com ⚠️. O dia atual é destacado corretamente e atualizado enquanto a página está aberta. Clique no cartão para editar ou reagendar. Reagendar move o cartão para a nova data; não há histórico separado de tentativas nesta versão.
- Confirmação de planejamento não transforma um chamado concluído em Programado. Cancelamentos seguem a regra anterior de desprogramação.

## Publicação
1. Extrair o ZIP e substituir app/components/ImportTickets.tsx, app/data/AppDataContext.tsx, app/page.tsx, app/globals.css; adicionar app/utils/officialSync.ts.
2. Commit: V8.13 - Sincronizacao oficial Movidesk e Planner com historico.
3. Confirmar deploy Vercel e VERSION 8.13. Testar inicialmente em uma cópia/backup: Programado -> Resolvido, reabertura, ausência no arquivo, preservação de data/técnico/notas, alerta de atraso, reagendamento, rota futura com concluído e exportação de histórico. Conferir estoque móvel e planejadores.

Validação local: transpile TypeScript/TSX dos arquivos modificados, testes isolados do mapeamento/merge/Planner/antiguidade e leitura de XLSX sintético com 18 colunas; arquivo Ticket (5).xlsx vazio rejeitado. Build Next.js e homologação do navegador não executados (dependências do projeto não instaladas); modo nuvem não homologado. A atualização foi preparada para o modo local em uso.
