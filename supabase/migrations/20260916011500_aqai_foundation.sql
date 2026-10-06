-- AqAI pilot foundation. Private by default; public access is a later migration.
-- Run once. A collision stops the transaction rather than changing existing tables.
begin;

create table public.aq_sources (
  id text primary key,
  name text not null,
  url text not null unique check (url ~ '^https://'),
  towns text[] not null,
  kind text not null,
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.aq_collection_runs (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.aq_sources(id),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','succeeded','failed')),
  item_count integer not null default 0 check (item_count >= 0),
  error_code text,
  check (finished_at is null or finished_at >= started_at)
);

create table public.aq_observations (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.aq_sources(id),
  run_id uuid not null references public.aq_collection_runs(id),
  url text not null check (url ~ '^https://'),
  content_hash text not null,
  title text not null,
  evidence_excerpt text,
  source_published_at timestamptz,
  observed_at timestamptz not null default now(),
  unique (source_id, url, content_hash)
);

create table public.aq_entries (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.aq_observations(id),
  canonical_url text not null unique check (canonical_url ~ '^https://'),
  title text not null,
  summary text,
  towns text[] not null default '{}',
  kind text not null default 'other' check (kind in ('news','event','program','job','policy','opportunity','other')),
  status text not null default 'draft' check (status in ('draft','published','rejected','withdrawn')),
  local_evidence text,
  ai_evidence text,
  starts_at timestamptz,
  ends_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at),
  check (status <> 'published' or
    (published_at is not null and nullif(trim(local_evidence),'') is not null
     and nullif(trim(ai_evidence),'') is not null and cardinality(towns) > 0))
);

create index aq_runs_source_started on public.aq_collection_runs(source_id, started_at desc);
create index aq_observations_source_time on public.aq_observations(source_id, observed_at desc);
create index aq_entries_status_time on public.aq_entries(status, published_at desc);

alter table public.aq_sources enable row level security;
alter table public.aq_collection_runs enable row level security;
alter table public.aq_observations enable row level security;
alter table public.aq_entries enable row level security;
revoke all on public.aq_sources, public.aq_collection_runs, public.aq_observations, public.aq_entries from public, anon, authenticated;
grant select, insert, update, delete on public.aq_sources, public.aq_collection_runs, public.aq_observations, public.aq_entries to service_role;

insert into public.aq_sources (id,name,url,towns,kind) values
('newport-city','City of Newport','https://www.newportri.gov/',array['Newport'],'government'),
('middletown-town','Town of Middletown','https://www.middletownri.gov/rss.aspx',array['Middletown'],'government'),
('portsmouth-town','Town of Portsmouth','https://www.portsmouthri.gov/rss.aspx',array['Portsmouth'],'government'),
('newport-chamber-ai','Greater Newport Chamber: AI certificate','https://www.newportchamber.com/certificate-in-ai-for-productivity/',array['Newport'],'education'),
('innovate-newport','Innovate Newport','https://innovatenewport.org/',array['Newport'],'organization'),
('iyrs','IYRS School of Technology & Trades','https://www.iyrs.edu/',array['Newport'],'education');

commit;
