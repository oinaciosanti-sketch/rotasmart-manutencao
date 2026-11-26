# V9.0 Beta 1 — teste de conexão
Somente branch v9-online e projeto rotasmart-online. Não aplicar na main.
Substitua os arquivos do ZIP mantendo as pastas. Não execute SQL adicional.
Na Vercel do projeto novo, ambiente Production, configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (chave pública default). Não utilize secret/service_role. Faça deploy novamente após salvar variáveis.
Confirme que cadastro público está desabilitado no Supabase. Abra o site, entre com a conta admin criada. Abra em outro dispositivo com a mesma conta para teste; envie sinal em um e confira o mesmo ID no outro. A leitura ocorre a cada 3 segundos, não usa Realtime. O único registro gravado é app_settings.key=rotasmart_v9_beta_connection_test. Não usar dados corporativos. Não há migração, permissões técnicas, notificações ou execução de rotas nesta etapa. O código antigo permanece no repositório, mas seu painel não é montado na página inicial Beta. O sistema original continua em main.
Validação local: sintaxe TS/TSX dos arquivos alterados; build e integração reais pendentes. Não é homologação de segurança.
