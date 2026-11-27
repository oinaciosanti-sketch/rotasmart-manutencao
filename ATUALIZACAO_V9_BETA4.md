# V9.0 Beta 4 — RotaSmart Live
Aplicar somente sobre Beta 3.4, na branch v9-online. Sem SQL adicional. Publicar ou exportar rascunhos antes de atualizar.
- Mapa de rotas: alternar RotaSmart Live / Rotas planejadas (mapa anterior preservado).
- No mobile do administrador: botão Mapa Live.
- Filiais agrupadas por cadastro inequívoco; sem coordenadas, somente lista. Não inventa coordenadas.
- Consulta existente a cada 3 segundos, até 100 jornadas. Falhas sinalizadas. Dados de teste apenas.
- Carro no centro de ligação pontilhada é símbolo de deslocamento previsto, não GPS ou rota por ruas. Não presume saída da filial se houver chamados não iniciados naquela filial. O início de um atendimento nunca é automático.
- Testar com jornada fictícia, duas filiais com coordenadas válidas, pelo menos dois chamados na mesma filial; verificar estados antes/depois, mobile e mapa planejado. Se dados antigos não tiverem coordenadas, mapa não exibirá marcadores.
- Sintaxe TS/TSX e sete asserções da lógica verificadas; build Next e navegador não testados. Não altera banco, permissões, status oficial, notificações ou estoque.
