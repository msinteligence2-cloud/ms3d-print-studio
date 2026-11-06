-- MS 3D Studio — Supabase production foundation
-- Apply through Supabase migrations. Never expose service_role keys in the browser.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index if not exists workspace_members_user_idx on public.workspace_members(user_id);

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_workspace_role(target_workspace uuid, allowed_roles text[])
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = (select auth.uid())
      and wm.role = any(allowed_roles)
  );
$$;

create table if not exists public.printers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  manufacturer text not null default 'Bambu Lab',
  model_code text,
  model_name text,
  firmware_version text,
  connection_kind text not null default 'lan' check (connection_kind in ('lan','cloud','demo')),
  status text not null default 'unknown' check (status in ('unknown','offline','online','printing','error')),
  capabilities jsonb not null default '{}'::jsonb,
  credential_reference text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists printers_workspace_idx on public.printers(workspace_id);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  description text,
  source_url text,
  creator_name text,
  license_label text,
  tags text[] not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_workspace_created_idx on public.projects(workspace_id, created_at desc);

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  original_name text not null,
  extension text not null check (lower(extension) in ('stl','3mf','obj','step','stp')),
  media_type text,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 262144000),
  object_path text not null unique,
  sha256 text,
  created_at timestamptz not null default now()
);
create index if not exists project_files_project_idx on public.project_files(project_id);

