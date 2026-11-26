# RotaSmart V8.9 — Mapa Estratégico e Planejador de Rotas

Base: ZIP V8.8 fornecido pelo usuário (commit b1067b2fff01afee1209b41888d846311d54f663).

## Publicação segura
1. Exportar backup JSON pelo RotaSmart atual, no navegador habitual.
2. No GitHub, manter a estrutura do repositório. Substituir `app/page.tsx`, `app/globals.css`, `app/components/OperationalMap.tsx`; adicionar `app/components/StrategicRoutePlanner.tsx` e `app/utils/strategicRoute.ts`. Opcional: adicionar este documento na raiz. Não executar os scripts antigos de atualização presentes no ZIP.
3. Fazer commit e verificar o deploy na Vercel. Não alterar variáveis existentes, inclusive TOMTOM_API_KEY. Se o deploy falhar, manter ou restaurar a versão anterior.
4. Abrir o mesmo domínio/navegador habitual, conferir a versão 8.9, cadastros, chamados e importação antes de utilizar operacionalmente.

## Teste de aceitação
- Abrir Mapa Estratégico: conferir números das filiais nos marcadores, cores e painel de chamados. Filiais 56 e 58 continuam excluídas pela regra anterior.
- Pesquisar FILIAL 23 e selecionar resultado; adicionar outras cinco filiais com coordenadas válidas, também pelo botão no painel do mapa. Verificar ordem nos marcadores.
- Reordenar, remover, calcular, aceitar/rejeitar a sugestão. Conferir distâncias, economia e desenho no mapa. A primeira parada é fixa; a última pode ser fixada. Limite de 20 paradas distintas.
- Confirmar que o resultado por ruas aparece quando a TomTom responde; sem API, a comparação é exclusivamente em linha reta, sem tempo exibido. Não usar estimativa em linha reta como distância de viagem.
- Confirmar regressão: filiais, importação CSV/Excel, Kanban, rotas existentes, programação, backup.

## Escopo e limitações
A sugestão usa vizinho mais próximo e melhoria 2-opt por distância geográfica; compara a sequência candidata com a original pela API TomTom quando ambas estão disponíveis. Não garante a melhor ordem global e não explora todas as rotas rodoviárias. Não inclui trânsito ao vivo, retorno automático à base, duração dos serviços ou gravação na programação semanal. O rascunho fica apenas na tela/sessão atual. Nenhuma mudança de schema, armazenamento, API, dependências ou coordenadas. A busca mostra até 12 resultados por vez; marcadores muito próximos podem se sobrepor até ampliar o zoom.

## Verificação realizada
Transpilação sintática TypeScript/TSX dos quatro arquivos alterados/novos com TypeScript local; compilação estrita da função de otimização e testes de preservação de paradas, início, final opcional e redução da distância em cenário sintético de seis pontos. Não houve build Next.js completo, teste de navegador ou teste real da TomTom: instalação das dependências bloqueada por indisponibilidade de resolução DNS do registro npm neste ambiente. Deploy não executado.
