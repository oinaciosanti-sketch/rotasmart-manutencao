# Beta 4.7.1 — Refino operacional
Requer Beta 4.7. Execute o SQL separado no Supabase de homologação antes de enviar os arquivos do ZIP à branch v9-online. Exporte backup primeiro. Não altere a main. Não use dados corporativos durante a homologação.
- Avisos e diagnóstico TomTom recolhíveis abaixo do workspace; recalcular no rodapé da sequência; mapa sem avisos repetidos.
- Portal técnico: Hoje, Semana (segunda a domingo, seleção de dia), Histórico e Pendências; confirmação de saída de jornada futura desabilitada pela interface. A confirmação de visualização é por versão exibida na tela, não leitura humana comprovada.
- Arraste desktop: imagem do cartão completo, reordenação provisória e animação dos vizinhos; salva ao soltar. Setas continuam disponíveis. Testar no navegador.
- Reagendamento: se já enviado, Central de operações > selecione o dia antigo > Liberar para reagendar (somente waiting, sem alterar posições protegidas). Aguarde consulta; altere a data no chamado e confirme a rota nova. A liberação é registrada em field_release_log e não apaga execução iniciada ou concluída. Não é transação única com a alteração da carteira. Se não publicar a nova rota, o técnico não a recebe. Para duplicidade preexistente, libere apenas a ocorrência incorreta não iniciada; não há limpeza automática. Se houver histórico protegido, revise manualmente.
- Não há alteração automática do status oficial Movidesk.
Validação: transpileModule TypeScript sem erros sintáticos; não executado build completo ou SQL no Supabase. Homologar com conta admin e técnico.
