begin;
create table public.aq_source_registry (
 source_id text primary key, org_id text not null, organization text not null,
 endpoint_url text not null, priority text not null, import_sha256 text not null,
 definition jsonb not null check (jsonb_typeof(definition)='object'),
 verification_status text not null default 'imported_unverified',
 runtime_enabled boolean not null default false,
 last_checked_at timestamptz, last_check_result jsonb,
 imported_at timestamptz not null default now(),
 check (definition->>'source_id'=source_id)
);
create table public.aq_registry_imports (
 sha256 text primary key, source_count integer not null,
 organization_count integer not null, metadata jsonb not null,
 original_yaml text not null, imported_at timestamptz not null default now()
);
alter table public.aq_source_registry enable row level security;
alter table public.aq_registry_imports enable row level security;
revoke all on public.aq_source_registry, public.aq_registry_imports from public, anon, authenticated;
grant select,insert,update,delete on public.aq_source_registry, public.aq_registry_imports to service_role;
commit;
