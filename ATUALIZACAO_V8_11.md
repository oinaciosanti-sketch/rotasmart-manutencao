# V8.11 — Estoque móvel
Base: V8.10 completo fornecido anteriormente. Substitua app/components/VehicleInventory.tsx, app/globals.css e app/page.tsx; adicione app/utils/vehicleStock.ts. Não substitua outros arquivos. Faça backup geral e, se houver estoque, exporte os CSVs antigos antes de publicar. A chave local rotasmart-vehicle-stock-v1 foi preservada.

## Uso
- A visão inicial Todos os técnicos mostra todos os cadastrados, inclusive sem materiais. Selecione um técnico ativo para cadastrar. Registros antigos por nome são associados quando há correspondência única; nomes sem correspondência ficam disponíveis como histórico.
- Entrada soma saldo; saída exige chamado (sugestões do cadastro, permite número externo); ajuste informa o saldo físico final e exige motivo. Transferência exige outro técnico ativo e motivo, registra dois movimentos relacionados e cria cadastro de destino quando necessário (mínimo inicial zero). Unidade diferente ou duplicidade no destino bloqueia a operação. Edição altera identificação e mínimo, não saldo. Quantidades até seis casas decimais.
- Exportações CSV respeitam filtros. Backup JSON inclui todos os materiais e movimentos. Restaurar substitui integralmente o estoque local após confirmação. Backup geral do RotaSmart não inclui o estoque; mantenha ambos. Limpar dados locais remove também o estoque. Não há sincronização entre computadores nem integração com almoxarifado.
- Nomes históricos sem associação inequívoca não são descartados. IDs dos técnicos são usados para novos registros; renomeações antigas sem ID podem exigir conferência manual.

## Homologação
1. Confirme VERSION 8.11 e presença de todos os técnicos cadastrados.
2. Cadastre material de teste com saldo 5 e mínimo 2; consuma 2 com chamado, reponha 4, ajuste para 6, transfira 2 a outro técnico. Saldos esperados 4 e 2; transferência gera dois movimentos.
3. Tente consumir 5 do saldo 4, confirme bloqueio. Confira filtros, edição, CSVs, recarregamento da página e backup JSON. Teste restauração somente com dados de teste ou após salvar backup atual.
4. Confirme mapa e planejadores da V8.10 sem alterações.

Validação nesta entrega: compilação TypeScript estrita do motor de estoque; sintaxe TSX; testes de operações em Node. Build Next.js completo e testes de interface em navegador ainda pendentes, dependências não instaladas no ambiente.
