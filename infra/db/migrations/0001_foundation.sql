-- MS3DPRINTING initial relational foundation.
-- Applied automatically by the local Postgres container on first volume creation.
-- Production deployments must use a versioned migration runner and backups.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_provider text NOT NULL,
  auth_subject text NOT NULL,
  email text NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (auth_provider, auth_subject),
  UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_user_id uuid NOT NULL REFERENCES user_accounts(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_memberships (
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  plan_code text NOT NULL,
  term_months smallint NOT NULL CHECK (term_months IN (1, 3, 6, 12)),
  status text NOT NULL CHECK (status IN ('pending', 'active', 'past_due', 'cancelled', 'expired')),
  starts_at timestamptz,
  expires_at timestamptz,
  provider text,
  provider_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at IS NULL OR starts_at IS NULL OR expires_at > starts_at)
);
CREATE INDEX IF NOT EXISTS subscriptions_workspace_status_idx
  ON subscriptions (workspace_id, status, expires_at);

CREATE TABLE IF NOT EXISTS printers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  manufacturer text NOT NULL DEFAULT 'Bambu Lab',
  model_code text,
  model_name text,
  firmware_version text,
  connection_kind text NOT NULL DEFAULT 'lan' CHECK (connection_kind IN ('lan', 'cloud', 'demo')),
  status text NOT NULL DEFAULT 'unknown' CHECK (status IN ('unknown', 'offline', 'online', 'printing', 'error')),
  capabilities jsonb NOT NULL DEFAULT '{}'::jsonb,
  credential_reference text,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS printers_workspace_idx ON printers (workspace_id);

CREATE TABLE IF NOT EXISTS printer_telemetry (
  id bigserial PRIMARY KEY,
  printer_id uuid NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
  observed_at timestamptz NOT NULL,
  source text NOT NULL CHECK (source IN ('device', 'desktop_agent', 'demo', 'manual')),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS printer_telemetry_printer_time_idx
  ON printer_telemetry (printer_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  source_url text,
  creator_name text,
  license_label text,
  tags text[] NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES user_accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projects_workspace_created_idx
  ON projects (workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  original_name text NOT NULL,
  media_type text,
  extension text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  object_key text NOT NULL UNIQUE,
  sha256 text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id bigserial PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES user_accounts(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_events_workspace_time_idx
  ON audit_events (workspace_id, created_at DESC);
