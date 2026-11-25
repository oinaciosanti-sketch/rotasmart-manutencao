# Correção RotaSmart V8.7 — Mapa Estratégico das Filiais

## Corrigido
- O mapa agora parte de todas as filiais com coordenadas válidas, e **não** apenas de chamados em aberto.
- Filiais com 0 chamados são representadas em cinza.
- Chamados abertos aparecem vinculados aos marcadores das filiais.
- Mini-Kanban lateral ao clicar numa filial (idade do chamado, responsável, urgência e situação).
- Busca por filial e filtros por cidade, presença de chamados e alta urgência.
- Coordenadas ANP cruzadas estritamente por CNPJ e cidade: 17 filiais adicionais incorporadas.
- As 11 coordenadas informadas já presentes na V8.6 foram mantidas.
- Filial 58 mantida SEM localização. Filial 35 da ANP foi excluída devido à divergência de município.
- O cadastro carregado do navegador herda coordenadas estáticas quando estiver sem localização; coordenadas válidas cadastradas manualmente não são substituídas.
- Dependências Leaflet e React-Leaflet sem alterações.

## Ressalvas
- A planilha completa de auditoria das 76 filiais não estava disponível nesta execução. A planilha acessível `filiais_ativas_agricopel_coordenadas_numericas.xlsx` trouxe 19 coordenadas, das quais 17 foram consideradas aproveitáveis após cruzamento e exclusões; o cadastro já continha outras 11 informadas anteriormente.
- Nem todas as 76 filiais têm coordenadas suficientes. **Não** foram inventados marcadores para filiais sem localização.
- Nenhuma atualização foi feita diretamente no site ou no GitHub.
- Executar build e testar no navegador após publicar.

## Publicação
Substitua no GitHub os quatro arquivos da pasta `app/` contidos no ZIP simplificado, mantendo os caminhos originais. Guarde o backup de dados antes de publicar. Não restaure backup antigo por cima de dados atuais.
