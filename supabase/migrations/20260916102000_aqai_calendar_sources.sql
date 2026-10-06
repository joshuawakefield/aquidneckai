begin;
do $$begin
 if not exists(select 1 from public.aq_source_registry where source_id='salve-events') then raise exception 'Missing salve-events registry row'; end if;
end$$;
update public.aq_source_registry
set endpoint_url='https://events.salve.edu/api/2/events?days=30&pp=100&for=main',
 definition=jsonb_set(jsonb_set(jsonb_set(jsonb_set(definition,'{endpoint_url}',to_jsonb('https://events.salve.edu/api/2/events?days=30&pp=100&for=main'::text)),'{machine_readable}','true'::jsonb),'{parser_hint}',to_jsonb('localist_api'::text)),'{feed_type}',to_jsonb('json'::text)),
 verification_status='api_parsed',runtime_enabled=false,next_check_at=now(),lease_until=null,lease_token=null
where source_id='salve-events';
create or replace function public.aq_claim_feed_sources(p_pilot boolean default false)
returns setof public.aq_source_registry language plpgsql security invoker
set search_path=public,pg_temp as $$
begin
 update public.aq_collection_runs r set status='failed',finished_at=now(),error_code='lease_expired'
 from public.aq_source_registry s where r.id=s.lease_token and r.status='running' and s.lease_until<now();
 return query
 with due as (
  select source_id from public.aq_source_registry
  where definition->>'monitor_enabled'='true'
   and ((definition->>'monitor_mode'='rss' and verification_status='feed_parsed')
     or (definition->>'monitor_mode'='calendar' and verification_status='api_parsed'))
   and (lease_until is null or lease_until<now())
   and (p_pilot or (runtime_enabled and (next_check_at is null or next_check_at<=now())))
  order by priority,source_id for update skip locked limit 8
 ), claimed as (
  update public.aq_source_registry s set lease_token=gen_random_uuid(),lease_until=now()+interval '10 minutes'
  from due where s.source_id=due.source_id returning s.*
 ), runs as (
  insert into public.aq_collection_runs(id,source_id) select lease_token,source_id from claimed returning id
 ) select c.* from claimed c join runs r on r.id=c.lease_token;
end $$;
revoke all on function public.aq_claim_feed_sources(boolean) from public,anon,authenticated;
grant execute on function public.aq_claim_feed_sources(boolean) to service_role;
notify pgrst,'reload schema';
commit;
