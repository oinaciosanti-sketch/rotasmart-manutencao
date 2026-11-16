# RotaSmart Control — pacote V4 (correção estrutural TypeScript)

## Causa do erro que bloqueia a Vercel
O `tsconfig.json` publicado estava com `compilerOptions.target = "es5"`. Os módulos novos utilizam iteradores modernos (Set, Map, String.matchAll). Com o alvo antigo, o TypeScript emite erros sucessivos do tipo `can only be iterated ... target es2015 or higher`.

## Correção
Ajustado o target para `es2020`, mantendo `strict: true`, o restante das opções de build e a exclusão `TechnicalReport.tsx` presente no GitHub.

## Arquivos incluídos
Pacote de atualizações com os componentes da V3 e a correção de compilação. Não é uma cópia completa do repositório. NÃO exclua outros arquivos ao aplicar. NÃO substitua o `app/page.tsx` atual.

## Publicar com segurança
1. Faça um backup do repositório e dos dados do RotaSmart antes de atualizar.
2. Extraia o pacote na RAIZ do repositório GitHub (mesmos caminhos de `app/`, `scripts/` e `tsconfig.json`).
3. No GitHub, substitua somente os arquivos incluídos no ZIP; mantenha o resto intacto.
4. Confira no GitHub se `tsconfig.json` mostra `"target": "es2020"` — SEM ESSE ARQUIVO o mesmo erro persistirá.
5. Faça commit e verifique o log do novo deploy da Vercel. Se falhar, envie a primeira mensagem `Type error` completa.
6. Só depois valide com dados de teste/autorizados as telas de Importação, Mapa de chamados e Estoque móvel.

## Testes realizados neste ambiente
- Leitor CSV: 256 registros/19 colunas, sem exceção.
- Leitor XLSX: 248 registros/19 colunas, sem exceção.
- TypeScript isolado de `app/utils/movideskFiles.ts`: sem erros com target `es2020`.
- Transpilação/sintaxe das seis principais partes: sem diagnóstico de sintaxe.
- Injeção das novas abas em `app/page.tsx`: executada duas vezes, idempotente.

## Limitação importante
**Não foi possível executar `pnpm install` + `pnpm build` completo aqui** (o ambiente não disponibiliza as dependências Next/React e não tem acesso de rede à instalação). Portanto, não é possível garantir 100% o sucesso do deploy. O erro visto na captura foi corrigido na origem.

## Segurança e dados
Não subir exportações reais do Movidesk no GitHub. O ZIP não contém planilhas/tickets. Evitar publicar dados corporativos em serviços externos sem autorização. O estoque auxiliar permanece no navegador.
