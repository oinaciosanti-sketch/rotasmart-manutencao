# V9.0 Beta 2.1 — correções de homologação
Publicar somente na raiz da branch v9-online. Não alterar main nem executar SQL. A chave da carteira Beta 2 é preservada.
- Cadastro: número manual sem CNPJ, cálculo existente com CNPJ, validação de número e duplicidade (09/9). Para recuperar filial sem número, marque a opção de exibir cadastros provisórios e edite o registro existente, não crie outro.
- Corrige vinculação indevida de chamados sem filial ao criar uma filial nova.
- Mobile: menu lateral recolhido com botão de menu, conteúdo em largura integral e atalho para mapa de rotas corrigido. Kanban ainda tem rolagem horizontal. Barra de sincronização não fica fixa em telas estreitas.
- Publicação manual e revisão de conflitos mantidas. Portal técnico ainda bloqueado. Nenhuma migração ou alteração SQL.
Teste: publicar rascunho de teste antes do deploy; cadastrar filial 301 sem CNPJ, conferir lista, rejeitar duplicata 301, recuperar filial 300 existente, confirmar vínculo do chamado 99999, publicar e receber em outro dispositivo. Testar menu mobile, mapa e modal. Usar somente dados fictícios. Sintaxe TSX/TS verificada; build e navegador pendentes.
