# RotaSmart Bridge — MVP 1

Extensão Chrome Manifest V3 que lê os cards **visíveis e carregados** do Kanban do Movidesk e exporta JSON/CSV. Ela não altera o Movidesk, não captura senha ou token e não envia dados automaticamente.

A versão 1.0.1 reconhece a estrutura real do Kanban Movidesk que separa os
cabeçalhos `.column-header` dos corpos `.column-group` e associa ambos pelo
atributo `data-id`. Os cards são identificados pelo atributo `data-number`.

## Instalação no Chrome

1. Extraia o ZIP em uma pasta curta, por exemplo `C:\RotaSmartBridge`.
2. Abra `chrome://extensions`.
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta que contém o arquivo `manifest.json`.
6. Fixe a extensão **RotaSmart Bridge** na barra do Chrome.

Após alterar qualquer arquivo da extensão, volte a `chrome://extensions`, clique em **Atualizar** no cartão da extensão e recarregue a página do Movidesk.

## Uso

1. Abra o Kanban em `https://agricopel.movidesk.com/`.
2. Role horizontal e verticalmente para carregar os cards desejados.
3. Abra a extensão e clique em **Analisar Kanban**.
4. Marque os status que deseja extrair.
5. Clique em **Extrair selecionados** e confira a prévia.
6. Clique em **Exportar JSON**.
7. No RotaSmart, abra **Importar chamados**, selecione o JSON e confirme a importação.

O RotaSmart usa `numeroChamado` ou `movideskId` para evitar duplicidade. Chamados sem filial/cidade reconhecida entram sinalizados para revisão. Ao atualizar um chamado existente, técnico, data, rota, ordem e planejamento são preservados.

## Estrutura do JSON

```json
{
  "source": "movidesk-kanban-extension",
  "version": "1.0",
  "exportedAt": "2026-07-22T12:00:00.000Z",
  "url": "https://agricopel.movidesk.com/...",
  "statuses": ["Novo", "Em atendimento"],
  "tickets": [
    {
      "origem": "Movidesk",
      "movideskId": "98496",
      "numeroChamado": "98496",
      "statusOrigem": "Novo",
      "statusRotaSmart": "Novo",
      "titulo": "Manutenção de equipamento",
      "descricao": "Resumo visível no card",
      "filial": "Filial 02",
      "cidade": "Jaraguá do Sul, SC",
      "urgencia": "Média",
      "analistaResponsavel": "Não definido",
      "linkOrigem": "https://agricopel.movidesk.com/...",
      "rawText": "Texto completo do card",
      "extraidoEm": "2026-07-22T12:00:00.000Z",
      "needsReview": false
    }
  ]
}
```

## Teste local do parser

O arquivo `test-kanban.html` simula um Kanban. Para testá-lo com a extensão, temporariamente acrescente `"file:///*"` a `host_permissions` e `matches` no `manifest.json`, habilite **Permitir acesso a URLs de arquivo** na página de extensões e abra o HTML no Chrome. Remova essa permissão depois do teste.

## Limitações do MVP

- Extrai somente cards presentes no DOM; cards ainda não carregados por rolagem não são exportados.
- O Movidesk pode usar estruturas/classes diferentes entre contas. O parser combina seletores, texto visível, links e regex, mas pode precisar de ajuste depois de uma captura real.
- Campos não exibidos no card não podem ser descobertos pela extensão.
- Status desconhecidos são importados como `Novo` e marcados para revisão.
- Não há envio direto, autenticação com API nem sincronização automática nesta versão.

## Próximo passo sugerido

Depois de validar o parser no Kanban real, criar um endpoint autenticado no RotaSmart e permitir envio direto com confirmação, relatório de duplicidades e histórico de importação.
