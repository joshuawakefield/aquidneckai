create table public.aq_classification_trials (
 request_id text primary key, report jsonb not null,
 recorded_at timestamptz not null default now()
);
alter table public.aq_classification_trials enable row level security;
revoke all on public.aq_classification_trials from public,anon,authenticated;
grant select,insert,update,delete on public.aq_classification_trials to service_role;
