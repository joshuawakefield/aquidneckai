create table public.aq_source_checks (
 source_id text not null references public.aq_source_registry(source_id),
 checked_at timestamptz not null, check_kind text not null,
 status text not null, item_count integer check(item_count >= 0),
 details jsonb not null default '{}',
 primary key(source_id,checked_at,check_kind)
);
alter table public.aq_source_checks enable row level security;
revoke all on public.aq_source_checks from public,anon,authenticated;
grant select,insert,update,delete on public.aq_source_checks to service_role;
