-- Oficina + Portal do Cliente
create table public.service_plans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 80),
  description text check (char_length(description) <= 2000),
  price_cents integer not null check (price_cents >= 0 and price_cents <= 100000000),
  billing_interval text not null check (billing_interval in ('monthly','quarterly','semiannual','yearly')),
  benefits text[] not null default '{}',
  monthly_request_limit integer check (monthly_request_limit is null or monthly_request_limit >= 0),
  monthly_grams_limit integer check (monthly_grams_limit is null or monthly_grams_limit >= 0),
  discount_percent numeric(5,2) not null default 0 check (discount_percent between 0 and 100),
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index service_plans_ws_idx on public.service_plans(workspace_id, sort_order);

create table public.service_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  customer_id uuid not null,
  plan_id uuid not null references public.service_plans(id) on delete restrict,
  plan_name text not null,
  price_cents integer not null,
  billing_interval text not null,
  status text not null default 'pending' check (status in ('pending','active','past_due','cancelled','expired')),
  payment_provider text,
  payment_reference text,
  starts_at timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index service_subscriptions_customer_idx on public.service_subscriptions(workspace_id, customer_id, status);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  customer_id uuid not null,
  seq integer not null,
  protocol text not null,
  title text not null check (char_length(btrim(title)) between 3 and 120),
  description text not null check (char_length(description) between 10 and 5000),
  quantity integer not null check (quantity between 1 and 10000),
  material text not null check (material in ('PLA','PETG','ABS','TPU','ASA','RESINA','OUTRO')),
  color text check (char_length(color) <= 60),
  dimensions text check (char_length(dimensions) <= 120),
  purpose text check (char_length(purpose) <= 300),
  desired_date date,
  notes text check (char_length(notes) <= 2000),
  delivery_method text not null default 'retirada' check (delivery_method in ('retirada','envio')),
  delivery_address text check (char_length(delivery_address) <= 400),
  status text not null default 'recebido' check (status in ('recebido','em_analise','aguardando_informacoes','orcamento_enviado','aguardando_aprovacao','aguardando_pagamento','aprovado','em_producao','pos_processamento','pronto','concluido','cancelado')),
  priority text not null default 'normal' check (priority in ('baixa','normal','alta','urgente')),
  assignee_id uuid,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, seq),
  unique (protocol)
);
create index service_requests_ws_status_idx on public.service_requests(workspace_id, status, created_at desc);
create index service_requests_customer_idx on public.service_requests(customer_id, created_at desc);

create table public.service_request_files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  request_id uuid not null references public.service_requests(id) on delete cascade,
  uploaded_by uuid not null,
  original_name text not null check (char_length(original_name) between 1 and 200),
  extension text not null check (extension in ('stl','3mf','obj','step','stp','png','jpg','jpeg','pdf')),
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 52428800),
  object_path text not null unique,
  created_at timestamptz not null default now()
);
create index service_request_files_req_idx on public.service_request_files(request_id);

create table public.service_request_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  request_id uuid not null references public.service_requests(id) on delete cascade,
  author_id uuid not null,
  author_name text,
  author_is_staff boolean not null default false,
  visibility text not null default 'customer' check (visibility in ('customer','internal')),
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  file_id uuid references public.service_request_files(id) on delete set null,
  created_at timestamptz not null default now()
);
create index service_request_messages_req_idx on public.service_request_messages(request_id, created_at);

create table public.service_request_events (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  request_id uuid not null references public.service_requests(id) on delete cascade,
  actor_id uuid,
  kind text not null,
  from_status text,
  to_status text,
  note text,
  visible_to_customer boolean not null default true,
  created_at timestamptz not null default now()
);
create index service_request_events_req_idx on public.service_request_events(request_id, created_at);

create table public.service_quotes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  request_id uuid not null references public.service_requests(id) on delete cascade,
  version integer not null,
  status text not null default 'sent' check (status in ('sent','approved','rejected','superseded','expired')),
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  tax_percent numeric(5,2) not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null,
  valid_until date,
  lead_time_days integer,
  message text,
  snapshot jsonb not null,
  created_by uuid not null,
  decided_by uuid,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now(),
  unique (request_id, version)
);

create table public.service_quote_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  quote_id uuid not null references public.service_quotes(id) on delete cascade,
  kind text not null check (kind in ('material','maquina','mao_de_obra','acabamento','embalagem','frete','outro')),
  description text not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price_cents numeric(14,4) not null check (unit_price_cents >= 0),
  total_cents integer not null,
  position integer not null default 0
);

create table public.customer_notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null,
  request_id uuid references public.service_requests(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index customer_notifications_user_idx on public.customer_notifications(user_id, created_at desc);

create table public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  customer_id uuid,
  request_id uuid references public.service_requests(id) on delete cascade,
  author_id uuid not null default auth.uid(),
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  check (customer_id is not null or request_id is not null)
);

