# MS3DPRINTING implementation status

## Implemented
- Responsive dashboard prototype (fleet/jobs/cost figures are demonstration data).
- Product and architecture specifications.
- Print cost calculation and Brazilian Real formatter, with unit tests.
- Interactive calculator at `/calculadora`.
- Local project library at `/biblioteca` using IndexedDB for STL, 3MF, OBJ, STEP and STP.
- License term helpers for 1, 3, 6 and 12 months.
- Bambu model registry: A1 Mini, A1, P1P/P1S, X1/X1 Carbon/X1E, P2S, H2D/H2D Pro/H2S/H2C and X2D.
- Typed LAN transport boundary for the Windows companion; unknown models fail closed.
- Local infrastructure scaffold: PostgreSQL Compose service, initial relational migration, environment template, and Zod API contracts.
- Contract tests for API health, pagination, printer connection identifiers and telemetry provenance.
- A1 Mini is the first hardware reference target; print-control capabilities remain disabled until physical qualification.
- GitHub Actions CI for lint, tests and build.

## Not yet implemented / requires infrastructure or validation
- Authentication/session provider and production API handlers.
- Database connection pool, migration runner and repository layer (the SQL schema is a local bootstrap only).
- Cloud object storage, signed file transfer, quotas and sync.
- Cloud sync and 3D previews/thumbnails.
- Concrete Bambu SSDP discovery, MQTT/TLS and FTPS transport, camera, uploads and print controls.
- Windows Credential Manager/DPAPI and companion runtime.
- Real A1 Mini telemetry validation, then qualification for every additional model/firmware.
- Hardware power measurement and calibrated per-model energy profiles.
- Authorized project catalog integration.
- Payment checkout/webhooks and server-side license issuance/activation/revocation.
- Admin console, reporting exports, Windows Electron shell, code signing and installer.
- End-to-end, hardware, security and production deployment validation.

## Production acceptance
1. CI lint, tests and build pass.
2. Cost formulas are reviewed against measured jobs and local tariffs.
3. Each supported model/firmware passes read-only telemetry tests before controls are enabled.
4. Credentials are stored only in the OS vault and never logged.
5. Payment webhooks are signature-verified and idempotent.
6. License secrets are generated and hashed server-side; plaintext is shown once.
7. File uploads enforce type/size limits, malware scanning policy and quotas.
8. Windows installer is signed and tested on clean Windows machines.
