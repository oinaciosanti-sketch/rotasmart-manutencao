# RotaSmart V9.0 Beta 2 — carteira compartilhada (piloto administrativo)

Aplicar somente na branch v9-online, sobre Beta 1. Não alterar main nem as variáveis do projeto original. Não há SQL adicional nesta etapa. Manter URL e publishable key já configuradas. Confirmar cadastro público desabilitado. Usar apenas dados fictícios até autorização corporativa e homologação.

## Arquitetura e limites
- Interface administrativa V8.13 restaurada. Login obrigatório e perfil admin ativo, vinculado ao UID autenticado.
- O provedor opera em memória; não carrega a carteira antiga local, não grava essa carteira no localStorage e não ativa o sincronizador legado. Começa vazio, com cadastro padrão de analistas. Use cadastros fictícios ou backup fictício para testar.
- O botão Publicar alterações grava um snapshot validado em app_settings, chave rotasmart_v9_beta2_workspace. Cada gravação gera uma revisão UUID. Atualização usa compare-and-set com filtro da revisão anterior e insert inicial sem upsert. Se houver conflito, exporte o rascunho e receba a versão online; não há mesclagem automática.
- A cada 5 segundos, com a tela aberta, consulta a revisão online e sinaliza mudança. Receber versão online recarrega a carteira e reinicia a interface. Publicação e recebimento são manuais nesta Beta. Alterações não publicadas estão em memória; exporte o rascunho antes de sair. Histórico da importação e estoque móvel ainda são locais.
- As tabelas relacionais tickets/routes/etc. ainda não são usadas para sincronização nesta Beta. O snapshot é apenas um piloto para o analista único. Não liberar acesso técnico nem executar a migração antiga. Usuários e portal técnico foram retirados da navegação nesta etapa. Sem GPS, push ou execução remota.
- RLS admin_only da etapa 1 continua sendo a barreira no banco. Não colocar service_role ou secret key no navegador. Verificar políticas e permissões com conta não autorizada antes de dados reais.

## Publicação
Substituir os quatro arquivos em app/ exatamente em seus caminhos e adicionar este README. Commit direto em v9-online. Verificar deploy Ready no projeto rotasmart-online. Se falhar, verificar logs; a versão anterior continua disponível.

## Teste com dados fictícios
1. Login no PC e celular, conferir VERSION 9.0 BETA 2.
2. Criar técnico TESTE, filial fictícia e chamado fictício pelo PC. Publicar. Conferir alerta de revisão no celular e clicar Receber versão online. Conferir dados.
3. Alterar chamado pelo celular e publicar. Receber no PC.
4. Abrir a mesma revisão em dois dispositivos, editar ambos, publicar primeiro no PC. A outra sessão deve sinalizar conflito ou ter a gravação recusada, sem apagar a revisão do PC. Exportar rascunho antes de receber.
5. Sair, voltar e conferir persistência. Testar login sem perfil autorizado.
6. Testar XLSX sintético, planejamento e exportação de backup. Estoque permanece local e separado.

Validação local: sintaxe TS/TSX. Build completo, políticas efetivas e integração PostgREST devem ser homologados na Vercel/Supabase. Não é versão final de produção.
