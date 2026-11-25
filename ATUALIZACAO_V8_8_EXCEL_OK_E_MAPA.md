# RotaSmart 8.8 — Excel OK + coordenadas em mensagens

## Correção
- A planilha enviada em 25/11/2026 utiliza a **coluna K (Origem informada)** para registrar o texto `OK`.
- Há **52 linhas OK**. Duas (18 e 72) não contêm coordenadas nas colunas H/I, mas foram complementadas com as mensagens.
- As 11 coordenadas passadas por texto têm prioridade em caso de diferença com a planilha.
- A união resulta em **58 filiais com localização**; a filial **56** tem incompatibilidade explícita com o município de Rio do Sul (observação da planilha: Criciúma). Por segurança, não é carregada.
- A filial **58** permanece pendente, conforme decisão do usuário.
- Resultado: **57 filiais com coordenadas aprovadas para carga**. A auditoria com as 76 linhas está em `docs/AUDITORIA_GEOLOCALIZACAO_V8_8.csv`.

## Aplicar aos registros antigos do navegador
Depois da publicação, abrir **Filiais** e clicar em **Aplicar coordenadas V8.8 (N)**. O botão é necessário porque a base do navegador pode ser diferente da base de filiais inicial do código. Confirme a aplicação. Não restaure backup antigo sobre informações novas.

## Mapa
O menu **Mapa Estratégico das Filiais** utiliza o cadastro de filiais como fonte dos marcadores, inclusive filiais com zero chamados. A versão 8.8 exclui 56 e 58, além de seis pontos históricos ANP sem aprovação explícita, até conferência; estes seis podem ser incluídos posteriormente pela edição da filial.

## Segurança / testes
Código preparado a partir do ZIP V8.7. O backup JSON não deve ser publicado no GitHub. A publicação somente é concluída após o build da Vercel e testes no navegador. Não foi necessário mudar Leaflet/React-Leaflet.
