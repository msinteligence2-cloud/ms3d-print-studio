# MS3DPRINTING — Technical Architecture

## Proposed architecture

### Clients
- **Web app:** existing React 19 + TanStack Start application.
- **Windows app:** Electron shell around the shared renderer, plus a privileged desktop service for local network discovery, secure credential storage, file access, and printer protocol adapters.
- **Local printer service:** isolated process/module with a narrow typed IPC contract. The renderer must never receive raw printer access codes or unrestricted Node APIs.

### Backend
- API service for identity, accounts, library metadata, subscriptions, license entitlements, catalog metadata, reports, and sync.
- PostgreSQL for relational data.
- Object storage for user project files and generated thumbnails.
- Background workers for thumbnail generation, metadata extraction, reports, and sync.
- Payment webhooks verified using provider signatures; never trust client-side payment success.

### Printer integration boundary
Define a provider interface such as:
- discover(): nearby supported devices
- connect(credentials): authenticated local session
- getStatus(): normalized telemetry
- uploadProject(file): transfer supported sliced project
- startJob(options): start only when supported and authorized
- pauseJob(), resumeJob(), cancelJob(): capability-gated controls
- disconnect()

Each printer adapter reports its capabilities and limitations. The first adapter targets Bambu Lab LAN workflows. Do not assume every model or firmware supports identical commands. The web app consumes normalized telemetry through the backend/local companion pairing flow; it does not connect directly to private LAN MQTT/FTPS endpoints.

### Security model
- Encrypt transport; use OS credential vault on Windows (for example Windows Credential Manager/DPAPI).
- Keep cloud tokens and signing secrets server-side.
- Hash license secrets at rest; show a generated key only once.
- Bind activations to account/device according to configurable limits.
- Validate subscription entitlements on the server for every protected API operation.
- Use short-lived sessions, refresh-token rotation, rate limits, audit logs, and webhook idempotency.
- Never commit .env files, certificates, printer access codes, API keys, or payment secrets.

## Initial domain entities
- User, Organization, Membership
- Subscription, Payment, Entitlement
- LicenseKey, LicenseActivation, DeviceInstallation
- Printer, PrinterCapability, PrinterCredentialReference, PrinterTelemetry
- PrintJob, PrintJobEvent, PrintEstimate, PrintActual
- Filament, Spool, MaterialConsumption
- Project, ProjectFile, ProjectFolder, ProjectTag, ProjectSource, ProjectDownload
- ElectricityTariff, CostProfile, CostLineItem
- AuditEvent

## Desktop packaging
Evaluate Electron + electron-builder for the first Windows installer because it can host the existing web renderer and expose a controlled Node service for LAN discovery and local files. Package x64 first; add ARM64 only after dependency validation. Sign production installers and establish an update channel before public distribution.

## Important integration constraints
- Bambu LAN control has model/firmware and printer-side authorization prerequisites. Implement capability detection and safe read-only fallback.
- MakerWorld discovery/download interfaces found in community reverse-engineered references are not guaranteed stable or officially supported. Keep catalog providers behind an adapter and use official/authorized interfaces, or open the original source page when direct download is not permitted.
- Energy telemetry may not be exposed consistently by every printer. Support smart-plug/meter integrations or configurable estimates, and label data provenance.
- Slicing is a separate capability. Initially allow opening/importing projects and handing sliced 3MF/G-code to supported printer workflows; do not claim a built-in slicer until a slicer engine is integrated and licensed.

## Development principles
- Build feature slices end-to-end with tests.
- Keep secrets out of Git and sample files.
- Preserve Lovable-managed database/configuration areas unless changes are made through the supported Lovable workflow.
- Do not rewrite published Git history.
