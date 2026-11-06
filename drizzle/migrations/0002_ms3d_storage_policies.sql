create policy srf_select on storage.objects for select to authenticated
  using (bucket_id = 'service-request-files' and public.can_access_request_object(name, false));
create policy srf_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'service-request-files' and public.can_access_request_object(name, true));
create policy srf_delete on storage.objects for delete to authenticated
  using (bucket_id = 'service-request-files' and (owner_id = auth.uid()::text or public.can_access_request_object(name, true)) and not exists (select 1 from public.service_request_files f where f.object_path = name));

create or replace function public.safe_ws_from_path(_name text)
returns uuid language plpgsql immutable as $$ begin return split_part(_name,'/',1)::uuid; exception when others then return null; end; $$;

create policy pf_select on storage.objects for select to authenticated
  using (bucket_id = 'ms3d-project-files' and public.is_workspace_member(public.safe_ws_from_path(name)));
create policy pf_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'ms3d-project-files' and public.has_workspace_role(public.safe_ws_from_path(name), array['owner','admin','member']));
create policy pf_delete on storage.objects for delete to authenticated
  using (bucket_id = 'ms3d-project-files' and public.has_workspace_role(public.safe_ws_from_path(name), array['owner','admin']));