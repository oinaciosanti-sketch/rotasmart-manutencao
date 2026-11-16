# RotaSmart Control V5 — Filiais e Postos

Atualização sobre o repositório atual. ANTES: exporte o backup nas Configurações do RotaSmart e faça backup no GitHub.

- `Filiais`: cadastro mestre das 76 unidades documentadas, com cidade, endereço, CEP, CNPJ, telefone geral e campo editável para WhatsApp do gerente (NÃO consta no documento, não foi inventado).
- `Postos`: cartões das filiais selecionadas, indicadores, detalhes dos chamados e badges +1/+2 de chamados novos importados ainda não vistos.
- Correlação de filiais por número e código FL em Assunto/Descrição quando único; não inventa localidade.
- Os alertas só são gerados APÓS a importação CSV/XLSX; não há sincronização em tempo real.
- Filiais com endereços incompletos do documento ficam sinalizadas. Nenhuma coordenada foi adivinhada.
- Cadastro mestre inicial é mesclado com dados locais. Dados antigos do usuário têm prioridade, exceto lacunas de cidade/endereço/CEP preenchidas pelo cadastro documental.
- Recomendação: valide primeiro num ambiente de teste e com dados autorizados.

## Instalação
Este ZIP é um pacote de atualização de ARQUIVOS (não um repositório integral). Copie a pasta `app/` para a raiz de seu repositório GitHub já existente, mesclando e substituindo os arquivos correspondentes. NÃO exclua os demais arquivos. Faça commit e aguarde a Vercel.

## Uso
1. Acesse `Postos` e selecione as filiais da sua região em `Minhas filiais`.
2. Importe o CSV filtrado do Movidesk em `Importar chamados`.
3. Abra `Postos` e visualize +1/+2 em cada unidade com chamados novos. Ao abrir o cartão, os avisos daquela filial ficam marcados como vistos.
4. Cadastre telefones de gerentes em `Filiais` > editar. Botões WhatsApp só aparecem com telefone válido.

**Limitações:** controle de filiais selecionadas, alertas vistos e telefone do gerente persistem conforme mecanismos atuais; seleção/alertas são localStorage do navegador, telefone integra o cadastro de filiais; no modo nuvem, disponibilidade de gravação exige permissões corporativas já existentes. Importações antigas anteriores à V5 não geram avisos retroativos.
