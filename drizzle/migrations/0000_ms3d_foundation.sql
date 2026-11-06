-- MS 3D Studio foundation (consolidated from repo migrations 20261106000100 + 000200, with syntax fix).
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  phone text,
  company text,
  address_line text,
  city text,
  state text,
  postal_code text,
  notify_in_app boolean not null default true,
  notify_email boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  owner_id uuid not null references auth.users(id) on delete restrict,
  accepts_customers boolean not null default true,
  protocol_prefix text not null default 'MS' check (protocol_prefix ~ '^[A-Z]{2,5}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Roles: owner (workspace_owner), admin (workspace_admin), member (operator), viewer, customer (portal client).
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member','viewer','customer')),
  suspended_at timestamptz,
  suspended_reason text,
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index if not exists workspace_members_user_idx on public.workspace_members(user_id);

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid,
  note text
);

create or replace function public.enroll_workspace_owner()
returns trigger language plpgsql security definer set search_path = pg_catalog, public
as $$
begin
  insert into public.workspace_members(workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (workspace_id, user_id) do update set role = 'owner';
  return new;
end;
$$;
drop trigger if exists on_workspace_created_enroll_owner on public.workspaces;
create trigger on_workspace_created_enroll_owner after insert on public.workspaces
for each row execute procedure public.enroll_workspace_owner();

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = pg_catalog, public
as $$ select exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid()); $$;

-- Staff membership (excludes customers and suspended accounts).
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public
as $$
  select exists (select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = auth.uid()
      and wm.role <> 'customer' and wm.suspended_at is null);
$$;

create or replace function public.has_workspace_role(target_workspace uuid, allowed_roles text[])
returns boolean language sql stable security definer set search_path = pg_catalog, public
as $$
  select exists (select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = auth.uid()
      and wm.role = any(allowed_roles) and wm.suspended_at is null);
$$;

create or replace function public.is_workspace_customer(target_workspace uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public
as $$
  select exists (select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = auth.uid()
      and wm.role = 'customer' and wm.suspended_at is null);
$$;

revoke all on function public.is_platform_admin() from public;
revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.has_workspace_role(uuid, text[]) from public;
revoke all on function public.is_workspace_customer(uuid) from public;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.has_workspace_role(uuid, text[]) to authenticated;
grant execute on function public.is_workspace_customer(uuid) to authenticated;

create table if not exists public.printers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  manufacturer text not null default 'Bambu Lab',
  model_code text, model_name text, firmware_version text,
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
  description text, source_url text, creator_name text, license_label text,
  tags text[] not null default '{}',
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  estimated_duration_seconds integer, actual_duration_seconds integer,
  estimated_filament_grams numeric(10,2), actual_filament_grams numeric(10,2),
  energy_kwh numeric(10,4),
  energy_source text check (energy_source in ('measured','estimated','unknown')),
  started_at timestamptz, completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plan_code text not null,
  term_months smallint not null check (term_months in (1,3,6,12)),
  status text not null check (status in ('pending','active','past_due','cancelled','expired')),
  provider text, provider_subscription_id text,
  starts_at timestamptz, expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  actor_id uuid,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_workspace_time_idx on public.audit_events(workspace_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), 120))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_ms3d on auth.users;
create trigger on_auth_user_created_ms3d after insert on auth.users
for each row execute procedure public.handle_new_user();

grant select, update on public.profiles to authenticated;
grant select on public.workspaces, public.workspace_members to authenticated;
grant update on public.workspaces to authenticated;
grant select, insert, update, delete on public.printers, public.projects, public.project_files, public.filaments, public.print_jobs to authenticated;
grant select on public.printer_telemetry, public.subscriptions, public.license_keys, public.audit_events to authenticated;
grant all on public.profiles, public.workspaces, public.workspace_members, public.platform_admins, public.printers, public.projects, public.project_files, public.filaments, public.print_jobs, public.printer_telemetry, public.subscriptions, public.license_keys, public.audit_events to service_role;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.platform_admins enable row level security;
alter table public.printers enable row level security;
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.filaments enable row level security;
alter table public.print_jobs enable row level security;
alter table public.printer_telemetry enable row level security;
alter table public.subscriptions enable row level security;
alter table public.license_keys enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select_self on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy workspace_select on public.workspaces for select to authenticated
  using (public.is_workspace_member(id) or public.is_workspace_customer(id));
create policy workspace_update_admin on public.workspaces for update to authenticated
  using (public.has_workspace_role(id, array['owner','admin'])) with check (public.has_workspace_role(id, array['owner','admin']));

create policy members_select_self on public.workspace_members for select to authenticated using (user_id = auth.uid());
create policy members_select_staff on public.workspace_members for select to authenticated using (public.is_workspace_member(workspace_id));

create policy printers_read on public.printers for select to authenticated using (public.is_workspace_member(workspace_id));
create policy printers_write on public.printers for all to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin','member'])) with check (public.has_workspace_role(workspace_id, array['owner','admin','member']));
create policy projects_read on public.projects for select to authenticated using (public.is_workspace_member(workspace_id));
create policy projects_write on public.projects for all to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin','member'])) with check (public.has_workspace_role(workspace_id, array['owner','admin','member']));
create policy project_files_read on public.project_files for select to authenticated using (public.is_workspace_member(workspace_id));
create policy project_files_write on public.project_files for all to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin','member'])) with check (public.has_workspace_role(workspace_id, array['owner','admin','member']));
create policy filaments_read on public.filaments for select to authenticated using (public.is_workspace_member(workspace_id));
create policy filaments_write on public.filaments for all to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin','member'])) with check (public.has_workspace_role(workspace_id, array['owner','admin','member']));
create policy jobs_read on public.print_jobs for select to authenticated using (public.is_workspace_member(workspace_id));
create policy jobs_write on public.print_jobs for all to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin','member'])) with check (public.has_workspace_role(workspace_id, array['owner','admin','member']));
create policy telemetry_read on public.printer_telemetry for select to authenticated using (public.is_workspace_member(workspace_id));
create policy subscriptions_read on public.subscriptions for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin());
create policy license_keys_read on public.license_keys for select to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin']) or public.is_platform_admin());
create policy audit_read on public.audit_events for select to authenticated using (public.has_workspace_role(workspace_id, array['owner','admin']) or public.is_platform_admin());

create or replace function public.create_my_workspace(workspace_name text)
returns uuid language plpgsql security definer set search_path = pg_catalog, public
as $$
declare new_id uuid; clean_name text := btrim(workspace_name);
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode = '28000'; end if;
  if clean_name is null or char_length(clean_name) < 2 or char_length(clean_name) > 80 then
    raise exception 'invalid_workspace_name' using errcode = '22023'; end if;
  insert into public.workspaces(name, owner_id) values (clean_name, auth.uid()) returning id into new_id;
  insert into public.audit_events(workspace_id, actor_id, action, resource_type, resource_id)
  values (new_id, auth.uid(), 'workspace.created', 'workspace', new_id::text);
  return new_id;
end;
$$;
revoke all on function public.create_my_workspace(text) from public;
grant execute on function public.create_my_workspace(text) to authenticated;