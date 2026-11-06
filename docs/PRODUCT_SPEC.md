# MS 3D Studio — especificação do produto

## Visão
MS 3D Studio é um workspace de produção de impressão 3D por assinatura para makers, print farms e pequenas empresas. Combina aplicativo desktop Windows para operações locais com impressoras e portal web para conta, biblioteca, custos, histórico de produção e licenças.

Impressoras Bambu Lab são o primeiro alvo de integração. O produto terá identidade e implementação próprias; Bambu Studio é apenas referência de fluxo, não fonte de código ou ativos.

## Clientes
- **Desktop Windows:** descoberta e conexão local, monitoramento, controles qualificados, transferência de arquivos, acesso local, integração com fatiadores e workspace de produção.
- **Web:** conta, assinaturas, biblioteca sincronizada, descoberta de projetos, custos, dashboards, relatórios e autoatendimento de licenças.
- Ambos compartilham conta, API, permissões e modelo de dados.

## Módulos
1. Dashboard de frota, trabalhos, fila, alertas, utilização e custos.
2. Impressoras: cadastro, descoberta LAN, IP manual, modelo/firmware, status, temperaturas, progresso, câmera, AMS e bandejas conforme suporte.
3. Produção: fila, pré-verificação, ações confirmadas, duração planejada/real e histórico.
4. Custos: filamento, energia medida ou estimada, tarifa, máquina/hora, mão de obra e desperdício.
5. Materiais: catálogo, marca, material, cor, diâmetro, peso, saldo, preço e fornecedor.
6. Biblioteca: STL, 3MF, OBJ, STEP e formatos suportados; miniaturas, tags, pastas, notas, versões e origem.
7. Descoberta: catálogo de modelos com autoria, licença, perfis e download autorizado.
8. Relatórios: custos por trabalho/impressora/material, horas, taxa de sucesso, utilização e exportação.
9. Assinatura/licenças: períodos de 1, 3, 6 e 12 meses, ativação, renovação, extensão e revogação.
10. Administração: usuários, workspaces, assinaturas, pagamentos, emissão de licenças e auditoria.

## Regras de custo e segurança
- Custo de filamento = gramas consumidas / 1000 × preço por kg.
- Energia = kWh medidos ou estimados × tarifa configurada.
- Estimativas nunca podem ser apresentadas como medições reais.
- LAN e credenciais ficam no companion Windows; o navegador não acessa diretamente MQTT/FTPS privado.
- Segredos de impressoras ficam no cofre do sistema operacional, nunca em localStorage, logs ou analytics.
- Pagamentos só são reconhecidos após validação server-side de assinatura e idempotência de webhook.
- Controles físicos só são habilitados após qualificação do modelo/firmware.

## Marcos
1. Fundação: marca, navegação, dashboard responsivo, tipos compartilhados e dados demo.
2. Biblioteca e custos: metadados, pastas/tags, materiais, estimativas e relatórios.
3. Conectividade: companion Windows, descoberta LAN, telemetria e testes por modelo/firmware.
4. Descoberta: provedores autorizados e fluxo de importação.
5. Identidade e assinatura: autenticação, checkout, webhooks e licenças server-side.
6. Distribuição: instalador assinado, atualização, deploy web, monitoramento e backup.

## Decisões comerciais pendentes
Provedor e preços de pagamento, limite de impressoras/ativações, cotas de armazenamento, baseline de firmware e escopo de impressoras não Bambu.
