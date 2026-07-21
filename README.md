# RotaSmart Manutenção

## RotaSmart 2.0 — Supabase e login

Esta versão inicia a transição do armazenamento local para uma arquitetura com
autenticação e PostgreSQL no Supabase. O modo local continua disponível: sem as
variáveis do Supabase, o aplicativo abre normalmente e mantém os dados no
`localStorage`. Com as variáveis configuradas, o login passa a proteger o app e os
dados são carregados e sincronizados com a nuvem.

### O que foi incluído

- login, cadastro, recuperação de senha, logout e restauração de sessão;
- perfil com papéis `admin`, `analista` e `visualizador`;
- cliente Supabase para navegador, servidor e renovação de sessão via middleware;
- schema PostgreSQL para perfis, analistas, técnicos, filiais, chamados, rotas,
  paradas e configurações;
- políticas RLS separadas e sem uso de `service_role` no frontend;
- serviços de acesso ao banco por entidade;
- carregamento gradual do banco para o estado global;
- sincronização cloud após a migração inicial;
- tela de status e migração em **Configurações e backup**;
- relatório de registros criados, atualizados, ignorados e com erro;
- preservação integral do backup local depois da migração.

### Criar e configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra **SQL Editor** e execute primeiro `supabase/schema.sql`.
3. Em seguida, execute `supabase/policies.sql` para habilitar RLS e permissões.
4. Em **Project Settings > API**, copie a URL do projeto e a chave pública
   `anon`/`publishable`.
5. Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

Nunca coloque a chave `service_role` em `.env.local`, no GitHub ou no navegador.

### Configurar autenticação

Em **Authentication > URL Configuration**, informe a URL pública da aplicação em
**Site URL**. Adicione também `http://localhost:3000` e a URL da Vercel às URLs de
redirecionamento permitidas. O primeiro usuário criado depois da execução do schema
recebe o papel `admin`; os seguintes recebem `analista`. Confirme o e-mail se essa
opção estiver habilitada no Supabase.

### Migrar dados locais para o banco

1. Entre no RotaSmart com o perfil `admin`.
2. Abra **Configurações e backup**.
3. Confira o estado **Banco conectado e sessão autenticada**.
4. Clique em **Migrar dados locais para o banco**.
5. Revise o resumo e confirme.

A ordem é analistas, técnicos, filiais, rotas, chamados e paradas. Chamados são
comparados por número; filiais por CNPJ ou número; técnicos e analistas por nome.
O aplicativo não apaga o `localStorage` e exibe um relatório ao terminar.

### Serviços de banco

Chamadas Supabase ficam em `app/services`, separadas das telas. Os serviços de
analistas, técnicos, filiais, chamados, rotas e perfis oferecem listagem, consulta,
criação, atualização e remoção/desativação. `migration.ts` faz conversão, deduplicação,
migração e carregamento do snapshot cloud.

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
5. Em **Project Settings > Environment Variables**, cadastre
   `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` para Production,
   Preview e Development.
6. Clique em **Deploy**.

Se a Vercel informar `Can't resolve '@supabase/ssr'`, confirme que o commit enviado
contém o `package.json` e o `pnpm-lock.yaml` desta versão. Depois use **Redeploy** com
**Use existing Build Cache** desmarcado. O `vercel.json` também força uma instalação
completa para evitar reutilização de dependências antigas.

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

- o enforcement dos papéis está principalmente no RLS; a interface ainda não oculta
  todas as ações de administração para cada papel;
- a sincronização desta etapa usa snapshots e não Supabase Realtime;
- conflitos simultâneos entre vários analistas usam a última atualização recebida;
- alterações feitas antes da primeira migração continuam somente no navegador;
- a linha do mapa é aproximada e não segue ruas ou rodovias;
- não há integração real com Movidesk ou API paga de roteamento;
- ainda não há anexos, notificações ou auditoria avançada;
- exclusões definitivas não mantêm histórico; para histórico operacional, use
  preferencialmente **Cancelar chamado**.

## RotaSmart 2.1 — usuários e permissões

Esta versão adiciona a aba **Usuários**, visível somente para administradores. Nela é
possível criar um perfil pendente, editar nome e e-mail, escolher o papel
(`admin`, `analista` ou `visualizador`), vincular um analista e ativar ou inativar o
acesso. O frontend não usa `service_role` e não exclui contas do Supabase Auth.

Antes de publicar a versão 2.1, execute **depois** dos scripts do RotaSmart 2.0:

1. Abra **Supabase > SQL Editor**.
2. Cole e execute o conteúdo de `supabase/policies_v2_1.sql`.
3. Confirme que não houve erro e só então publique/recarregue o frontend.

O script preserva os perfis existentes, acrescenta `user_id`, status, observações,
último acesso e auditoria, e atualiza as políticas RLS. O primeiro usuário vinculado
continua administrador. Contas seguintes sem perfil previamente criado recebem o
papel mais seguro de visualizador.

### Como adicionar um usuário

1. Entre como administrador e abra **Usuários**.
2. Clique em **Adicionar usuário**, informe o e-mail exato, papel e analista.
3. Salve o perfil como **Pendente**.
4. Peça ao usuário para criar a conta na tela de cadastro com exatamente o mesmo
   e-mail. No primeiro acesso, o perfil pendente será vinculado automaticamente e
   manterá o papel e o analista escolhidos pelo administrador.

No cabeçalho são mostrados nome, papel e analista vinculado. Um perfil inativo recebe
uma tela de acesso indisponível. As permissões também são validadas pelo RLS:

- **admin:** administração completa, usuários, cadastros mestres, migração e backup;
- **analista:** chamados, planejamento, rotas, Planner, mapa e importação operacional;
- **visualizador:** consulta, sem criação, edição, exclusão ou confirmação de rotas.

Chamados, rotas e perfis registram `created_by` e `updated_by`; analistas, técnicos e
filiais também recebem auditoria durante gravações administrativas. Mesmo com o banco
conectado, recomendamos exportar backup antes de grandes migrações.

### Teste recomendado com outro usuário

Crie um perfil pendente em uma janela de administrador. Em uma janela anônima,
cadastre a conta com o mesmo e-mail e confirme que o papel e o analista foram
herdados. Depois teste criação/edição de chamado como analista e confirme que um
visualizador não vê os botões de alteração. Por fim, inative o perfil pelo admin e
faça novo login para validar o bloqueio.

### Limitações do 2.1

- convites e exclusão de contas Auth ainda dependem de operação administrativa no
  painel do Supabase;
- permissões são deliberadamente amplas por papel, sem regras por filial ou equipe;
- não há Realtime nem resolução automática de edições simultâneas;
- testes completos com múltiplas contas exigem um projeto Supabase configurado e não
  podem ser simulados apenas no build local.
