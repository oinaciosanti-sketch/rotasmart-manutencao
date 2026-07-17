# RotaSmart Manutenção

## MVP 1.4.2 — hotfix de chamados e filiais

O MVP usa uma fonte única de estado no frontend e persiste chamados, técnicos,
filiais e planejamento no `localStorage` (`rotasmart-app-data-v1`).

Esta versão inclui:

- cadastro e edição manual de chamados com validação;
- persistência após atualizar a página;
- integração dos chamados com Kanban, Planner, Montar rota e Mapa;
- mapa real com Leaflet e OpenStreetMap;
- cálculo aproximado de distância por Haversine;
- base inicial com 66 filiais importadas da planilha de coordenadas;
- preservação de dados locais existentes quando há correspondência de filial.

### Restaurar dados iniciais

Use **Limpar dados locais** no menu lateral. A ação pede confirmação e restaura
os dados iniciais ao recarregar.

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

## Deploy na Vercel pelo GitHub

1. Envie todos os arquivos deste pacote a um repositório GitHub.
2. Na Vercel, selecione **Add New > Project**.
3. Importe o repositório e confirme o framework **Next.js**.
4. A Vercel usará os comandos definidos em `vercel.json`.
5. Clique em **Deploy**.

Ao concluir, a Vercel fornecerá uma URL pública semelhante a
`https://rotasmart-manutencao.vercel.app`, que funciona sem localhost.

## Importação de chamados

A tela **Importar chamados** aceita CSV nesta versão. Chamados existentes são
identificados pelo número e os dados de planejamento já registrados são
preservados.

## Limitações atuais

- os dados continuam locais ao navegador, sem banco de dados;
- a linha do mapa liga os pontos diretamente e não segue ruas ou rodovias;
- a distância é aproximada e não usa API paga de roteamento;
- uma filial da planilha possui coordenada inválida e é tratada como sem
  coordenadas para proteger o mapa.
