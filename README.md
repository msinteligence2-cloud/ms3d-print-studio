# MS3DPRINTING

A cross-platform 3D-print production platform: Windows desktop control center plus a synchronized web workspace for printer monitoring, project library, material and energy costing, production analytics, and subscription licensing.

## Product direction
Bambu Lab printers are the first integration target. The Windows desktop client will provide local printer connectivity and device workflows; the web client will provide account, library, reporting, subscription, and administration features.

See:
- [Product specification](docs/PRODUCT_SPEC.md)
- [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md)

## Current application
The repository currently contains the initial React 19 + TanStack Start starter. Product modules and device integrations are being developed in milestones. Printer control, payments, MakerWorld downloads, and licensing must not be treated as production-ready until implemented and tested against real services/devices.

## Development
Requirements: Node.js and Bun (the repository includes bun.lock).

```bash
bun install
bun run dev
bun run lint
bun run test
bun run build
```

## Security
Never commit secrets, printer access codes, API credentials, certificates, payment keys, or .env files. Use environment variables locally and a managed secret store in deployment.
