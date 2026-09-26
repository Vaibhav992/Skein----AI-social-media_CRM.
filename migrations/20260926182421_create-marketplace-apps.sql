alter table public.user_channels
  add column if not exists composio_connected_account_id text,
  add column if not exists composio_toolkit_slug text;

create table if not exists public.user_connected_apps (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  slug text not null,
  name text not null,
  logo text,
  description text,
  category_ids text[] not null default '{}',
  auth_scheme text,
  composio_connected_account_id text,
  handle text,
  profile_image text,
  status text not null default 'disconnected'
    check (status in ('connected', 'needs_reauth', 'failed', 'disconnected')),
  last_health_at timestamptz,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, slug)
);

create index if not exists user_connected_apps_user_status_idx
  on public.user_connected_apps (user_id, status);

alter table public.user_connected_apps enable row level security;
alter table public.user_connected_apps force row level security;
drop policy if exists user_connected_apps_policy on public.user_connected_apps;
create policy user_connected_apps_policy on public.user_connected_apps
  for all using (user_id = requesting_user_id())
  with check (user_id = requesting_user_id());

create table if not exists public.composio_category_cache (
  id text primary key,
  name text not null,
  sort_order integer not null default 100,
  refreshed_at timestamptz default now()
);

alter table public.composio_category_cache enable row level security;
alter table public.composio_category_cache force row level security;
drop policy if exists composio_category_cache_read on public.composio_category_cache;
create policy composio_category_cache_read on public.composio_category_cache
  for select to public using (true);

create table if not exists public.composio_toolkit_cache (
  slug text primary key,
  name text not null,
  logo text,
  description text,
  category_ids text[] not null default '{}',
  categories jsonb not null default '[]',
  auth_schemes text[] not null default '{}',
  no_auth boolean not null default false,
  tools_count integer not null default 0,
  deprecated boolean not null default false,
  auth_guide_url text,
  sort_rank integer not null default 0,
  meta jsonb not null default '{}',
  refreshed_at timestamptz default now()
);

create index if not exists composio_toolkit_cache_category_idx
  on public.composio_toolkit_cache using gin (category_ids);
create index if not exists composio_toolkit_cache_rank_idx
  on public.composio_toolkit_cache (deprecated, sort_rank);

alter table public.composio_toolkit_cache enable row level security;
alter table public.composio_toolkit_cache force row level security;
drop policy if exists composio_toolkit_cache_read on public.composio_toolkit_cache;
create policy composio_toolkit_cache_read on public.composio_toolkit_cache
  for select to public using (true);

create table if not exists public.composio_catalog_meta (
  id text primary key default 'default',
  categories_refreshed_at timestamptz,
  toolkits_refreshed_at timestamptz,
  toolkit_count integer not null default 0
);

insert into public.composio_catalog_meta (id)
values ('default')
on conflict (id) do nothing;

alter table public.composio_catalog_meta enable row level security;
alter table public.composio_catalog_meta force row level security;
drop policy if exists composio_catalog_meta_read on public.composio_catalog_meta;
create policy composio_catalog_meta_read on public.composio_catalog_meta
  for select to public using (true);