-- Grants
grant select on public.service_plans, public.service_subscriptions, public.service_requests, public.service_request_files, public.service_request_events, public.service_quotes, public.service_quote_items to authenticated;
grant insert, update, delete on public.service_plans to authenticated;
grant select, insert on public.service_request_messages to authenticated;
grant select, update on public.customer_notifications to authenticated;
grant select, insert, delete on public.internal_notes to authenticated;
grant all on public.service_plans, public.service_subscriptions, public.service_requests, public.service_request_files, public.service_request_messages, public.service_request_events, public.service_quotes, public.service_quote_items, public.customer_notifications, public.internal_notes to service_role;

alter table public.service_plans enable row level security;
alter table public.service_subscriptions enable row level security;
alter table public.service_requests enable row level security;
alter table public.service_request_files enable row level security;
alter table public.service_request_messages enable row level security;
alter table public.service_request_events enable row level security;
alter table public.service_quotes enable row level security;
alter table public.service_quote_items enable row level security;
alter table public.customer_notifications enable row level security;
alter table public.internal_notes enable row level security;

create or replace function public.owns_request(_request uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public
as $$ select exists (select 1 from public.service_requests r where r.id = _request and r.customer_id = auth.uid() and public.is_workspace_customer(r.workspace_id)); $$;
revoke all on function public.owns_request(uuid) from public;
grant execute on function public.owns_request(uuid) to authenticated;

create policy plans_read on public.service_plans for select to authenticated
  using (public.is_workspace_member(workspace_id) or (is_visible and public.is_workspace_customer(workspace_id)));
create policy plans_write on public.service_plans for all to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin']))
  with check (public.has_workspace_role(workspace_id, array['owner','admin']));

create policy subs_read on public.service_subscriptions for select to authenticated
  using (public.is_workspace_member(workspace_id) or (customer_id = auth.uid() and public.is_workspace_customer(workspace_id)));

create policy requests_read on public.service_requests for select to authenticated
  using (public.is_workspace_member(workspace_id) or (customer_id = auth.uid() and public.is_workspace_customer(workspace_id)));

create policy files_read on public.service_request_files for select to authenticated
  using (public.is_workspace_member(workspace_id) or public.owns_request(request_id));

create policy messages_read on public.service_request_messages for select to authenticated
  using (public.is_workspace_member(workspace_id) or (visibility = 'customer' and public.owns_request(request_id)));
create policy messages_insert on public.service_request_messages for insert to authenticated
  with check (
    (public.has_workspace_role(workspace_id, array['owner','admin','member']))
    or (visibility = 'customer' and public.owns_request(request_id))
  );

create policy events_read on public.service_request_events for select to authenticated
  using (public.is_workspace_member(workspace_id) or (visible_to_customer and public.owns_request(request_id)));

create policy quotes_read on public.service_quotes for select to authenticated
  using (public.is_workspace_member(workspace_id) or public.owns_request(request_id));
create policy quote_items_read on public.service_quote_items for select to authenticated
  using (public.is_workspace_member(workspace_id) or exists (select 1 from public.service_quotes q where q.id = quote_id and public.owns_request(q.request_id)));

create policy notif_read on public.customer_notifications for select to authenticated using (user_id = auth.uid());
create policy notif_update on public.customer_notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy notes_read on public.internal_notes for select to authenticated using (public.is_workspace_member(workspace_id));
create policy notes_insert on public.internal_notes for insert to authenticated
  with check (author_id = auth.uid() and public.has_workspace_role(workspace_id, array['owner','admin','member']));
create policy notes_delete on public.internal_notes for delete to authenticated
  using (author_id = auth.uid() or public.has_workspace_role(workspace_id, array['owner','admin']));

-- Staff can read profiles of people in their workspace
create policy profiles_select_staff on public.profiles for select to authenticated
  using (exists (select 1 from public.workspace_members m where m.user_id = profiles.id and public.is_workspace_member(m.workspace_id)));

-- Notification only touches read_at
create or replace function public.guard_notification_update()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if new.user_id <> old.user_id or new.title <> old.title or coalesce(new.body,'') <> coalesce(old.body,'')
     or new.request_id is distinct from old.request_id or new.workspace_id <> old.workspace_id then
    raise exception 'only_read_at_editable';
  end if;
  return new;
end; $$;
create trigger notif_guard before update on public.customer_notifications for each row execute procedure public.guard_notification_update();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = pg_catalog as $$ begin new.updated_at = now(); return new; end; $$;
create trigger plans_touch before update on public.service_plans for each row execute procedure public.touch_updated_at();
create trigger requests_touch before update on public.service_requests for each row execute procedure public.touch_updated_at();
create trigger subs_touch before update on public.service_subscriptions for each row execute procedure public.touch_updated_at();
create trigger profiles_touch before update on public.profiles for each row execute procedure public.touch_updated_at();

-- Helpers
create or replace function public._notify(_ws uuid, _user uuid, _req uuid, _title text, _body text)
returns void language sql security definer set search_path = pg_catalog, public as $$
  insert into public.customer_notifications(workspace_id, user_id, request_id, title, body) values (_ws, _user, _req, _title, _body);
$$;
create or replace function public._audit(_ws uuid, _action text, _type text, _id text, _meta jsonb)
returns void language sql security definer set search_path = pg_catalog, public as $$
  insert into public.audit_events(workspace_id, actor_id, action, resource_type, resource_id, metadata) values (_ws, auth.uid(), _action, _type, _id, coalesce(_meta,'{}'::jsonb));
$$;
revoke all on function public._notify(uuid,uuid,uuid,text,text) from public, authenticated;
revoke all on function public._audit(uuid,text,text,text,jsonb) from public, authenticated;

-- Message trigger: authorship + server timestamp + auto status
create or replace function public.prepare_message()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.service_requests; staff boolean;
begin
  select * into r from public.service_requests where id = new.request_id;
  if r.id is null then raise exception 'request_not_found'; end if;
  new.workspace_id := r.workspace_id;
  new.author_id := auth.uid();
  new.created_at := now();
  new.body := btrim(new.body);
  staff := public.is_workspace_member(r.workspace_id);
  new.author_is_staff := staff;
  if not staff then new.visibility := 'customer'; end if;
  select coalesce(p.display_name, 'Usuário') into new.author_name from public.profiles p where p.id = auth.uid();
  if new.file_id is not null and not exists (select 1 from public.service_request_files f where f.id = new.file_id and f.request_id = r.id) then
    raise exception 'invalid_file';
  end if;
  if r.status in ('concluido','cancelado') and not staff then raise exception 'request_closed'; end if;
  return new;
end; $$;
create trigger messages_prepare before insert on public.service_request_messages for each row execute procedure public.prepare_message();

create or replace function public.after_message()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.service_requests;
begin
  select * into r from public.service_requests where id = new.request_id;
  if new.author_is_staff and new.visibility = 'customer' then
    perform public._notify(r.workspace_id, r.customer_id, r.id, 'Nova mensagem da oficina', r.protocol || ' — ' || r.title);
  elsif not new.author_is_staff and r.status = 'aguardando_informacoes' then
    update public.service_requests set status = 'em_analise' where id = r.id;
    insert into public.service_request_events(workspace_id, request_id, actor_id, kind, from_status, to_status, note)
    values (r.workspace_id, r.id, auth.uid(), 'status', 'aguardando_informacoes', 'em_analise', 'Cliente respondeu');
  end if;
  return new;
end; $$;
create trigger messages_after after insert on public.service_request_messages for each row execute procedure public.after_message();

-- Workshop discovery and enrollment
create or replace function public.list_open_workshops()
returns table(id uuid, name text) language sql stable security definer set search_path = pg_catalog, public as $$
  select w.id, w.name from public.workspaces w where w.accepts_customers order by w.created_at limit 50;
$$;
create or replace function public.join_workshop(_workspace uuid)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if not exists (select 1 from public.workspaces where id = _workspace and accepts_customers) then raise exception 'workshop_unavailable'; end if;
  if exists (select 1 from public.workspace_members where workspace_id = _workspace and user_id = auth.uid()) then return; end if;
  insert into public.workspace_members(workspace_id, user_id, role) values (_workspace, auth.uid(), 'customer');
  perform public._audit(_workspace, 'customer.joined', 'member', auth.uid()::text, '{}');
end; $$;

-- Create request
create or replace function public.create_service_request(_workspace uuid, _data jsonb)
returns table(id uuid, protocol text) language plpgsql security definer set search_path = pg_catalog, public as $$
declare next_seq int; prefix text; new_id uuid; proto text;
begin
  if not public.is_workspace_customer(_workspace) then raise exception 'not_a_customer'; end if;
  select w.protocol_prefix into prefix from public.workspaces w where w.id = _workspace for update;
  select coalesce(max(r.seq),0)+1 into next_seq from public.service_requests r where r.workspace_id = _workspace;
  proto := prefix || '-' || to_char(now(),'YYYY') || '-' || lpad(next_seq::text, 5, '0');
  insert into public.service_requests(workspace_id, customer_id, seq, protocol, title, description, quantity, material, color, dimensions, purpose, desired_date, notes, delivery_method, delivery_address)
  values (_workspace, auth.uid(), next_seq, proto,
    btrim(_data->>'title'), btrim(_data->>'description'), (_data->>'quantity')::int, _data->>'material',
    nullif(btrim(_data->>'color'),''), nullif(btrim(_data->>'dimensions'),''), nullif(btrim(_data->>'purpose'),''),
    nullif(_data->>'desired_date','')::date, nullif(btrim(_data->>'notes'),''),
    coalesce(_data->>'delivery_method','retirada'), nullif(btrim(_data->>'delivery_address'),''))
  returning service_requests.id into new_id;
  insert into public.service_request_events(workspace_id, request_id, actor_id, kind, to_status, note)
  values (_workspace, new_id, auth.uid(), 'created', 'recebido', 'Solicitação recebida');
  perform public._audit(_workspace, 'request.created', 'service_request', new_id::text, jsonb_build_object('protocol', proto));
  return query select new_id, proto;
end; $$;

-- Register uploaded file (object already uploaded under {ws}/{request}/...)
create or replace function public.register_request_file(_request uuid, _path text, _name text, _size bigint, _mime text)
returns uuid language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.service_requests; ext text; new_id uuid; allowed_mime text[] := array['application/octet-stream','model/stl','application/sla','application/vnd.ms-pki.stl','model/3mf','application/vnd.ms-package.3dmanufacturing-3dmodel+xml','application/zip','model/obj','text/plain','application/step','model/step','application/x-step','image/png','image/jpeg','application/pdf'];
begin
  select * into r from public.service_requests where id = _request;
  if r.id is null then raise exception 'request_not_found'; end if;
  if not (public.owns_request(_request) or public.has_workspace_role(r.workspace_id, array['owner','admin','member'])) then raise exception 'forbidden'; end if;
  if split_part(_path,'/',1) <> r.workspace_id::text or split_part(_path,'/',2) <> r.id::text then raise exception 'invalid_path'; end if;
  if not exists (select 1 from storage.objects o where o.bucket_id = 'service-request-files' and o.name = _path) then raise exception 'object_missing'; end if;
  ext := lower(regexp_replace(_name, '^.*\.', ''));
  if ext not in ('stl','3mf','obj','step','stp','png','jpg','jpeg','pdf') then raise exception 'invalid_extension'; end if;
  if _size <= 0 or _size > 52428800 then raise exception 'invalid_size'; end if;
  if coalesce(_mime,'') = '' then _mime := 'application/octet-stream'; end if;
  if not (_mime = any(allowed_mime)) then raise exception 'invalid_mime'; end if;
  if (select count(*) from public.service_request_files f where f.request_id = _request) >= 20 then raise exception 'too_many_files'; end if;
  insert into public.service_request_files(workspace_id, request_id, uploaded_by, original_name, extension, mime_type, size_bytes, object_path)
  values (r.workspace_id, r.id, auth.uid(), left(regexp_replace(_name, '[^A-Za-z0-9._ -]', '_', 'g'), 200), ext, _mime, _size, _path)
  returning id into new_id;
  insert into public.service_request_events(workspace_id, request_id, actor_id, kind, note) values (r.workspace_id, r.id, auth.uid(), 'file', 'Arquivo anexado: ' || left(_name, 120));
  return new_id;
end; $$;

-- Status transitions (staff)
create or replace function public.request_transition_allowed(_from text, _to text)
returns boolean language sql immutable as $$
  select case _from
    when 'recebido' then _to in ('em_analise','aguardando_informacoes','cancelado')
    when 'em_analise' then _to in ('aguardando_informacoes','cancelado')
    when 'aguardando_informacoes' then _to in ('em_analise','cancelado')
    when 'orcamento_enviado' then _to in ('aguardando_aprovacao','em_analise','cancelado')
    when 'aguardando_aprovacao' then _to in ('em_analise','cancelado')
    when 'aguardando_pagamento' then _to in ('aprovado','cancelado')
    when 'aprovado' then _to in ('em_producao','cancelado')
    when 'em_producao' then _to in ('pos_processamento','pronto','cancelado')
    when 'pos_processamento' then _to in ('pronto','cancelado')
    when 'pronto' then _to in ('concluido')
    else false end;
$$;

create or replace function public.set_request_status(_request uuid, _status text, _note text default null)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.service_requests; labels jsonb := '{"em_analise":"Em análise","aguardando_informacoes":"Aguardando informações","aguardando_aprovacao":"Aguardando aprovação","aprovado":"Aprovado","em_producao":"Em produção","pos_processamento":"Pós-processamento","pronto":"Pronto para retirada/envio","concluido":"Concluído","cancelado":"Cancelado"}';
begin
  select * into r from public.service_requests where id = _request for update;
  if r.id is null then raise exception 'request_not_found'; end if;
  if not public.has_workspace_role(r.workspace_id, array['owner','admin','member']) then raise exception 'forbidden'; end if;
  if _status = 'aprovado' and not public.has_workspace_role(r.workspace_id, array['owner','admin']) then raise exception 'payment_confirmation_requires_admin'; end if;
  if not public.request_transition_allowed(r.status, _status) then raise exception 'invalid_transition'; end if;
  update public.service_requests set status = _status where id = r.id;
  insert into public.service_request_events(workspace_id, request_id, actor_id, kind, from_status, to_status, note)
  values (r.workspace_id, r.id, auth.uid(), 'status', r.status, _status, left(nullif(btrim(_note),''), 1000));
  perform public._notify(r.workspace_id, r.customer_id, r.id, 'Status atualizado: ' || coalesce(labels->>_status, _status), r.protocol || ' — ' || r.title);
  perform public._audit(r.workspace_id, 'request.status_changed', 'service_request', r.id::text, jsonb_build_object('from', r.status, 'to', _status));
end; $$;

create or replace function public.cancel_my_request(_request uuid, _reason text default null)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.service_requests;
begin
  select * into r from public.service_requests where id = _request for update;
  if r.id is null or not public.owns_request(_request) then raise exception 'forbidden'; end if;
  if r.status not in ('recebido','em_analise','aguardando_informacoes','orcamento_enviado','aguardando_aprovacao') then raise exception 'cannot_cancel'; end if;
  update public.service_requests set status = 'cancelado' where id = r.id;
  update public.service_quotes set status = 'superseded' where request_id = r.id and status = 'sent';
  insert into public.service_request_events(workspace_id, request_id, actor_id, kind, from_status, to_status, note)
  values (r.workspace_id, r.id, auth.uid(), 'status', r.status, 'cancelado', coalesce(left(nullif(btrim(_reason),''),1000), 'Cancelado pelo cliente'));
  perform public._audit(r.workspace_id, 'request.cancelled_by_customer', 'service_request', r.id::text, '{}');
end; $$;

create or replace function public.update_request_meta(_request uuid, _priority text, _assignee uuid, _due date)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.service_requests;
begin
  select * into r from public.service_requests where id = _request for update;
  if r.id is null or not public.has_workspace_role(r.workspace_id, array['owner','admin','member']) then raise exception 'forbidden'; end if;
  if _priority not in ('baixa','normal','alta','urgente') then raise exception 'invalid_priority'; end if;
  if _assignee is not null and not exists (select 1 from public.workspace_members m where m.workspace_id = r.workspace_id and m.user_id = _assignee and m.role in ('owner','admin','member') and m.suspended_at is null) then raise exception 'invalid_assignee'; end if;
  update public.service_requests set priority = _priority, assignee_id = _assignee, due_date = _due where id = r.id;
  insert into public.service_request_events(workspace_id, request_id, actor_id, kind, note, visible_to_customer)
  values (r.workspace_id, r.id, auth.uid(), 'meta', 'Prioridade: ' || _priority, false);
  perform public._audit(r.workspace_id, 'request.meta_updated', 'service_request', r.id::text, jsonb_build_object('priority', _priority, 'assignee', _assignee, 'due', _due));
end; $$;

-- Quotes: totals computed server-side
create or replace function public.create_quote(_request uuid, _items jsonb, _discount_cents int, _tax_percent numeric, _valid_until date, _lead_time_days int, _message text)
returns uuid language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.service_requests; q_id uuid; v int; item jsonb; sub int := 0; line int; tax int; tot int; pos int := 0; qty numeric; unit numeric;
begin
  select * into r from public.service_requests where id = _request for update;
  if r.id is null or not public.has_workspace_role(r.workspace_id, array['owner','admin','member']) then raise exception 'forbidden'; end if;
  if r.status not in ('recebido','em_analise','aguardando_informacoes','orcamento_enviado','aguardando_aprovacao') then raise exception 'invalid_state_for_quote'; end if;
  if jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 or jsonb_array_length(_items) > 50 then raise exception 'invalid_items'; end if;
  if _discount_cents < 0 or _tax_percent < 0 or _tax_percent > 100 then raise exception 'invalid_amounts'; end if;
  if _lead_time_days is not null and (_lead_time_days < 0 or _lead_time_days > 365) then raise exception 'invalid_lead_time'; end if;
  if _valid_until is not null and _valid_until < current_date then raise exception 'invalid_validity'; end if;
  update public.service_quotes set status = 'superseded' where request_id = r.id and status = 'sent';
  select coalesce(max(version),0)+1 into v from public.service_quotes where request_id = r.id;
  insert into public.service_quotes(workspace_id, request_id, version, subtotal_cents, total_cents, discount_cents, tax_percent, valid_until, lead_time_days, message, snapshot, created_by)
  values (r.workspace_id, r.id, v, 0, 0, _discount_cents, _tax_percent, _valid_until, _lead_time_days, left(nullif(btrim(_message),''),2000), '{}'::jsonb, auth.uid())
  returning id into q_id;
  for item in select * from jsonb_array_elements(_items) loop
    qty := (item->>'quantity')::numeric; unit := (item->>'unit_price_cents')::numeric;
    if qty is null or qty <= 0 or unit is null or unit < 0 then raise exception 'invalid_item'; end if;
    if item->>'kind' not in ('material','maquina','mao_de_obra','acabamento','embalagem','frete','outro') then raise exception 'invalid_item_kind'; end if;
    line := round(qty * unit)::int;
    sub := sub + line;
    insert into public.service_quote_items(workspace_id, quote_id, kind, description, quantity, unit_price_cents, total_cents, position)
    values (r.workspace_id, q_id, item->>'kind', left(coalesce(nullif(btrim(item->>'description'),''), item->>'kind'), 200), qty, unit, line, pos);
    pos := pos + 1;
  end loop;
  if _discount_cents > sub then raise exception 'discount_exceeds_subtotal'; end if;
  tax := round((sub - _discount_cents) * _tax_percent / 100)::int;
  tot := sub - _discount_cents + tax;
  update public.service_quotes set subtotal_cents = sub, tax_cents = tax, total_cents = tot,
    snapshot = jsonb_build_object('items', (select jsonb_agg(to_jsonb(i) order by i.position) from public.service_quote_items i where i.quote_id = q_id),
      'subtotal_cents', sub, 'discount_cents', _discount_cents, 'tax_percent', _tax_percent, 'tax_cents', tax, 'total_cents', tot,
      'valid_until', _valid_until, 'lead_time_days', _lead_time_days, 'request_status', r.status, 'created_at', now())
  where id = q_id;
  update public.service_requests set status = 'orcamento_enviado' where id = r.id;
  insert into public.service_request_events(workspace_id, request_id, actor_id, kind, from_status, to_status, note)
  values (r.workspace_id, r.id, auth.uid(), 'quote_sent', r.status, 'orcamento_enviado', 'Orçamento v' || v || ' enviado');
  perform public._notify(r.workspace_id, r.customer_id, r.id, 'Orçamento disponível', r.protocol || ' — revise e aprove ou recuse');
  perform public._audit(r.workspace_id, 'quote.sent', 'service_quote', q_id::text, jsonb_build_object('total_cents', tot, 'version', v));
  return q_id;
end; $$;

create or replace function public.decide_quote(_quote uuid, _approve boolean, _note text default null)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare q public.service_quotes; r public.service_requests; new_status text;
begin
  select * into q from public.service_quotes where id = _quote for update;
  if q.id is null or not public.owns_request(q.request_id) then raise exception 'forbidden'; end if;
  if q.status <> 'sent' then raise exception 'quote_not_open'; end if;
  if q.valid_until is not null and q.valid_until < current_date then
    update public.service_quotes set status = 'expired' where id = q.id; raise exception 'quote_expired'; end if;
  select * into r from public.service_requests where id = q.request_id for update;
  if r.status not in ('orcamento_enviado','aguardando_aprovacao') then raise exception 'invalid_state'; end if;
  new_status := case when _approve then 'aguardando_pagamento' else 'em_analise' end;
  update public.service_quotes set status = case when _approve then 'approved' else 'rejected' end, decided_by = auth.uid(), decided_at = now(), decision_note = left(nullif(btrim(_note),''),1000) where id = q.id;
  update public.service_requests set status = new_status where id = r.id;
  insert into public.service_request_events(workspace_id, request_id, actor_id, kind, from_status, to_status, note)
  values (r.workspace_id, r.id, auth.uid(), case when _approve then 'quote_approved' else 'quote_rejected' end, r.status, new_status,
    (case when _approve then 'Orçamento aprovado pelo cliente' else 'Orçamento recusado pelo cliente' end) || coalesce(': ' || left(nullif(btrim(_note),''),500), ''));
  perform public._audit(r.workspace_id, case when _approve then 'quote.approved' else 'quote.rejected' end, 'service_quote', q.id::text, '{}');
end; $$;

-- Subscriptions
create or replace function public.request_plan_subscription(_plan uuid)
returns uuid language plpgsql security definer set search_path = pg_catalog, public as $$
declare p public.service_plans; new_id uuid;
begin
  select * into p from public.service_plans where id = _plan and is_visible;
  if p.id is null or not public.is_workspace_customer(p.workspace_id) then raise exception 'plan_unavailable'; end if;
  update public.service_subscriptions set status = 'cancelled', cancelled_at = now() where workspace_id = p.workspace_id and customer_id = auth.uid() and status = 'pending';
  insert into public.service_subscriptions(workspace_id, customer_id, plan_id, plan_name, price_cents, billing_interval, status)
  values (p.workspace_id, auth.uid(), p.id, p.name, p.price_cents, p.billing_interval, 'pending') returning id into new_id;
  perform public._audit(p.workspace_id, 'subscription.requested', 'service_subscription', new_id::text, jsonb_build_object('plan', p.name, 'price_cents', p.price_cents));
  return new_id;
end; $$;

create or replace function public.cancel_my_subscription(_sub uuid)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare s public.service_subscriptions;
begin
  select * into s from public.service_subscriptions where id = _sub for update;
  if s.id is null or s.customer_id <> auth.uid() then raise exception 'forbidden'; end if;
  if s.status not in ('pending','active','past_due') then raise exception 'cannot_cancel'; end if;
  update public.service_subscriptions set status = 'cancelled', cancelled_at = now() where id = s.id;
  perform public._audit(s.workspace_id, 'subscription.cancelled_by_customer', 'service_subscription', s.id::text, '{}');
end; $$;

create or replace function public.staff_set_subscription_status(_sub uuid, _status text, _reference text default null)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare s public.service_subscriptions; months int;
begin
  select * into s from public.service_subscriptions where id = _sub for update;
  if s.id is null or not public.has_workspace_role(s.workspace_id, array['owner','admin']) then raise exception 'forbidden'; end if;
  if _status not in ('active','past_due','cancelled','expired') then raise exception 'invalid_status'; end if;
  months := case s.billing_interval when 'monthly' then 1 when 'quarterly' then 3 when 'semiannual' then 6 else 12 end;
  if _status = 'active' then
    update public.service_subscriptions set status = 'cancelled', cancelled_at = now()
      where workspace_id = s.workspace_id and customer_id = s.customer_id and status = 'active' and id <> s.id;
    update public.service_subscriptions set status = 'active', starts_at = coalesce(starts_at, now()),
      current_period_end = now() + make_interval(months => months), payment_provider = 'manual', payment_reference = left(nullif(btrim(_reference),''),120) where id = s.id;
    perform public._notify(s.workspace_id, s.customer_id, null, 'Assinatura ativada', s.plan_name);
  else
    update public.service_subscriptions set status = _status, cancelled_at = case when _status = 'cancelled' then now() else cancelled_at end where id = s.id;
  end if;
  perform public._audit(s.workspace_id, 'subscription.status_set_manually', 'service_subscription', s.id::text, jsonb_build_object('from', s.status, 'to', _status, 'reference', _reference));
end; $$;

-- Plan audit
create or replace function public.audit_plan_change()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  perform public._audit(coalesce(new.workspace_id, old.workspace_id), 'plan.' || lower(tg_op), 'service_plan', coalesce(new.id, old.id)::text, jsonb_build_object('name', coalesce(new.name, old.name)));
  return coalesce(new, old);
end; $$;
create trigger plans_audit after insert or update or delete on public.service_plans for each row execute procedure public.audit_plan_change();

-- Customers admin
create or replace function public.workshop_customers(_workspace uuid, _search text default null, _sub_status text default null, _limit int default 20, _offset int default 0)
returns table(user_id uuid, email text, display_name text, phone text, company text, joined_at timestamptz, suspended_at timestamptz, total_requests bigint, last_request_at timestamptz, subscription_status text, plan_name text, total_count bigint)
language plpgsql stable security definer set search_path = pg_catalog, public as $$
begin
  if not public.is_workspace_member(_workspace) then raise exception 'forbidden'; end if;
  return query
  with base as (
    select m.user_id, u.email::text as email, p.display_name, p.phone, p.company, m.created_at as joined_at, m.suspended_at,
      (select count(*) from public.service_requests r where r.workspace_id = _workspace and r.customer_id = m.user_id) as total_requests,
      (select max(r.created_at) from public.service_requests r where r.workspace_id = _workspace and r.customer_id = m.user_id) as last_request_at,
      s.status as subscription_status, s.plan_name
    from public.workspace_members m
    join auth.users u on u.id = m.user_id
    left join public.profiles p on p.id = m.user_id
    left join lateral (select ss.status, ss.plan_name from public.service_subscriptions ss where ss.workspace_id = _workspace and ss.customer_id = m.user_id order by (ss.status = 'active') desc, ss.created_at desc limit 1) s on true
    where m.workspace_id = _workspace and m.role = 'customer'
      and (_search is null or _search = '' or u.email ilike '%' || _search || '%' or p.display_name ilike '%' || _search || '%' or p.company ilike '%' || _search || '%')
      and (_sub_status is null or _sub_status = '' or (_sub_status = 'none' and s.status is null) or s.status = _sub_status)
  )
  select b.*, count(*) over() from base b order by b.joined_at desc limit least(greatest(_limit,1),100) offset greatest(_offset,0);
end; $$;

create or replace function public.staff_update_customer(_workspace uuid, _user uuid, _display_name text, _phone text, _company text)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if not public.has_workspace_role(_workspace, array['owner','admin']) then raise exception 'forbidden'; end if;
  if not exists (select 1 from public.workspace_members where workspace_id = _workspace and user_id = _user and role = 'customer') then raise exception 'not_a_customer'; end if;
  update public.profiles set display_name = left(nullif(btrim(_display_name),''),120), phone = left(nullif(btrim(_phone),''),40), company = left(nullif(btrim(_company),''),120) where id = _user;
  perform public._audit(_workspace, 'customer.updated', 'member', _user::text, '{}');
end; $$;

create or replace function public.set_customer_suspended(_workspace uuid, _user uuid, _suspend boolean, _reason text default null)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if not public.has_workspace_role(_workspace, array['owner','admin']) then raise exception 'forbidden'; end if;
  update public.workspace_members set suspended_at = case when _suspend then now() else null end, suspended_reason = case when _suspend then left(nullif(btrim(_reason),''),300) else null end
  where workspace_id = _workspace and user_id = _user and role = 'customer';
  if not found then raise exception 'not_a_customer'; end if;
  perform public._audit(_workspace, case when _suspend then 'customer.suspended' else 'customer.reactivated' end, 'member', _user::text, jsonb_build_object('reason', _reason));
end; $$;

create or replace function public.workshop_kpis(_workspace uuid, _from timestamptz default null, _to timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = pg_catalog, public as $$
declare res jsonb;
begin
  if not public.is_workspace_member(_workspace) then raise exception 'forbidden'; end if;
  select jsonb_build_object(
    'novos', count(*) filter (where status = 'recebido'),
    'em_analise', count(*) filter (where status = 'em_analise'),
    'aguardando_cliente', count(*) filter (where status in ('aguardando_informacoes','orcamento_enviado','aguardando_aprovacao','aguardando_pagamento')),
    'orcamento_pendente', count(*) filter (where status in ('orcamento_enviado','aguardando_aprovacao')),
    'em_producao', count(*) filter (where status in ('aprovado','em_producao','pos_processamento')),
    'prontos', count(*) filter (where status = 'pronto'),
    'concluidos', count(*) filter (where status = 'concluido'),
    'total', count(*)
  ) into res from public.service_requests
  where workspace_id = _workspace and (_from is null or created_at >= _from) and (_to is null or created_at < _to);
  res := res || jsonb_build_object(
    'clientes_ativos', (select count(*) from public.workspace_members where workspace_id = _workspace and role = 'customer' and suspended_at is null),
    'assinaturas_ativas', (select count(*) from public.service_subscriptions where workspace_id = _workspace and status = 'active'),
    'assinaturas_pendentes', (select count(*) from public.service_subscriptions where workspace_id = _workspace and status = 'pending'));
  return res;
end; $$;

create or replace function public.workshop_staff(_workspace uuid)
returns table(user_id uuid, display_name text, role text) language plpgsql stable security definer set search_path = pg_catalog, public as $$
begin
  if not public.is_workspace_member(_workspace) then raise exception 'forbidden'; end if;
  return query select m.user_id, coalesce(p.display_name, 'Equipe'), m.role from public.workspace_members m left join public.profiles p on p.id = m.user_id
  where m.workspace_id = _workspace and m.role in ('owner','admin','member') and m.suspended_at is null;
end; $$;

-- Execution grants
do $$ declare f text; begin
  foreach f in array array[
    'list_open_workshops()','join_workshop(uuid)','create_service_request(uuid,jsonb)','register_request_file(uuid,text,text,bigint,text)',
    'set_request_status(uuid,text,text)','cancel_my_request(uuid,text)','update_request_meta(uuid,text,uuid,date)',
    'create_quote(uuid,jsonb,integer,numeric,date,integer,text)','decide_quote(uuid,boolean,text)',
    'request_plan_subscription(uuid)','cancel_my_subscription(uuid)','staff_set_subscription_status(uuid,text,text)',
    'workshop_customers(uuid,text,text,integer,integer)','staff_update_customer(uuid,uuid,text,text,text)',
    'set_customer_suspended(uuid,uuid,boolean,text)','workshop_kpis(uuid,timestamptz,timestamptz)','workshop_staff(uuid)']
  loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

-- Storage access helper (safe path parsing)
create or replace function public.can_access_request_object(_name text, _write boolean)
returns boolean language plpgsql stable security definer set search_path = pg_catalog, public as $$
declare ws uuid; req uuid;
begin
  begin
    ws := split_part(_name,'/',1)::uuid; req := split_part(_name,'/',2)::uuid;
  exception when others then return false; end;
  if not exists (select 1 from public.service_requests r where r.id = req and r.workspace_id = ws) then return false; end if;
  if _write then
    return public.has_workspace_role(ws, array['owner','admin','member']) or public.owns_request(req);
  end if;
  return public.is_workspace_member(ws) or public.owns_request(req);
end; $$;
revoke all on function public.can_access_request_object(text, boolean) from public;
grant execute on function public.can_access_request_object(text, boolean) to authenticated;

-- Realtime
alter publication supabase_realtime add table public.service_request_messages;
alter publication supabase_realtime add table public.customer_notifications;
alter publication supabase_realtime add table public.service_requests;