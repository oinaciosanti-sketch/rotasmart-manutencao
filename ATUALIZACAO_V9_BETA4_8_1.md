# RotaSmart V9.0 Beta 4.8.1
Requer Beta 4.8 e respectivo SQL já instalados. Não há nova migração SQL.
- Planner e Kanban reutilizam o mesmo OnlineTechnicalReport, com título e descrição separados. Campos importados do Movidesk permanecem somente leitura; chamados manuais usam sourceFields e mantêm desc compatível com o envio ao técnico. Registros antigos sem campos separados mantêm o texto original.
- Estoque: seção Recuperar estoque anterior; importação explícita do navegador ou JSON, inclusive com estoque online preenchido. Não soma nem substitui saldos existentes. Ignora conflitos por ID ou identificação do material e veículo/técnico; importa movimentos apenas dos novos itens. Preserve o backup original para conferência de conflitos e histórico não importado.
- Os dados locais de outro domínio não são acessíveis; exporte o JSON no endereço original. Confira nome e vínculo do técnico antes de importar. O Supabase da Beta 4.8 permanece como fonte de estoque.
- Instalação: extrair na branch v9-online mantendo caminhos. Inclui FieldPilot baseado no Hotfix 4.8. Não limpar o armazenamento local.
- Validação: transpile TypeScript sem diagnósticos sintáticos; build completo, execução em navegador e banco não testados aqui. Homologar com dados fictícios.
