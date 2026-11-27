# RotaSmart 9.0 Beta 4.3 — Core (incremental)
Base: Beta 4.2; requer SQL da Beta 4.1 já instalado. Faça backup/exporte e publique o rascunho antes de atualizar.
1. Execute RotaSmart_V9.0_Beta4.3_Banco.sql no Supabase SQL Editor. Não exclui registros.
2. Envie os quatro arquivos TSX nas respectivas pastas da branch v9-online.
3. Em Montar rota selecione técnico/data (ou abra pelo Planner/Execução). Arraste pela alça ⠿; setas continuam disponíveis. Confirme rota, publique carteira e clique em Confirmar e enviar/atualizar rota do técnico.
4. Verifique no celular e no Planner a ordem confirmada; teste novo chamado no fim e reordenação dos não iniciados. Os registros enviados não podem ser omitidos nesta versão; posições iniciadas/encerradas são imutáveis no RPC. O RPC usa a mesma transação para adicionar e reordenar e verifica a sequência final.
5. Teste com dados fictícios; não migrar dados reais. Em caso de divergência use Integridade da carteira em Execução em campo.
Limites: 50 chamados por envio; publicação administrativa manual; consulta de execução a cada 3s; não há migração integral de armazenamento nem sincronização automática de rascunhos. A ordem oficial enviada é a de field_jobs, enquanto o planejamento permanece na carteira. Arraste HTML nativo no desktop; setas como alternativa em dispositivos touch. Remoção de chamados enviados fica para etapa posterior. Otimização automática desabilitada após início da jornada para preservar histórico.
Validação: transpile TypeScript sem diagnósticos de sintaxe; não é build completo nem teste de execução SQL. Homologar na Vercel/Supabase antes de operar.
