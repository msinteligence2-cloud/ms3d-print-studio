# Lovable handoff — MS 3D Studio

## Objetivo

Use este repositório como fonte do produto **MS 3D Studio**. Preserve a identidade visual da MS Enterprise: tema escuro grafite, vermelho `#ED1018`, azul `#0750A6`, títulos Barlow Condensed e texto Inter.

## Stack existente

- React 19 + TypeScript
- TanStack Start / TanStack Router (file-based routes)
- Vite com configuração gerenciada por `@lovable.dev/vite-tanstack-config`
- Tailwind CSS 4
- Zod para validação de contratos
- Vitest para testes
- Bun como package manager e `bun.lock` versionado

**Importante:** não converta o projeto para Next.js, não crie `src/pages`, não substitua o roteador e não remova `vite.config.ts`. As rotas estão em `src/routes`. Preserve a integração do Lovable já presente no Vite config.

## Como importar e iniciar

1. Importe/conecte o repositório GitHub `msinteligence2-cloud/ms3d-print-studio` no Lovable.
2. Trabalhe na branch `feature/ms3dprinting-foundation` enquanto o PR #1 não for aprovado.
3. Configure o projeto Supabase pelo fluxo oficial de integração do Lovable ou conecte o projeto Supabase existente.
4. Aplique migrations versionadas em `supabase/migrations` pelo fluxo Supabase/Lovable. Não cole service-role keys no frontend.
5. Configure somente as variáveis públicas necessárias no ambiente web:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Rode instalação, lint, testes e build. Não ignore erros de tipo, lint ou build para publicar.
7. Configure domínio e ambientes de preview/produção separadamente.

## Regras de arquitetura

- O navegador usa somente a chave anon/public do Supabase e sessão do usuário; RLS é obrigatória.
- Service role, chaves de pagamento, assinatura de webhook, chaves de licença e segredos ficam apenas em Edge Functions/servidor.
- Toda tabela com dados de workspace deve ter RLS e validar associação/role no banco.
- Não confie em workspace_id enviado pelo cliente sem validar membership.
- Não confie em sucesso de pagamento enviado pelo cliente; validar assinatura e idempotência do webhook no servidor.
- Nunca salve código de acesso da impressora em tabela, localStorage, analytics ou logs.
- A conexão LAN Bambu fica no companion Windows, nunca no browser.
- Telemetria deve identificar origem: device, desktop_agent, demo ou manual.
- Indicadores demonstrativos precisam de rótulo explícito; não misture demo com dados reais.
- Biblioteca cloud usa bucket privado e URLs assinadas com validade curta.
- Arquivos aceitos inicialmente: STL, 3MF, OBJ, STEP e STP; validar tamanho, extensão e MIME no servidor.

## Ordem de implementação obrigatória

1. Autenticação (cadastro, login, recuperação, sessão e logout).
2. Onboarding: criar workspace e membership owner de forma transacional/segura.
3. Layout autenticado, navegação responsiva e guardas de rota.
4. CRUD de impressoras, materiais/carretéis, projetos e trabalhos.
5. Biblioteca privada: upload/download assinado, metadados, tags, pastas, limites e exclusão.
6. Custos: filamento, energia (medida ou estimada), máquina/hora, desperdício; registrar origem e unidade.
7. Dashboard alimentado por consultas reais e estados vazios/loading/error; remover números fictícios quando não houver dados.
8. Relatórios exportáveis e filtros de período.
9. Assinaturas e licenças com Edge Functions, webhooks assinados e trilha de auditoria.
10. Admin protegido por role e logs.
11. Integração desktop pareada, telemetria read-only e depois comandos capability-gated por firmware/modelo.
12. E2E, acessibilidade, responsividade, performance, segurança, backup e publicação.

## Critérios para considerar pronto

- Build de produção e CI verdes.
- Testes unitários e fluxos E2E críticos.
- RLS testada com dois workspaces/usuários diferentes.
- Nenhum segredo no bundle, Git, localStorage ou logs.
- Upload privado testado com arquivos válidos, inválidos e acima do limite.
- Webhooks idempotentes e assinatura validada.
- Teste de recuperação de conta, autorização e revogação.
- Sem dados demonstrativos apresentados como telemetria real.
- Impressoras físicas testadas por modelo e versão de firmware.
- Documentação de deploy, rollback, backup e suporte.

## Prompt inicial para o Lovable

> Continue o MS 3D Studio a partir do código existente. Primeiro audite a estrutura e execute install, lint, tests e build. Não reescreva o projeto nem troque TanStack Start por Next.js. Preserve o tema grafite, a identidade MS Enterprise, Barlow Condensed e Inter. Integre Supabase usando a migration versionada existente, implemente autenticação e onboarding seguro com workspace owner. Faça as telas usarem dados reais com loading, empty e error states; não invente telemetria. Siga as etapas e critérios deste documento, implementando feature slices com testes. Não implemente conexão LAN de impressora no browser nem exponha service-role ou segredos. Antes de cada etapa, liste arquivos alterados e critérios de aceite; ao terminar, rode os comandos de qualidade e reporte o resultado real.

## Estado conhecido

A base atual tem dashboard demonstrativo, biblioteca local IndexedDB, calculadora e contratos/catálogo Bambu. Não possui ainda backend completo, autenticação, sincronização cloud, integração Bambu LAN física, pagamento ou instalador Windows. Esta pasta é um roteiro de integração, não uma declaração de que esses serviços já estão implantados.


## Acesso de usuários e painel administrativo

Consulte também:
- `docs/LOVABLE_BACKEND_ACCESS_LICENSES.md` — modelo de contas, papéis, licenças e backend.
- `docs/ACCESS_ADMIN_RELEASE_READINESS.md` — hardening de RLS, provisionamento seguro do primeiro administrador e checklist de publicação.
- `supabase/migrations/20261106000200_ms3d_access_control_hardening.sql` — migration complementar que deve ser aplicada após a migration `20261106000100`.

A migration complementar bloqueia escrita direta de memberships pelo navegador, cria a tabela privada `platform_admins` e o RPC de criação de workspace. Isso é uma fundação de segurança do banco, não substitui as Edge Functions de administração, convite e licenciamento nem as telas de autenticação/admin. Implemente e teste esses componentes antes de publicar.
