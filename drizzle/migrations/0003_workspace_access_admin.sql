create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and char_length(email) between 3 and 254),
  role text not null check (role in ('admin','member','viewer','customer')),
  invited_by uuid not null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid
);
create unique index if not exists workspace_invites_open_uniq on public.workspace_invites(workspace_id, email) where accepted_at is null;
grant select on public.workspace_invites to authenticated;
grant all on public.workspace_invites to service_role;
alter table public.workspace_invites enable row level security;
create policy invites_select_staff on public.workspace_invites for select to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin']));

create or replace function public.my_staff_workspaces()
returns table(id uuid, name text, role text, accepts_customers boolean)
language sql stable security definer set search_path = pg_catalog, public as $$
  select w.id, w.name, m.role, w.accepts_customers from public.workspace_members m
  join public.workspaces w on w.id = m.workspace_id
  where m.user_id = auth.uid() and m.role in ('owner','admin') and m.suspended_at is null
  order by w.created_at;
$$;

create or replace function public.workspace_access_list(_workspace uuid)
returns table(user_id uuid, email text, display_name text, role text, suspended_at timestamptz, joined_at timestamptz)
language plpgsql stable security definer set search_path = pg_catalog, public as $$
begin
  if not public.has_workspace_role(_workspace, array['owner','admin']) then raise exception 'forbidden'; end if;
  return query select m.user_id, u.email::text, p.display_name, m.role, m.suspended_at, m.created_at
  from public.workspace_members m join auth.users u on u.id = m.user_id left join public.profiles p on p.id = m.user_id
  where m.workspace_id = _workspace order by (m.role = 'owner') desc, m.created_at desc;
end; $$;

create or replace function public.grant_workspace_access(_workspace uuid, _email text, _role text)
returns text language plpgsql security definer set search_path = pg_catalog, public as $$
declare clean text := lower(btrim(_email)); target uuid; current_role text; my_owner boolean;
begin
  if not public.has_workspace_role(_workspace, array['owner','admin']) then raise exception 'forbidden'; end if;
  if _role not in ('admin','member','viewer','customer') then raise exception 'invalid_role'; end if;
  my_owner := public.has_workspace_role(_workspace, array['owner']);
  if _role = 'admin' and not my_owner then raise exception 'only_owner_grants_admin'; end if;
  if clean is null or clean !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email'; end if;
  select u.id into target from auth.users u where lower(u.email) = clean and u.email_confirmed_at is not null limit 1;
  if target is null then
    insert into public.workspace_invites(workspace_id, email, role, invited_by) values (_workspace, clean, _role, auth.uid())
      on conflict (workspace_id, email) where accepted_at is null do update set role = excluded.role, invited_by = excluded.invited_by, created_at = now();
    perform public._audit(_workspace, 'access.invited', 'invite', clean, jsonb_build_object('role', _role));
    return 'invited';
  end if;
  if target = auth.uid() then raise exception 'cannot_change_self'; end if;
  select m.role into current_role from public.workspace_members m where m.workspace_id = _workspace and m.user_id = target;
  if current_role = 'owner' then raise exception 'cannot_change_owner'; end if;
  if current_role = 'admin' and not my_owner then raise exception 'only_owner_changes_admin'; end if;
  insert into public.workspace_members(workspace_id, user_id, role) values (_workspace, target, _role)
    on conflict (workspace_id, user_id) do update set role = excluded.role;
  perform public._audit(_workspace, 'access.granted', 'member', target::text, jsonb_build_object('role', _role, 'from', current_role));
  perform public._notify(_workspace, target, null, 'Acesso liberado', 'Seu acesso à oficina foi atualizado.');
  return 'granted';
end; $$;

