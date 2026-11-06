# Acesso de usuários e administração — preparação para publicação

## Estado real
Este conjunto endurece as políticas do banco e documenta o contrato de implantação. Ele **não significa que autenticação, painel administrativo ou operações de licenças já estejam integralmente implementados no frontend/backend**. A publicação depende de aplicar as migrations em um projeto Supabase/Lovable Cloud, configurar Auth, criar as Edge Functions descritas abaixo e executar os testes.

## Papéis
- Cliente: usuário autenticado vinculado a um workspace.
- workspace owner/admin: gestão do próprio workspace.
- operator: operação de recursos autorizados no workspace.
- viewer: leitura.
- platform admin: funcionário autorizado da MS Enterprise, cadastrado exclusivamente na tabela privada `platform_admins`.

Nunca usar metadata editável pelo usuário, endereço de e-mail isoladamente ou parâmetro vindo do navegador para conceder papel administrativo.

## O que a migration de hardening faz
- Cria `platform_admins` sem políticas de leitura/escrita para o cliente.
- Cria `is_platform_admin()` para verificações server-side/RLS.
- Remove escrita direta de memberships pelo browser para impedir autoelevação e alteração de papéis.
- Mantém subscriptions e license keys somente leitura, sem permitir que o cliente forje pagamentos/licenças.
- Adiciona `create_my_workspace()`, que cria workspace para a sessão atual e matricula o criador como owner pelo trigger já existente.
- Endurece as funções de verificação de membership com search_path fixo.

## Provisionamento inicial do administrador da plataforma
Depois de criar e confirmar a conta do responsável, um operador com acesso ao SQL Editor do Supabase deve executar uma vez, substituindo o UUID pelo ID real do usuário obtido no painel Auth:

```sql
insert into public.platform_admins (user_id, note)
values ('UUID-REAL-DO-USUARIO', 'Administrador inicial MS Enterprise')
on conflict (user_id) do nothing;
```

Não inserir esse UUID em arquivos versionados. Não criar endpoint público para inserir ou remover administradores. Remoção e concessão exigem acesso privilegiado ao projeto Supabase e registro operacional.

## Edge Functions obrigatórias antes de publicar
Implementar com validação JWT e autorização no servidor:
1. `admin-list-users`: somente platform admin; paginação, busca e campos mínimos; registrar consulta administrativa.
2. `admin-update-user`: bloquear autoelevação, validar transições, suspender/reativar conta quando suportado por Auth Admin API; auditar.
3. `workspace-invite`: owner/admin do workspace; convite de uso único, validade, papel permitido e aceite autenticado.
4. `workspace-membership-manage`: owner/admin; nunca permitir atribuir platform admin; impedir remover o último owner.
5. `license-issue`, `license-revoke`, `license-validate`: gerar segredo criptograficamente seguro, armazenar somente hash com pepper em Secret, exibir plaintext apenas uma vez, verificar expiração e limite de ativações.
6. `admin-audit-search`: somente platform admin, com paginação e trilha de auditoria.
7. `subscription-webhook`: validar assinatura, idempotência e origem do gateway; nunca aceitar confirmação do frontend.

Todas as funções devem rejeitar ausência de JWT, validar papel diretamente no banco e não confiar em role/workspace_id enviado pelo cliente. Service role e pepper nunca podem estar em variáveis VITE_ nem no bundle.

## Telas do produto que devem consumir essas funções
- /login: e-mail/senha, link para cadastro e recuperação.
- /cadastro: validação, confirmação de e-mail e onboarding.
- /recuperar-senha e /redefinir-senha.
- /conta: perfil, sessões e segurança.
- /admin: dashboard protegido para platform admin.
- /admin/usuarios: pesquisa, status e gestão de usuários.
- /admin/workspaces: consulta de workspaces e membros.
- /admin/licencas: emissão, renovação, suspensão e revogação.
- /admin/assinaturas: consulta de planos e pagamentos confirmados.
- /admin/auditoria: trilha de ações privilegiadas.

## Checklist de liberação
- [ ] Supabase/Lovable Cloud de produção criado e migrations aplicadas em ordem.
- [ ] E-mail SMTP/domínio de envio configurado e confirmação obrigatória testada.
- [ ] Redirect URLs de produção e recuperação configuradas.
- [ ] Primeiro platform admin provisionado fora do frontend.
- [ ] MFA obrigatório para platform admins.
- [ ] Edge Functions acima implementadas, com rate limit e logs redigidos.
- [ ] Testes com dois usuários e dois workspaces provam isolamento RLS.
- [ ] Teste negativo comprova que usuário comum não lista usuários globais nem se promove.
- [ ] Testes comprovam que cliente não altera assinatura, licença, papel ou pagamento via REST.
- [ ] Build, lint, testes e revisão de segurança aprovados.
- [ ] Política de privacidade, termos e canal LGPD publicados.

**Não publicar como sistema de autenticação/admin pronto enquanto qualquer item crítico estiver pendente.**
