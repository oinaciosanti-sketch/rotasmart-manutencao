# RotaSmart Manutenção

MVP visual e navegável para planejamento de rotas de técnicos de manutenção.

## Recursos

- Dashboard operacional
- Kanban de chamados
- Planner semanal
- Montagem manual e reordenação de rotas
- Sugestão simulada de otimização
- Mapa visual de rotas
- Base de filiais/postos e técnicos
- Importação simulada de CSV/Excel

Os dados são locais e simulados. Não há autenticação, integração real com o
Movidesk ou cálculo real de rotas nesta versão.

## Requisitos

- Node.js 18.18 ou superior
- pnpm 11 ou superior

## Execução local

```bash
pnpm install
pnpm dev
```

Abra `http://localhost:3000`.

## Build de produção

```bash
pnpm build
pnpm start
```

## Deploy na Vercel pelo GitHub

1. Crie um repositório no GitHub.
2. Envie os arquivos deste projeto ao repositório.
3. Entre em [vercel.com](https://vercel.com) e selecione **Add New > Project**.
4. Importe o repositório do GitHub.
5. Confirme o framework **Next.js**.
6. Mantenha as configurações definidas em `vercel.json`.
7. Clique em **Deploy**.

Ao finalizar, a Vercel fornecerá um endereço público semelhante a
`https://rotasmart-manutencao.vercel.app`. Esse endereço funciona sem localhost
e pode ser compartilhado com os analistas.

Cada atualização enviada à branch principal do GitHub gera um novo deploy
automaticamente.

## Deploy direto, sem GitHub

Também é possível publicar a pasta diretamente:

1. Instale a Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Na pasta do projeto, execute:

   ```bash
   vercel
   ```

3. Para publicar a versão de produção:

   ```bash
   vercel --prod
   ```

Depois do primeiro acesso, a Vercel exibirá a URL pública do projeto.

## Evolução prevista

O ponto de integração com Google Maps/Routes API está representado na sugestão
simulada da tela **Montar rota**. Em uma versão futura, o cálculo deverá ser
extraído para um serviço no servidor, mantendo a decisão final sob controle do
analista.
