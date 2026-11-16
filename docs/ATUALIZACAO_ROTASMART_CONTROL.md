# RotaSmart Control — atualização incremental (16/11/2026)

**Finalidade:** atualizar o RotaSmart Manutenção da Vercel/GitHub sem substituir o arquivo principal `app/page.tsx` da versão atual.

## O que este pacote faz

- Importa as exportações originais do Movidesk por **CSV (`;`, Windows-1252 ou UTF-8)** e **XLSX** da primeira planilha; mantém compatibilidade com o JSON anterior do RotaSmart Bridge.
- Confere colunas `Número` e `Status` (19 campos presentes nas amostras).
- Filtra por **Responsável** antes da importação (seleção obrigatória) e exclui `Resolvido`, `Fechado`, `Concluído`, `Cancelado` por padrão.
- Deduplica pelo número do chamado; separa registros novos e atualizações; preserva técnico, data, roteiro, observações e andamento local já cadastrados.
- Armazena informações adicionais do Movidesk em `sourceFields` e `sourceStatus` no estado local do chamado (não substitui anotações operacionais).
- Cria filiais ainda não cadastradas quando a exportação contém sua identificação, mas **não inventa endereço ou coordenadas**.
- Adiciona a aba **Mapa de chamados**: pins de chamados ativos para filiais que têm coordenadas, com indicação de críticos.
- Adiciona a aba **Estoque móvel**: saldo por veículo, reposições, consumo vinculado ao número do chamado e CSV de movimentações (armazenamento local do navegador).
- Preserva o Kanban, Planner, mapa de rotas existente, modelo de Técnico e botão de atendimento técnico, porque este pacote NÃO sobrescreve o `app/page.tsx` atual.

## Importante — dados das amostras

Foi possível ler as duas exportações enviadas, com 19 colunas em cada uma: **256 linhas no CSV** e **248 no Excel**, de capturas diferentes. O CSV contém chamados de várias equipes e muitos registros não têm filial/endereço. **Não forneça acesso público ao banco ou aos CSVs corporativos.** Nenhuma exportação real está incluída no ZIP.

## Como instalar no GitHub sem perder funções

1. **Antes de tudo, baixe o backup do repositório atual** (GitHub → Code → Download ZIP), ou crie um branch chamado `backup-antes-control`.
2. Extraia o arquivo `RotaSmart_Control_ATUALIZACAO_GITHUB.zip`.
3. Copie a estrutura interna deste pacote **sobre a raiz do repositório atual**, preservando os arquivos que não estão neste pacote. Faça commit da alteração usando GitHub Desktop, ou arraste a estrutura de pastas extraída na opção de upload preservando as pastas.
4. **Não apague nenhum arquivo do repositório. Não suba o ZIP fechado como se fosse o site.** Não substitua a pasta inteira por apenas o conteúdo deste pacote.
5. O `package.json` usa `scripts/enable-personal-modules.cjs` no build e no dev. Esse script inclui as novas abas no `app/page.tsx` real do repositório, de maneira idempotente; não é necessário substituir seu arquivo principal manualmente.
6. Confira se o deploy da Vercel concluiu. Caso o script reporte alteração incompatível do `app/page.tsx`, interrompa o deploy, preserve a versão atual e revise a integração — o script foi projetado para falhar sem sobrescrever a versão antiga.
7. Faça um teste com **CSV fictício ou anonimizado e autorizado** antes de importar dados corporativos.

## Rotina sugerida para o analista

1. Exporte chamados não concluídos do Movidesk, de preferência em CSV.
2. No RotaSmart, abra **Importar chamados → Escolher arquivo**.
3. Selecione seu nome exato em **Responsável no Movidesk**.
4. Confira a prévia: novos, atualizados e filiais a conferir.
5. Clique em **Confirmar sincronização**.
6. Abra **Mapa de chamados**, **Kanban** e **Montar rota**. Sua rota planejada e suas anotações não serão substituídas pelo CSV.
7. Se um ticket desapareceu do próximo arquivo, ele permanece em RotaSmart até conferência manual. Isso é intencional para não confundir filtros diferentes com encerramento.

## Limitações transparentes

- **Não há sincronização automática com o Movidesk**; a importação é manual. A API oficial exigiria aprovação e acesso do TI.
- **O módulo Estoque móvel persiste no localStorage**, ou seja, somente no navegador/dispositivo onde foi usado. Exporte CSVs regularmente; não é um estoque corporativo oficial.
- Os dados básicos do RotaSmart seguem o mecanismo existente: localStorage quando em modo local e Supabase quando autenticado em modo nuvem. Os campos Movidesk recém-adicionados podem exigir ampliação do esquema de sincronização no Supabase antes de serem preservados em múltiplos dispositivos.
- **Não retiramos a autenticação existente** de versões conectadas ao banco, porque remover login de um site público com chamados corporativos permitiria exposição de dados. Para uso pessoal, mantenha o acesso protegido e as permissões corporativas adequadas.
- Os dados do CSV não têm coordenadas, e a maioria não fornece endereço ou filial. As filiais sem coordenadas devem ser verificadas e cadastradas antes de aparecerem no mapa de pontos.
- As amostras foram testadas no leitor em ambiente Node com APIs de navegador. **Não foi possível executar um build Next.js completo neste ambiente por falta das dependências instaladas.** O script de integração foi testado duas vezes sobre a cópia antiga, verificando que não duplica módulos.
- Se o arquivo `app/page.tsx` do GitHub mudar de estrutura futuramente, será necessário ajustar o script de integração.

## Arquivos incluídos na atualização

- `app/components/ImportTickets.tsx` (substituição)
- `app/components/OperationalMap.tsx` (novo)
- `app/components/VehicleInventory.tsx` (novo)
- `app/utils/movideskFiles.ts` (novo)
- `app/data/AppDataContext.tsx` (substituição compatível com o repositório conferido)
- `app/globals.css` (substituição compatível com o repositório conferido)
- `scripts/enable-personal-modules.cjs` (novo)
- `package.json` (atualização do comando de build)
- este documento.
