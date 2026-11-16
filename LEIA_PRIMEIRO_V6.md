# RotaSmart Control V6 — Projeto completo

Este ZIP contém o projeto Next.js completo, **não** apenas arquivos alterados.

## Substituição segura no GitHub

1. Faça backup dos dados no próprio RotaSmart (Configurações e backup) e baixe uma cópia do repositório GitHub.
2. No GitHub, garanta que o conteúdo da pasta raiz deste ZIP, incluindo `package.json`, `app/`, `scripts/`, `supabase/`, `tsconfig.json` e `vercel.json`, esteja na **raiz** do repositório, sem pasta extra envolvendo os arquivos. Não apague variáveis de ambiente da Vercel.
3. Commit e aguarde o novo deployment da Vercel. Confirme na barra lateral **CONTROL V6**. Se ainda mostrar CONTROL, você está abrindo uma implantação antiga ou o deploy não atualizou.
4. Verifique **Filiais** (cadastro mestre), **Postos** (escolher suas 18 filiais), **Importar chamados** (CSV/XLSX), **Chamados**, **Mapa de chamados**, **Estoque móvel**.
5. Antes da primeira sincronização real, exporte backup dos dados e teste com poucos chamados autorizados.

## Dados e limites

* Filiais: base inicial de 76 registros do documento fornecido pelo usuário, com lacunas documentais preservadas; não há coordenadas inventadas.
* Movidesk: usa CSV/XLSX. Número é a chave única e rotas/anotações locais são preservadas na atualização.
* Por padrão, o filtro exclui somente status que começam com `Concluído`, conforme solicitado. Atenção: em `Postos`, o status original é mostrado; no Kanban, alguns status do Movidesk podem ser agrupados nos status internos.
* O mapa só posiciona filiais que possuem coordenadas válidas. Contatos de gerente só abrem WhatsApp após o cadastro de números corretos.
* O aviso +1/+2 depende de nova importação; não há sincronização em tempo real.
* Se o ambiente usa Supabase, mantenha suas variáveis/credenciais e permissões originais. O ZIP não carrega chaves. Dados na nuvem dependem do esquema e políticas já implantados.

## Execução e testes locais

`corepack enable && corepack prepare pnpm@10.34.5 --activate`

`pnpm install --no-frozen-lockfile`

`pnpm build`

`pnpm dev`

**Limite de validação:** a verificação de integridade e dos parsers é executada antes da entrega; sem dependências do Next.js instaladas nesta sessão, o build completo não pode ser garantido. Não use “Ready” como prova de fluxo operacional até testar dados e salvar/atualizar.
