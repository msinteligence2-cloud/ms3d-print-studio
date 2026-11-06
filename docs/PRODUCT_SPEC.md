# MS3DPRINTING — Product Specification

## Product vision
MS3DPRINTING is a subscription-based 3D-print production workspace for makers, print farms, and small businesses. It combines a Windows desktop application for local printer operations with a web portal for account, library, costs, production history, and license management.

Bambu Lab printers are the first-class integration target. The product must use its own brand, interface, and implementation; Bambu Studio is a workflow reference, not a code or asset source.

## Clients
- **Windows Desktop (primary):** printer discovery, local device connection, monitoring, supported print controls, file transfer, local file access, slicing handoff, and full production workspace.
- **Web:** account and subscription management, synced library, project discovery, cost and production dashboards, reports, and license self-service.
- Both clients share the same account, API, permissions, and synchronized data model.

## Product modules
1. **Dashboard:** printer fleet, live jobs, queue, alerts, utilization, recent projects, monthly material/energy spend.
2. **Printers:** add/remove devices, LAN discovery, manual IP setup, model/firmware identity, online state, job state, temperatures, progress, camera where supported, AMS/tray information where supported, pause/resume/stop where supported.
3. **Production:** job queue, preflight, start/stop actions with confirmation, planned vs actual duration, print result, failure reason, job history.
4. **Cost calculator:** filament grams and price per kg; energy kWh and tariff per kWh; optional measured printer wattage or configurable model estimate; machine/hour overhead; labor and waste as optional fields. Show estimates separately from measured values.
5. **Materials:** filament catalog, brand, material, color, diameter, spool net weight, remaining weight, purchase price, supplier, lot, and compatible printer profiles.
6. **Library:** import STL, 3MF, OBJ, STEP and supported project formats; thumbnails, tags, folders, notes, version history, source URL, creator attribution, download date, and local/cloud file location.
7. **Project discovery:** searchable public model catalog; model detail, images, creator, license/attribution, print profiles, supported formats, and download to the user's library. Integrations must use documented/authorized APIs or permitted links and must respect platform terms and creator licenses.
8. **Reports:** cost per job, cost by printer/material/project, print hours, success rate, utilization, material consumption, export CSV/PDF.
9. **Subscription and licensing:** plans of 1, 3, 6, and 12 months; all four durations grant the same product feature set unless the business owner later defines otherwise. Each issued key has a unique ID, hashed secret, plan duration, issue/expiry dates, activation limit, status, and audit trail. Support revoke, renew, extend, and device/account binding.
10. **Admin console:** users, subscriptions, payments, license generation, bulk issuance, key lookup, revocation, usage metrics, audit events, and support tools.

## Cost calculation principles
- Filament cost = consumed grams / 1000 × configured price per kg.
- Energy cost = measured or estimated kWh × user's electricity tariff.
- Total direct cost = filament + energy. Optional labor, machine depreciation, maintenance, and waste are separate line items.
- A 3MF/G-code estimate is a prediction; actual filament/energy/time should be updated from printer telemetry or user-entered measurements where possible.
- Never present estimated power consumption as a measured value.

## Printer integration and safety
- Prefer documented vendor interfaces and explicit user authorization.
- LAN operations belong in the Windows desktop/local companion, not a cloud server attempting to reach a user's private network.
- Explain printer-side prerequisites, firmware/model support, LAN access code handling, and Developer Mode limitations.
- Store credentials in the OS secure credential vault; never in source code, logs, analytics, or browser local storage.
- Confirm potentially destructive actions (cancel print, delete file, calibration, movement).
- Treat printer state as untrusted telemetry and verify command outcomes by reading state again.

## Non-functional requirements
- Portuguese (Brazil) first, with localization-ready strings.
- Responsive web interface and Windows-native desktop packaging.
- Secure authentication, role-based authorization, encrypted transport, rate limits, audit logs, backups, and privacy controls.
- Graceful offline mode for local printing workflows; queue sync when online.
- Accessible UI, keyboard navigation, clear error states, and automated tests.
- No real payment, printer-control, or cloud-download capability may be advertised until the corresponding integration is configured and tested.

## Delivery milestones
1. Product foundation: brand system, navigation, responsive dashboard shell, shared domain types, seed/demo data.
2. Library and costing: file import metadata, folders/tags, filament catalog, estimates, reports.
3. Printer connectivity: Windows companion, LAN discovery, telemetry, supported commands, compatibility tests by model/firmware.
4. Project discovery: authorized catalog integrations, detail pages, download/import pipeline, license metadata.
5. Identity and subscription: authentication, checkout, webhook validation, subscription entitlements, signed/hashed license keys.
6. Windows release and web deployment: installer, auto-update strategy, signing, CI, monitoring, backup and release process.

## Open product decisions
- Payment provider and currencies (suggestion: Mercado Pago for Brazil, with Stripe as an optional international provider).
- Subscription price for each duration.
- Number of simultaneous printer connections and license activations.
- Cloud storage quota per account.
- Supported Bambu printer models and firmware baseline for first release.
- Whether non-Bambu printers are in scope after the first release.
