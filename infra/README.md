# MS 3D Studio — infraestrutura

Esta pasta contém a base local de desenvolvimento. Ela ainda não representa um backend publicado nem um ambiente de produção.

## Banco local

Requisitos: Docker Desktop com Docker Compose.

```bash
docker compose up -d postgres
docker compose ps
```

O PostgreSQL fica disponível somente em `127.0.0.1:54329`. As migrations em `infra/db/migrations` são executadas automaticamente apenas quando o volume nomeado é inicializado pela primeira vez. Em um banco já existente, aplique migrations novas com o futuro runner versionado; não apague o volume para simular atualização.

Para recriar os dados locais (operação destrutiva):

```bash
docker compose down -v
docker compose up -d postgres
```

Copie `.env.example` para `.env`. Nunca versione arquivos de ambiente, credenciais de produção, códigos de acesso de impressoras ou segredos de pagamento.

## Limites entre web e desktop

- A aplicação web gerencia conta, workspace, biblioteca em nuvem, relatórios e assinaturas.
- O companion Windows gerencia descoberta LAN, credenciais locais e sessões de protocolo da impressora.
- O navegador não deve conectar diretamente a endpoints MQTT/FTPS privados da rede local.
- O companion envia telemetria normalizada à API somente após pareamento e autorização.
- Dados de demonstração devem ser identificados separadamente de dados reais.

## Próximas entregas de infraestrutura

1. Provedor de identidade, sessões e autorização por workspace.
2. Pool PostgreSQL, runner de migrations e camada de repositórios.
3. Handlers de API para saúde, identidade, workspace, projetos e impressoras.
4. Storage compatível com S3, uploads/downloads assinados e cotas.
5. Pareamento desktop com autorização restrita por dispositivo.
6. Checkout, webhooks e emissão server-side de licenças após definição comercial.

Nenhum banco de produção, API pública, bucket, provedor de autenticação, gateway de pagamento ou deployment cloud foi criado por esta base local.
