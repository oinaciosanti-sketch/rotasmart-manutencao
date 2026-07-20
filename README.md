# RotaSmart Manutenção

## MVP 1.6

- Base Agricopel de Jaraguá do Sul configurada como origem padrão em `-26.459964, -49.039587` para Wagner, Vinícius e Valdemir, preservando pontos personalizados.
- Analista responsável nos chamados, filtros operacionais e visão gerencial dinâmica.
- Planner semanal com cards compactos: chamado, filial e cidade.
- Backup completo em JSON com importação por combinação ou substituição.
- Exportações CSV nas telas de Chamados, Planner e Dashboard.
- Dados mantidos no `localStorage` do navegador, sem necessidade de banco nesta versão.

## MVP 1.5

Ferramenta operacional frontend para cadastro de chamados, planejamento semanal,
montagem de rotas e visualização em mapa Leaflet/OpenStreetMap.

### Recursos desta versão

- estado global único para chamados, técnicos, filiais, rotas e pontos de saída;
- persistência automática em `localStorage`;
- criação, edição, cancelamento e exclusão de chamados;
- status `Cancelado` com remoção automática do planejamento ativo;
- inclusão de chamado existente ou criação de novo chamado pelo Planner;
- planejamento como rascunho ou rota confirmada;
- ponto de saída editável por técnico, filial, endereço ou cidade atual;
- coordenadas manuais opcionais para a origem da rota;
- mapa sincronizado com chamados, rotas e pontos de saída;
- Dashboard calculado integralmente a partir dos dados atuais;
- exportação JSON do resumo operacional;
- base inicial com 66 filiais e validação segura de coordenadas.

## Requisitos

- Node.js 20
- pnpm 10.34.5

## Execução local

```bash
pnpm install --no-frozen-lockfile
pnpm dev
```

Abra `http://localhost:3000`.

## Build de produção

```bash
pnpm build
pnpm start
```

## Deploy na Vercel

1. Envie os arquivos para um repositório GitHub.
2. Na Vercel, selecione **Add New > Project**.
3. Importe o repositório e confirme o framework **Next.js**.
4. A Vercel usará `vercel.json` para instalar com pnpm e executar o build.
5. Clique em **Deploy**.

A URL pública gerada pela Vercel funciona sem depender de localhost.

## Persistência

Os dados são armazenados no navegador pela chave `rotasmart-app-data-v1`.
Use **Limpar dados locais** no menu lateral para restaurar a base inicial.

O carregamento valida e normaliza chamados, técnicos, filiais e pontos de saída.
Registros inválidos são ignorados individualmente e uma cópia de recuperação é
mantida na chave `rotasmart-recovery-data-v1`. Se o conteúdo principal estiver
corrompido, a gravação automática é suspensa e o sistema exibe um aviso para evitar
que o dado original seja sobrescrito.

Na migração de filiais, coordenadas locais válidas são preservadas e coordenadas
numéricas salvas como texto são convertidas. Quando o navegador contém latitude ou
longitude vazia/inválida, o sistema recupera automaticamente a coordenada válida da
base atual, sem apagar as demais alterações locais da filial.

O número operacional da filial é calculado automaticamente a partir do CNPJ da
Agricopel: o número do estabelecimento (os quatro dígitos antes do hífen) menos
um. Exemplos: `0068-10` corresponde à filial `67` e `0060-63` à filial `59`.
Na abertura do app, vínculos antigos de chamados também são migrados para o novo
número sem perder coordenadas, rotas ou demais dados salvos no navegador.

Para transferir os dados entre navegadores, use **Configurações > Exportar backup**
e depois **Importar backup**. O arquivo é validado antes da substituição dos dados.

## Fluxo operacional

1. Cadastre ou importe o chamado.
2. Planeje técnico e data no Planner ou em Montar rota.
3. Salve como rascunho ou confirme a rota.
4. Consulte o Mapa de rotas; pontos sem coordenadas ficam listados sem interromper o mapa.
5. Atualize o status do chamado conforme a execução.

Alterações de rota, técnico, filial e chamado são refletidas nas demais telas por meio
do estado centralizado e persistidas no navegador.

## Analistas e Dashboard

A aba **Analistas** mantém registros completos, com status ativo/inativo, contato,
setor, cor, iniciais e observações. O vínculo do chamado utiliza nome e ID; renomear
um analista atualiza os chamados relacionados, e excluir reatribui esses chamados
para **Não definido**. Analistas encontrados na importação CSV são cadastrados
automaticamente como ativos.

O gráfico de rosca de **Chamados por classe** é um SVG calculado em tempo real. Os
setores agrupam os dados reais em **Novo**, **Em andamento** (Programado, Aguardando
compra, Aguardando entrega e Em atendimento), **Concluídos** (Concluído e Fechado)
e **Cancelados**. O gráfico respeita os filtros do Dashboard, não usa percentuais
fixos e apresenta um estado vazio quando não há chamados nos filtros atuais.

Backups novos usam a versão 2 do formato e incluem os registros completos de
analistas e os vínculos dos chamados. Backups anteriores continuam aceitos e são
migrados durante a importação.

## Limitações

- ainda não há backend, banco externo, login ou múltiplos usuários;
- dados salvos em um navegador não são compartilhados com outro dispositivo;
- a linha do mapa é aproximada e não segue ruas ou rodovias;
- não há integração real com Movidesk ou API paga de roteamento;
- exclusões definitivas não mantêm histórico; para histórico operacional, use
  preferencialmente **Cancelar chamado**.
