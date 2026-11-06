# MS 3D Studio — status de implementação

## Implementado
- Dashboard responsivo em português (frota, fila e custos são demonstração).
- Especificação de produto e arquitetura.
- Cálculo de custos e formatação em Real com testes.
- Calculadora em `/calculadora`.
- Biblioteca local IndexedDB em `/biblioteca` para STL, 3MF, OBJ, STEP e STP.
- Regras de duração de licença para 1, 3, 6 e 12 meses.
- Registro de modelos Bambu e contrato LAN tipado para o futuro companion Windows.
- PostgreSQL local via Compose, migration relacional inicial, template de ambiente e contratos Zod de API.
- CI GitHub Actions para lint, testes e build.

## Ainda não implementado
- Provedor de autenticação, sessões, handlers de API e autorização.
- Pool de banco, runner de migrations e repositórios.
- Storage cloud, uploads assinados, cotas e sincronização.
- Companion Windows, vault de credenciais e transporte Bambu LAN real.
- Telemetria A1 Mini validada em hardware e qualificação de outros modelos/firmwares.
- Integração de catálogo autorizado, pagamentos, webhooks e licenças server-side.
- Painel administrativo, relatórios exportáveis, instalador assinado e deploy de produção.

## Critérios de produção
CI verde; custos comparados com trabalhos medidos; telemetria somente após teste físico; credenciais no vault; webhooks assinados/idempotentes; uploads com validação e cotas; instalador assinado e testado em Windows limpo.
