drop policy if exists composio_category_cache_write on public.composio_category_cache;
create policy composio_category_cache_write on public.composio_category_cache
  for all using (true)
  with check (true);

drop policy if exists composio_toolkit_cache_write on public.composio_toolkit_cache;
create policy composio_toolkit_cache_write on public.composio_toolkit_cache
  for all using (true)
  with check (true);

drop policy if exists composio_catalog_meta_write on public.composio_catalog_meta;
create policy composio_catalog_meta_write on public.composio_catalog_meta
  for all using (true)
  with check (true);
