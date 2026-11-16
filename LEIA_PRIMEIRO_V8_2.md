# RotaSmart Control V8.2 — Atualização de apresentação e status

Esta atualização parte da V8.1 e mantém a correção dos vínculos de filiais.

## Alterações
- Kanban e cartões de Postos mostram somente o Assunto do Movidesk, com retorno ao início do texto operacional quando não existe Assunto importado.
- No modal, Assunto e Descrição do Ticket aparecem em campos separados e somente leitura para chamados importados. O texto operacional existente continua editável e não é apagado.
- A coluna Fechado não aparece mais no Kanban. Chamados antigos classificados como Fechado ficam na coluna Concluído e são contados como Concluídos no dashboard.
- Novos tickets importados com status Fechado são convertidos a Concluído no RotaSmart, preservando `sourceStatus` como estado original do Movidesk.
- Preserva Cancelado como status distinto.

## Instalação no GitHub
1. Faça backup do repositório e dos dados pelo RotaSmart.
2. Extraia o ZIP (não carregue o ZIP compactado).
3. Atualize os arquivos **dentro das pastas indicadas**, substituindo os existentes:
   - `app/page.tsx`
   - `app/components/ImportTickets.tsx`
   - `app/components/PostosBoard.tsx`
   - `app/utils/branchEnrichment.ts` (incluído da V8.1 para garantir compatibilidade se ainda ausente)
4. Não crie `page.tsx`, `PostosBoard.tsx` ou qualquer arquivo `.tsx` na raiz.
5. Confira os caminhos no GitHub, faça commit e verifique o deploy Vercel.
6. Atualize a página com Ctrl+Shift+R e teste um chamado antigo Fechado, um Concluído e um novo importado.

## Escopo e ressalvas
- Esta é uma atualização pontual, não substitui o repositório completo.
- A unificação é de apresentação e dos novos dados importados. Os registros antigos continuam armazenados com seus valores originais, mas são exibidos como Concluído.
- A descrição importada permanece acessível dentro do chamado; texto operacional editável continua sendo conservado.
- A API e o Movidesk não são modificados.
- Verificação sintática local não equivale a um teste de produção.