create or replace function public.revoke_workspace_access(_workspace uuid, _user uuid)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare r text;
begin
  if not public.has_workspace_role(_workspace, array['owner','admin']) then raise exception 'forbidden'; end if;
  if _user = auth.uid() then raise exception 'cannot_change_self'; end if;
  select role into r from public.workspace_members where workspace_id = _workspace and user_id = _user;
  if r is null then raise exception 'not_a_member'; end if;
  if r = 'owner' then raise exception 'cannot_change_owner'; end if;
  if r = 'admin' and not public.has_workspace_role(_workspace, array['owner']) then raise exception 'only_owner_changes_admin'; end if;
  delete from public.workspace_members where workspace_id = _workspace and user_id = _user;
  perform public._audit(_workspace, 'access.revoked', 'member', _user::text, jsonb_build_object('role', r));
end; $$;

create or replace function public.set_member_suspended(_workspace uuid, _user uuid, _suspend boolean, _reason text default null)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare r text;
begin
  if not public.has_workspace_role(_workspace, array['owner','admin']) then raise exception 'forbidden'; end if;
  if _user = auth.uid() then raise exception 'cannot_change_self'; end if;
  select role into r from public.workspace_members where workspace_id = _workspace and user_id = _user;
  if r is null then raise exception 'not_a_member'; end if;
  if r = 'owner' then raise exception 'cannot_change_owner'; end if;
  if r = 'admin' and not public.has_workspace_role(_workspace, array['owner']) then raise exception 'only_owner_changes_admin'; end if;
  update public.workspace_members set suspended_at = case when _suspend then now() else null end,
    suspended_reason = case when _suspend then left(nullif(btrim(_reason),''),300) else null end
  where workspace_id = _workspace and user_id = _user;
  perform public._audit(_workspace, case when _suspend then 'access.suspended' else 'access.reactivated' end, 'member', _user::text, '{}');
end; $$;

create or replace function public.cancel_workspace_invite(_invite uuid)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare ws uuid;
begin
  select workspace_id into ws from public.workspace_invites where id = _invite and accepted_at is null;
  if ws is null or not public.has_workspace_role(ws, array['owner','admin']) then raise exception 'forbidden'; end if;
  delete from public.workspace_invites where id = _invite;
  perform public._audit(ws, 'access.invite_cancelled', 'invite', _invite::text, '{}');
end; $$;

create or replace function public.accept_my_invites()
returns integer language plpgsql security definer set search_path = pg_catalog, public as $$
declare my_email text; n int := 0; inv record;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  select lower(u.email) into my_email from auth.users u where u.id = auth.uid() and u.email_confirmed_at is not null;
  if my_email is null then return 0; end if;
  for inv in select * from public.workspace_invites where email = my_email and accepted_at is null for update loop
    insert into public.workspace_members(workspace_id, user_id, role) values (inv.workspace_id, auth.uid(), inv.role)
      on conflict (workspace_id, user_id) do nothing;
    update public.workspace_invites set accepted_at = now(), accepted_by = auth.uid() where id = inv.id;
    perform public._audit(inv.workspace_id, 'access.invite_accepted', 'invite', inv.id::text, jsonb_build_object('role', inv.role));
    n := n + 1;
  end loop;
  return n;
end; $$;

revoke all on function public.my_staff_workspaces() from public;
revoke all on function public.workspace_access_list(uuid) from public;
revoke all on function public.grant_workspace_access(uuid, text, text) from public;
revoke all on function public.revoke_workspace_access(uuid, uuid) from public;
revoke all on function public.set_member_suspended(uuid, uuid, boolean, text) from public;
revoke all on function public.cancel_workspace_invite(uuid) from public;
revoke all on function public.accept_my_invites() from public;
grant execute on function public.my_staff_workspaces() to authenticated;
grant execute on function public.workspace_access_list(uuid) to authenticated;
grant execute on function public.grant_workspace_access(uuid, text, text) to authenticated;
grant execute on function public.revoke_workspace_access(uuid, uuid) to authenticated;
grant execute on function public.set_member_suspended(uuid, uuid, boolean, text) to authenticated;
grant execute on function public.cancel_workspace_invite(uuid) to authenticated;
grant execute on function public.accept_my_invites() to authenticated;