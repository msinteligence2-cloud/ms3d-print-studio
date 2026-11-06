# MS3DPRINTING implementation status

This file separates implemented code from planned integrations. Update it with each delivery.

## Implemented in the current foundation
- Responsive dashboard prototype (its fleet/jobs/cost figures are demonstration data).
- Product and architecture specifications.
- Pure print-cost calculation for filament, estimated energy, machine overhead, and waste.
- Brazilian Real formatter and unit tests for the cost calculation.
- Interactive cost calculator route at `/calculadora`.
- Typed printer adapter contract and an explicitly simulated provider that cannot issue printer commands.
- License term types (1, 3, 6, 12 months), calendar-month expiry helper, and entitlement validity check.

## Not yet implemented / requires infrastructure or validation
- User authentication, database, cloud file storage, API deployment, and sync.
- Persistent STL/3MF/OBJ/STEP upload, thumbnails, and versioning.
- Real-time Bambu LAN discovery, MQTT/FTPS adapter, camera, upload, and print controls.
- Hardware power measurement and calibrated per-model energy profiles.
- MakerWorld or other project catalog integration using authorized interfaces.
- Payment checkout/webhooks and server-side license issuance/activation/revocation.
- Admin console, reporting exports, Windows Electron shell, code signing, and installer.
- End-to-end, hardware, security, and production deployment validation.

## Required acceptance checks before production
1. Build and lint pass in CI.
2. Cost formulas are reviewed against measured jobs and local electricity tariffs.
3. Each supported printer model/firmware passes read-only telemetry tests before controls are enabled.
4. Credentials are stored only in the OS vault and never logged.
5. Payment webhooks are signature-verified and idempotent.
6. License secrets are generated and hashed server-side; plaintext is shown once.
7. File uploads enforce type/size limits, malware scanning policy, and storage quotas.
8. Windows installer is signed and tested on clean Windows machines.
