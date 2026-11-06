# MS3DPRINTING

Plataforma de gestão de impressão 3D para oficinas e print farms: painel web, biblioteca de projetos, estimativa de custos e futura integração local com impressoras Bambu Lab.

## Funcionalidades já disponíveis no código

- Dashboard inicial responsivo em português (os números de frota, fila e custos ainda são dados de demonstração).
- **Biblioteca local** em `/biblioteca`: importa, lista, baixa e exclui arquivos STL, 3MF, OBJ, STEP e STP no IndexedDB do navegador atual. Limite: 250 MB por arquivo.
- **Calculadora de custos** em `/calculadora`: filamento, energia estimada pela potência configurada, custo de máquina por hora e desperdício.
- Contratos TypeScript para adaptadores de impressora e provedor de demonstração sem comunicação com hardware.
- Funções de domínio e testes para cálculo de custo e datas/entitlements de licença.
- GitHub Actions para lint, testes e build.

## O que ainda não está pronto

Autenticação e banco de dados, sincronização e armazenamento em nuvem, miniaturas 3D, integração Bambu LAN real, controle de impressão, catálogo externo de projetos, pagamentos, geração/ativação de chaves no servidor, painel administrativo e instalador Windows. O diretório `desktop/` documenta a arquitetura futura; ainda não contém um instalador executável.

A energia da calculadora é uma **estimativa**, não uma leitura do consumo real. Os dados exibidos no dashboard são ilustrativos.

## Documentação

- [Especificação do produto](docs/PRODUCT_SPEC.md)
- [Arquitetura técnica](docs/TECHNICAL_ARCHITECTURE.md)
- [Status de implementação](docs/IMPLEMENTATION_STATUS.md)
- [Arquitetura do aplicativo Windows](desktop/README.md)

## Desenvolvimento

Requisitos: Bun e Node.js compatível com as dependências do projeto.

```bash
bun install
bun run dev
bun run lint
bun run test
bun run build
```

## Segurança

Nunca versione senhas, tokens, códigos de acesso de impressoras, certificados ou segredos de pagamento. Credenciais de impressora devem ficar no cofre seguro do sistema operacional Windows. Não habilite controle de hardware sem qualificar modelo, firmware e permissões da impressora.
