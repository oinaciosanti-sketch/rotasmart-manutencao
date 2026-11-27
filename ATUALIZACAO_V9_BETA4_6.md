# RotaSmart V9.0 Beta 4.6 — Interface & Organização
Base: Beta 4.5 com Hotfix TypeScript.
- Menu agrupado em Operação, Inteligência e Administração.
- Filiais e postos: abre Chamados por posto (PostosBoard); aba Cadastro de filiais reutiliza Branches. Nenhuma duplicação ou migração de registros.
- Equipe: Técnicos, Analistas e Acessos (restrito a administradores; utiliza UsersPage existente, sujeito às políticas e serviços do Supabase).
- Importar Movidesk e Configurações no menu; rotas, mapas e Smart Sync preservados.
- Sem SQL novo. Exporte backup antes de atualizar, envie os arquivos preservando caminhos à branch v9-online.
- Validação: transpileModule sem erros de sintaxe nos seis TSX do pacote de base; build completo e testes de navegação e permissões ainda pendentes.
