create table public.aq_registry_archive_chunks (
 import_sha256 text not null, part integer not null, content jsonb not null,
 primary key(import_sha256,part)
);
alter table public.aq_registry_archive_chunks enable row level security;
revoke all on public.aq_registry_archive_chunks from public,anon,authenticated;
grant select,insert,update,delete on public.aq_registry_archive_chunks to service_role;
