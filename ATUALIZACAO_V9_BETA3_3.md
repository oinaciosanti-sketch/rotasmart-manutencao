# Beta 3.3 — RotaSmart Service
1. Exporte rascunho e publique carteira de teste antes de atualizar.
2. Execute RotaSmart_V9.0_Beta3.3_Banco.sql no Supabase de teste. Confirme field_evidence / rls=true. Não apague tabelas.
3. Envie os arquivos deste ZIP na raiz da branch v9-online, preservando caminhos. Aguarde deploy Ready e confira Beta 3.3.
4. Abra o chamado 99999 e ATEND. TÉCNICO: horário e descrição devem vir do registro online correspondente a número, técnico e data. Registros antigos sem evidência não ganham fotos ou materiais retroativamente.
5. Termine outro atendimento fictício pelo técnico com descrição, materiais e até cinco fotos fictícias. Confira no PC, inclusive cópia do texto e download das fotos.
6. Teste acesso de outra conta técnica, sem jornadas atribuídas. Não use dados reais.
Fotos JPEG comprimidas (até 450000 caracteres cada) são armazenadas na tabela protegida field_evidence, não em bucket público; carregadas ao abrir relatório. Finalização e evidências gravadas na mesma transação. Rascunhos de fotos e materiais permanecem em memória até finalizar. Não há baixa automática de estoque. Relatório online somente leitura; relatório legado permanece para chamados sem correspondência. Build completo e SQL real não testados neste ambiente.