create table if not exists public.filaments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand text not null,
  material text not null check (material in ('PLA','PETG','ABS','ASA','TPU','PA','PC','OTHER')),
  color_name text not null,
  diameter_mm numeric(4,2) not null default 1.75 check (diameter_mm between 1 and 3),
  spool_weight_grams integer not null check (spool_weight_grams > 0),
  remaining_grams integer not null check (remaining_grams >= 0),
  purchase_price_cents integer not null check (purchase_price_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  printer_id uuid not null references public.printers(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  status text not null default 'queued' check (status in ('queued','preparing','printing','completed','failed','cancelled')),
  source text not null default 'manual' check (source in ('manual','desktop_agent','demo')),
  estimated_duration_seconds integer check (estimated_duration_seconds > 0),
  actual_duration_seconds integer check (actual_duration_seconds >= 0),
  estimated_filament_grams numeric(10,2) check (estimated_filament_grams > 0),
  actual_filament_grams numeric(10,2) check (actual_filament_grams >= 0),
  energy_kwh numeric(10,4) check (energy_kwh >= 0),
  energy_source text check (energy_source in ('measured','estimated','unknown')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists print_jobs_workspace_created_idx on public.print_jobs(workspace_id, created_at desc);

create table if not exists public.printer_telemetry (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  printer_id uuid not null references public.printers(id) on delete cascade,
  observed_at timestamptz not null,
  source text not null check (source in ('device','desktop_agent','demo','manual')),
  status text not null check (status in ('unknown','offline','online','printing','error')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists printer_telemetry_printer_time_idx on public.printer_telemetry(printer_id, observed_at desc);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plan_code text not null,
  term_months smallint not null check (term_months in (1,3,6,12)),
  status text not null check (status in ('pending','active','past_due','cancelled','expired')),
  provider text,
  provider_subscription_id text,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or starts_at is null or expires_at > starts_at)
);
create index if not exists subscriptions_workspace_idx on public.subscriptions(workspace_id,status,expires_at);

create table if not exists public.license_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  key_hash text not null unique,
  key_prefix text not null,
  status text not null check (status in ('active','revoked','expired')),
  activation_limit integer not null default 1 check (activation_limit between 1 and 100),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  workspace_id uuid references public.workspaces(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_workspace_time_idx on public.audit_events(workspace_id,created_at desc);

-- Profile bootstrap: a new auth user receives a profile only.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_ms3d on auth.users;
create trigger on_auth_user_created_ms3d
after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.printers enable row level security;
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.filaments enable row level security;
alter table public.print_jobs enable row level security;
alter table public.printer_telemetry enable row level security;
alter table public.subscriptions enable row level security;
alter table public.license_keys enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles_select_self" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "workspace_select_members" on public.workspaces for select to authenticated using (public.is_workspace_member(id) or owner_id = (select auth.uid()));
create policy "workspace_insert_owner" on public.workspaces for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "workspace_update_admin" on public.workspaces for update to authenticated using (public.has_workspace_role(id, array['owner','admin'])) with check (public.has_workspace_role(id, array['owner','admin']));
create policy "workspace_delete_owner" on public.workspaces for delete to authenticated using (owner_id = (select auth.uid()));

create policy "members_select_workspace" on public.workspace_members for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members_insert_admin" on public.workspace_members for insert to authenticated with check (public.has_workspace_role(workspace_id, array['owner','admin']));
create policy "members_update_admin" on public.workspace_members for update to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin'])) with check (public.has_workspace_role(workspace_id, array['owner','admin']));
create policy "members_delete_admin" on public.workspace_members for delete to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin']));

create policy "printers_read_members" on public.printers for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "printers_write_managers" on public.printers for all to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin','member'])) with check (public.has_workspace_role(workspace_id, array['owner','admin','member']));

create policy "projects_read_members" on public.projects for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "projects_write_members" on public.projects for all to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin','member'])) with check (public.has_workspace_role(workspace_id, array['owner','admin','member']));

create policy "project_files_read_members" on public.project_files for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "project_files_write_members" on public.project_files for all to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin','member'])) with check (public.has_workspace_role(workspace_id, array['owner','admin','member']));

create policy "filaments_read_members" on public.filaments for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "filaments_write_members" on public.filaments for all to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin','member'])) with check (public.has_workspace_role(workspace_id, array['owner','admin','member']));

create policy "jobs_read_members" on public.print_jobs for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "jobs_write_members" on public.print_jobs for all to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin','member'])) with check (public.has_workspace_role(workspace_id, array['owner','admin','member']));

create policy "telemetry_read_members" on public.printer_telemetry for select to authenticated using (public.is_workspace_member(workspace_id));
-- Telemetry writes are reserved for trusted server/desktop ingestion using service-role credentials.

create policy "subscriptions_read_members" on public.subscriptions for select to authenticated using (public.is_workspace_member(workspace_id));
-- Subscription mutations are server-only; payment status is never accepted from the browser.

create policy "license_keys_read_managers" on public.license_keys for select to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin']));
-- License creation, key rotation and revocation are server-only.

create policy "audit_read_managers" on public.audit_events for select to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin']));
-- Audit events are appended by trusted server functions only.

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('ms3d-project-files','ms3d-project-files',false,262144000,
  array['application/octet-stream','model/stl','application/vnd.ms-package.3dmanufacturing-3dmodel+xml','application/zip','application/sla'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create policy "ms3d_storage_read_members" on storage.objects for select to authenticated
using (bucket_id = 'ms3d-project-files' and public.is_workspace_member((storage.foldername(name))[1]::uuid));
create policy "ms3d_storage_upload_members" on storage.objects for insert to authenticated
with check (bucket_id = 'ms3d-project-files' and public.has_workspace_role((storage.foldername(name))[1]::uuid, array['owner','admin','member']));
create policy "ms3d_storage_update_members" on storage.objects for update to authenticated
using (bucket_id = 'ms3d-project-files' and public.has_workspace_role((storage.foldername(name))[1]::uuid, array['owner','admin','member']))
with check (bucket_id = 'ms3d-project-files' and public.has_workspace_role((storage.foldername(name))[1]::uuid, array['owner','admin','member']));
create policy "ms3d_storage_delete_managers" on storage.objects for delete to authenticated
using (bucket_id = 'ms3d-project-files' and public.has_workspace_role((storage.foldername(name))[1]::uuid, array['owner','admin']));
