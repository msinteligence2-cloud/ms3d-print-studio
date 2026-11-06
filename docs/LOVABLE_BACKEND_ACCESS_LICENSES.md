# Lovable — backend, banco de dados, licenças e controle de acesso

O Lovable deve criar e configurar o backend real usando Lovable Cloud/Supabase integrado. Não presumir que o banco existente esteja provisionado. Criar migrations versionadas, secrets por ambiente e testes antes de marcar qualquer módulo como pronto.

## Arquitetura
- Usar Lovable Cloud/Supabase para PostgreSQL, Auth, Storage privado e Edge Functions.
- Separar desenvolvimento, preview e produção. Não criar projetos Supabase duplicados se o Lovable Cloud já provisionar um.
- Frontend recebe somente URL e chave anon/publishable. Service role, pepper, chaves de assinatura e segredos de pagamento ficam somente em Secrets e funções servidor.
- Preservar React + TypeScript + TanStack Start/Vite; não migrar para Next.js nem substituir o roteador.

## Papéis e contas
- platform_owner: equipe interna da plataforma; concedido apenas por procedimento administrativo seguro, nunca pelo cadastro público.
- workspace_owner: proprietário do workspace do cliente.
- workspace_admin: administra equipe e recursos do workspace.
- operator: opera impressoras, materiais, projetos e trabalhos.
- viewer: somente leitura.
- O papel global platform_owner nunca pode ser atribuído por metadata editável pelo usuário.

## Cadastro e acesso
1. Cadastro por e-mail/senha com confirmação, login, logout e recuperação com token de uso único e expiração.
2. Rate limiting, proteção contra enumeração e tentativas repetidas.
3. Onboarding cria workspace e membership workspace_owner atomicamente no backend/banco.
4. Cada operação valida sessão, membership e role no banco. Nunca confiar em user_id, workspace_id ou role enviados pelo browser.
5. Convites de equipe com uso único, expiração, revogação e papéis limitados; não convidar platform_owner.
6. MFA obrigatório para equipe administrativa e reautenticação em ações críticas.

## Sistema de licenças e chaves
- Gerar chaves com gerador criptograficamente seguro e pelo menos 256 bits de entropia. Formato legível sugerido: MS3D-XXXXXX-XXXXXX-XXXXXX-XXXXXX.
- Exibir a chave completa uma única vez na emissão. Armazenar apenas hash seguro com pepper mantido em Secrets do servidor e um prefixo para pesquisa. Nunca gravar chave em texto puro ou logs.
- Validades comerciais: 1, 3, 6 e 12 meses. Definir se o prazo começa na emissão ou primeira ativação; registrar issued_at, starts_at, expires_at e revoked_at.
- Estados: pending, active, expired, revoked e suspended; transições auditadas.
- Controlar limite de ativações/dispositivos, lista de dispositivos, desativação, transferência administrativa auditada e prevenção de ativação em workspaces distintos.
- Validação server-side retorna somente status, plano, recursos autorizados e expiração. Nunca retorna hash, segredo ou dados de outros clientes.
- Para Windows, emitir tokens de licença assinados e com expiração curta para tolerância offline configurável. Revalidar quando online; não confiar somente no relógio local.
- Emissão, ativação, falha, transferência, renovação, suspensão e revogação devem ser idempotentes e auditadas, sem armazenar chave/token completo.

## Planos e administração
- Catálogo de planos e entitlements: limite de impressoras, usuários, armazenamento e recursos. Backend aplica entitlements em cada operação; frontend não é autoridade.
- Painel staff permite pesquisar, emitir, renovar, suspender, revogar e consultar histórico. A chave completa aparece somente uma vez.
- Sem senha mestra, rota secreta ou bypass universal.
- Exportações administrativas nunca incluem chaves completas.

## Banco de dados esperado
profiles, workspaces, workspace_members, workspace_invites, plans, plan_entitlements, subscriptions, license_keys, license_activations, printers, projects, project_files, filaments, print_jobs, printer_telemetry, audit_events e payment_events (se houver gateway).
Adicionar chaves estrangeiras, constraints, índices, timestamps, isolamento por workspace e migrations versionadas. Não guardar credenciais LAN das impressoras no banco cloud.

## Segurança obrigatória
- RLS em todas as tabelas acessíveis pelo cliente; testar isolamento com pelo menos dois usuários e dois workspaces.
- Alterações de papel, plano, assinatura, licença, ativação e cobrança somente no servidor/Edge Functions.
- Verificar assinatura de webhooks, idempotência e replay. Nunca aceitar status de pagamento, preço, role, validade ou entitlement enviado pelo cliente.
- Storage privado, autorização por workspace, validação de tamanho/MIME/extensão e URLs assinadas com expiração.
- Validação server-side, rate limiting, CORS restrito, CSP, headers seguros e logs redigidos.
- Política LGPD para finalidade, retenção, exportação, exclusão e consentimento quando aplicável.

## Critérios de aceite
1. Lovable criou o backend, migrations e secrets por ambiente; documentar nomes dos recursos sem revelar valores.
2. Cadastro, confirmação, login, logout, recuperação e onboarding testados.
3. Testes RLS comprovam que workspaces diferentes não leem nem alteram dados um do outro.
4. Viewer não escreve nem chama endpoints privilegiados; usuário comum não se promove a platform_owner.
5. Chaves têm entropia adequada, aparecem uma vez e não são armazenadas em texto puro.
6. Testes cobrem validades 1/3/6/12 meses, ativação, limite de dispositivos, renovação, suspensão e revogação.
7. Cliente não consegue falsificar pagamento, plano, validade, papel ou entitlement.
8. Nenhum segredo no bundle, Git ou logs; CI, lint, testes e build aprovados.

## Prompt para executar no Lovable
> Crie o backend real do MS 3D Studio usando o Lovable Cloud/Supabase integrado. Configure banco, Auth, Storage privado e Edge Functions; não presuma que o banco já exista. Implemente workspaces multi-tenant com RLS e os papéis platform_owner, workspace_owner, workspace_admin, operator e viewer. Implemente cadastro, confirmação, login, recuperação, onboarding e convites. Implemente o ciclo completo de licenças: geração criptograficamente segura de chaves com 256 bits de entropia, hash com pepper no servidor, exibição única, validade de 1/3/6/12 meses, ativações/dispositivos, renovação, suspensão, revogação, validação online e tokens assinados para tolerância offline do Windows. Crie painel administrativo protegido com MFA. Não permita autoelevação de privilégios. Toda operação privilegiada deve ocorrer em Edge Functions/servidor; jamais exponha service role, pepper, chaves de assinatura ou segredos de pagamento ao frontend. Crie migrations, testes automatizados de RLS, papéis e licenças, e documentação de deploy. Preserve React + TypeScript + TanStack Start/Vite e o tema grafite MS. Primeiro audite o repositório e o backend já provisionado pelo Lovable; revise a migration de referência existente e amplie-a sem duplicar tabelas. Implemente em etapas e reporte resultados reais dos testes; não marque funcionalidades como concluídas sem validação.