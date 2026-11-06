# MS3DPRINTING infrastructure foundation

This repository now has the first local infrastructure scaffold. It is a development foundation, not a deployed production backend.

## Local database

Requirements: Docker Desktop with Docker Compose.

```bash
docker compose up -d postgres
docker compose ps
```

PostgreSQL listens only on loopback at `127.0.0.1:54329`. The initial SQL migration is mounted into the container initialization directory and runs only when the named volume is first created.

To reset local development data (destructive):

```bash
docker compose down -v
docker compose up -d postgres
```

Copy `.env.example` to `.env` for local application configuration. Never commit `.env`, production credentials, printer access codes, or payment secrets.

## Database model

The first migration creates account/workspace membership, subscriptions (1/3/6/12 months), printer inventory, provenance-aware telemetry, project metadata/files, and audit events. Project file bytes belong in object storage; the database stores object keys and metadata only.

The schema intentionally does not store printer access codes. `credential_reference` is an opaque pointer to a credential held by the Windows companion's OS vault, not a secret.

## Web and desktop boundary

- The hosted web app owns account, workspace, cloud library, reports and subscription views.
- The Windows companion owns LAN discovery, local printer credentials and device protocol sessions.
- The browser must not connect directly to private printer MQTT/FTPS endpoints.
- The desktop companion sends normalized telemetry to the account API only after pairing and authorization.
- Demo telemetry must remain distinguishable from real device telemetry.

## Next implementation slices

1. Select and configure the production identity provider and session strategy.
2. Add a migration runner and typed database repository layer.
3. Add API handlers for health, identity, workspace and printer metadata.
4. Add S3-compatible object storage with signed uploads/downloads and quotas.
5. Add desktop pairing and narrowly scoped device authorization.
6. Add subscription provider integration only after business plans/prices and webhook environment are configured.

No production database, API, object-storage bucket, authentication provider, payment provider, or cloud deployment is created by this scaffold.
