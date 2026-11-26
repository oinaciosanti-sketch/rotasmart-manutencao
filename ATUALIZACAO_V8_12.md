# V8.12 — Smart Import
Base: V8.10 completa + atualização V8.11. Faça backup geral e do estoque antes de publicar. Substitua os arquivos nas mesmas pastas do GitHub; confirme VERSION 8.12 após deploy.
- XLSX: múltiplas abas, cabeçalho depois de títulos, colunas em qualquer ordem, aliases comuns. Número e Status obrigatórios. CSV e JSON Bridge preservados.
- Múltiplos arquivos: selecione juntos; se um falhar, o lote inteiro fica bloqueado. Revise responsável e prévia; duplicados no escopo combinam campos não vazios (último valor não vazio prevalece).
- Campos adicionais não vazios preservados em sourceFields; campos vazios não apagam os antigos. Planejamento local preservado. Backup automático obrigatório antes de importar. Histórico local das últimas 20 importações.
- Estoque: ícones e cores no histórico, sem mudança do armazenamento.
- Testes: leitor compilado em TypeScript, XLSX sintético com duas abas, XLSX vazio real e CSV com aspas; sintaxe TSX validada. Build Next.js e teste no navegador pendentes. Não há mapeamento manual de colunas nesta versão. Limites antigos de 10 MB por arquivo e 20 MB por entrada XLSX mantidos. Nenhuma correção no exportador Movidesk.
