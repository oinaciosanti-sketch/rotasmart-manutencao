# RotaSmart V9.0 Beta 4.7 — Smart Dispatch
Base: Beta 4.6.1. Faça backup e use somente dados fictícios durante homologação.
1. Execute primeiro RotaSmart_V9.0_Beta4.7_Banco.sql no SQL Editor do projeto online. Requer SQL Beta 4.3 já aplicado. Não exclui dados nem muda RLS.
2. Envie os arquivos app/ deste ZIP à branch v9-online, mantendo os caminhos.
3. Confira o build da Vercel e a versão 4.7.
4. Salvar rascunho não envia a rota. Confirmar e enviar rota aguarda a carteira salva e valida a sequência no servidor antes de disponibilizar a jornada. Permaneça na tela até o resultado. Se falhar, a carteira pode estar salva, mas a jornada não atualizada; confira antes de tentar novamente.
5. Em jornada existente, Atualizar rota do técnico usa o mesmo fluxo. A proteção do SQL 4.3 continua valendo: não remove chamados enviados, não altera posições iniciadas/encerradas, máximo 50 por envio.
6. A visualização é registrada quando o cabeçalho da jornada aparece na tela visível do técnico. Não comprova leitura integral. Cada novo envio redefine a confirmação. A consulta permanece a cada 3 segundos.
7. Teste rascunho sem envio, envio inicial, inclusão/reordenação durante jornada, preservação de KM/relatórios/fotos, leitura no celular, conflito e falha de rede.
Validação local: sintaxe TSX; sem build completo, execução SQL ou homologação real neste ambiente. Salvamento da carteira e envio são duas operações internas, não uma transação única.
