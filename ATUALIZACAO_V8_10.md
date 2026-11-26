# RotaSmart V8.10 — Inteligência Logística
Base: ZIP V8.9.1. Inclui também as alterações dessa versão, pois a captura em produção exibia V8.9.

## Publicação
1. Exporte o backup no RotaSmart. Não limpe os dados locais.
2. Extraia o ZIP de atualização e copie os arquivos às respectivas pastas na raiz do repositório (app/components, app/utils, app/page.tsx, app/globals.css).
3. Faça commit: V8.10 - Inteligência logística e rotas dinâmicas. Aguarde o deploy na Vercel e confira VERSION 8.10 no cabeçalho. Se necessário, recarregue com Ctrl+F5 e confira o commit do deploy.
4. Não altere variáveis de ambiente ou dados do Movidesk. TOMTOM_API_KEY continua no servidor.

## Testes de homologação
- Mapa Estratégico: escolha primeira filial 09; adicione 03, 22, 27. Confirme que 09 está fixa, que o trajeto é atualizado ao reorganizar e que o sistema só recomenda uma alternativa após comparação rodoviária.
- Teste alterar a primeira filial, fixar a última na otimização, recusar/aplicar sugestão, limpar rota e buscar filial sem coordenadas.
- Montar rota: selecione técnico/data/origem, acrescente chamados, arraste e use as setas. Confira cálculo automático e indicadores; salve rascunho e confirme em testes separados. Confira mapa de rotas e planner após salvar.
- Desligue a conexão em teste: deve aparecer estimativa em linha reta sem duração rodoviária confiável.

## Decisões e limites
Comparação de até seis sequências rodoviárias por alteração, com cache de sessão. Candidatas geográficas, inversões, trocas e melhor sequência anterior. Menor duração, distância como desempate. Não garante ótimo global; não utiliza matriz de tempos nem trânsito em tempo real. Pode aumentar consumo de requisições TomTom. Rotas do Mapa Estratégico são rascunhos; em Montar rota, a geometria calculada automaticamente é prévia até Salvar rascunho ou Confirmar rota. A origem já cadastrada de Montar rota continua independente dos chamados. Não há mudança de banco de dados. Sem dependências novas.
Validação: análise sintática dos TS/TSX alterados, typecheck isolado do motor e teste com API simulada. Build Next.js e teste de navegador/TomTom real ainda pendentes (dependências ausentes no ambiente).
