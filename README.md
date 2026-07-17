# RotaSmart Manutenção

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

## Limitações

- ainda não há backend, banco externo, login ou múltiplos usuários;
- dados salvos em um navegador não são compartilhados com outro dispositivo;
- a linha do mapa é aproximada e não segue ruas ou rodovias;
- não há integração real com Movidesk ou API paga de roteamento;
- exclusões definitivas não mantêm histórico; para histórico operacional, use
  preferencialmente **Cancelar chamado**.
