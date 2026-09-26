create or replace function public.requesting_user_id()
returns text
language sql stable
as $$
  select nullif(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text
$$;

create table if not exists channel_types (
  id              uuid primary key default gen_random_uuid(),
  type            text not null unique,
  name            text not null,
  color           text not null,
  character_limit integer not null default 2200,
  created_at      timestamptz default now()
);

insert into channel_types (type, name, color, character_limit) values
  ('TWITTER',   'Twitter / X', '#000000', 280),
  ('LINKEDIN',  'LinkedIn',    '#2867b2', 3000),
  ('INSTAGRAM', 'Instagram',   '#E4405F', 2200),
  ('THREADS',   'Threads',     '#000000', 500),
  ('FACEBOOK',  'Facebook',    '#1877F2', 63206),
  ('BLUESKY',   'Bluesky',     '#1285fe', 300),
  ('YOUTUBE',   'YouTube',     '#FF0000', 100),
  ('TIKTOK',    'Tiktok',      '#000000', 100)
on conflict (type) do nothing;

create table if not exists user_channels (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null,
  channel_type_id  uuid not null references channel_types(id) on delete restrict,
  provider_account_id text,
  handle           text,
  profile_image    text,
  profile_url      text,
  access_token     text,
  refresh_token    text,
  token_expires_at timestamptz,
  is_connected     boolean default false,
  is_active        boolean default true,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (user_id, channel_type_id)
);

alter table user_channels enable row level security;
drop policy if exists user_channels_policy on user_channels;
create policy user_channels_policy on user_channels
  for all using (user_id = requesting_user_id())
  with check (user_id = requesting_user_id());

create table if not exists idea_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz default now()
);

insert into idea_groups (name) values
  ('Unassigned'),
  ('To Do'),
  ('In Progress'),
  ('Done')
on conflict (name) do nothing;

create table if not exists ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  group_id    uuid not null references idea_groups(id) on delete restrict,
  title       text not null,
  description text,
  images      jsonb default '[]',
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table ideas enable row level security;
drop policy if exists ideas_policy on ideas;
create policy ideas_policy on ideas
  for all using (user_id = requesting_user_id())
  with check (user_id = requesting_user_id());

create table if not exists scheduled_posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null,
  user_channel_id uuid not null references user_channels(id) on delete cascade,
  content         text not null,
  images          jsonb default '[]',
  scheduled_at    timestamptz not null,
  status          text not null default 'draft'
                  check (status in ('queue', 'draft', 'published', 'failed')),
  published_at    timestamptz,
  published_url   text,
  error_message   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table scheduled_posts enable row level security;
drop policy if exists scheduled_posts_policy on scheduled_posts;
create policy scheduled_posts_policy on scheduled_posts
  for all using (user_id = requesting_user_id())
  with check (user_id = requesting_user_id());

alter table public.channel_types enable row level security;
alter table public.channel_types force row level security;
drop policy if exists channel_types_public_read on public.channel_types;
create policy channel_types_public_read on public.channel_types
  for select to public using (true);

alter table public.idea_groups enable row level security;
alter table public.idea_groups force row level security;
drop policy if exists idea_groups_public_read on public.idea_groups;
create policy idea_groups_public_read on public.idea_groups
  for select to public using (true);
