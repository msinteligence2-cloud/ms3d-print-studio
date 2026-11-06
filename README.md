# MS 3D Studio

Plataforma de gestão de impressão 3D para makers, oficinas e print farms. O produto terá um aplicativo desktop Windows para operações locais com impressoras e um portal web para conta, projetos, biblioteca sincronizada, custos, relatórios e assinaturas.

## O que já existe no código

- Dashboard web responsivo em português; números de frota, fila e custos são dados demonstrativos.
- Biblioteca local em `/biblioteca`: importa, lista, baixa e exclui STL, 3MF, OBJ, STEP e STP no IndexedDB do navegador atual (limite de 250 MB por arquivo).
- Calculadora em `/calculadora`: filamento, energia estimada, custo de máquina por hora e desperdício.
- Contratos tipados para impressoras e provedor de demonstração, sem comunicação física com hardware.
- Catálogo inicial de modelos Bambu, com A1 Mini como primeiro alvo de validação.
- Base local de infraestrutura: PostgreSQL via Docker Compose, migrations SQL e contratos Zod para API.
- GitHub Actions para lint, testes e build.

## O que ainda não está pronto

Autenticação e sessões, handlers de API de produção, conexão e repositórios do banco, sincronização e armazenamento em nuvem, miniaturas 3D, integração Bambu LAN real, controle de impressão, catálogo externo, pagamentos, emissão/ativação server-side de licenças, painel administrativo e instalador Windows.

A energia da calculadora é uma **estimativa**, não uma leitura real. Os dados do dashboard são ilustrativos. A infraestrutura em `infra/` é local; nenhum serviço de produção foi implantado.

## Documentação

- [Especificação do produto](docs/PRODUCT_SPEC.md)
- [Arquitetura técnica](docs/TECHNICAL_ARCHITECTURE.md)
- [Status de implementação](docs/IMPLEMENTATION_STATUS.md)
- [Infraestrutura local](infra/README.md)
- [Aplicativo Windows](desktop/README.md)

## Desenvolvimento

Requisitos: Bun e Node.js compatível com as dependências. Docker Desktop para banco local.

```bash
bun install
bun run dev
bun run lint
bun run test
bun run build
docker compose up -d postgres
```

## Segurança

Nunca versione senhas, tokens, códigos de acesso, certificados ou segredos de pagamento. Credenciais de impressora devem ficar no cofre seguro do Windows. Não habilite controles de hardware sem qualificar modelo, firmware e permissões.
