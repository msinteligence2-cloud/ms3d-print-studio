-- MS 3D Studio — access-control hardening
-- Apply after 20261106000100_ms3d_studio_foundation.sql.
-- No public/client policy can grant platform administration.

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null,
  note text
);
alter table public.platform_admins enable row level security;
-- Intentionally no client-facing policies. Provision platform admins only from
-- the Supabase SQL editor or a trusted, audited server-side operation.

create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.platform_admins pa
    where pa.user_id = auth.uid()
  );
$$;
revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;

-- Workspace membership is read-only from the browser. Member invitations,
-- role changes and removals must be performed by trusted Edge Functions that
-- validate the caller and write an audit event. This prevents self-promotion
-- and privilege escalation through permissive RLS policies.
drop policy if exists members_insert_admin on public.workspace_members;
drop policy if exists members_update_admin on public.workspace_members;
drop policy if exists members_delete_admin on public.workspace_members;

-- Remove direct client writes to billing and license records. These remain
-- server-owned; even workspace owners cannot forge a paid subscription.
drop policy if exists subscriptions_read_members on public.subscriptions;
create policy subscriptions_read_members on public.subscriptions
  for select to authenticated
  using (public.is_workspace_member(workspace_id) or public.is_platform_admin());

drop policy if exists license_keys_read_managers on public.license_keys;
create policy license_keys_read_managers on public.license_keys
  for select to authenticated
  using (
    public.has_workspace_role(workspace_id, array['owner','admin'])
    or public.is_platform_admin()
  );

drop policy if exists audit_read_managers on public.audit_events;
create policy audit_read_managers on public.audit_events
  for select to authenticated
  using (
    public.has_workspace_role(workspace_id, array['owner','admin'])
    or public.is_platform_admin()
  );

-- Platform staff may inspect profiles/workspaces through trusted Edge Functions.
-- No broad SELECT policy is added here: avoid exposing the global customer list
-- to every signed-in account.

-- Safe RPC for onboarding: creates a workspace for the current authenticated
-- user. The existing trigger enrolls the creator as workspace owner atomically.
create or replace function public.create_my_workspace(workspace_name text)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  new_workspace_id uuid;
  clean_name text := btrim(workspace_name);
begin
  if auth.uid() is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;
  if clean_name is null or char_length(clean_name) < 2 or char_length(clean_name) > 80 then
    raise exception 'invalid_workspace_name' using errcode = '22023';
  end if;

  insert into public.workspaces(name, owner_id)
  values (clean_name, auth.uid())
  returning id into new_workspace_id;

  return new_workspace_id;
end;
$$;
revoke all on function public.create_my_workspace(text) from public;
grant execute on function public.create_my_workspace(text) to authenticated;

-- Ensure workspace role checks cannot be confused by a caller-controlled search_path.
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = auth.uid()
  );
$$;

create or replace function public.has_workspace_role(target_workspace uuid, allowed_roles text[])
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
      and wm.role = any(allowed_roles)
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.has_workspace_role(uuid, text[]) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.has_workspace_role(uuid, text[]) to authenticated;

-- Profiles can only be read/updated by their owner; platform staff access
-- customer details through server functions with explicit audit logging.
