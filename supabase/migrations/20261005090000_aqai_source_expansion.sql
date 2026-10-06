-- Apply only this migration; no source activation or destructive changes.
begin;
create or replace function public.aq_source_eligible(d jsonb,v text) returns boolean
language sql immutable security invoker set search_path=public,pg_temp as $$
 select coalesce(d->>'monitor_enabled'='true' and
 ((d->>'monitor_mode'='rss' and v='feed_parsed') or
  (d->>'monitor_mode'='calendar' and v='api_parsed') or
  (d->>'monitor_mode'='public_page' and v='page_parsed')),false)
$$;

create or replace function public.aq_claim_feed_sources(p_pilot boolean default false)
returns setof public.aq_source_registry language plpgsql security invoker
set search_path=public,pg_temp as $$
begin
 update public.aq_collection_runs r set status='failed',finished_at=now(),error_code='lease_expired'
 from public.aq_source_registry s where r.id=s.lease_token and r.status='running' and s.lease_until<now();
 return query
 with due as (
  select source_id from public.aq_source_registry
  where aq_source_eligible(definition,verification_status)
   and (lease_until is null or lease_until<now())
   and (p_pilot or (runtime_enabled and (next_check_at is null or next_check_at<=now())))
  order by next_check_at nulls first,priority,source_id for update skip locked limit 16
 ), claimed as (
  update public.aq_source_registry s set lease_token=gen_random_uuid(),lease_until=now()+interval '10 minutes'
  from due where s.source_id=due.source_id returning s.*
 ), runs as (
  insert into public.aq_collection_runs(id,source_id) select lease_token,source_id from claimed returning id
 ) select c.* from claimed c join runs r on r.id=c.lease_token;
end $$;

create or replace function public.aq_health_summary() returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 with sources as (
  select *, aq_source_eligible(definition,verification_status) as eligible
  from aq_source_registry where runtime_enabled
 ) select jsonb_build_object('enabledSources',count(*),'eligibleSources',count(*) filter(where eligible),
  'waitingSources',count(*) filter(where eligible is not true),
  'sourceFailure',coalesce(bool_or(last_check_result->>'status'='failed') filter(where eligible),false),
  'failedSources',count(*) filter(where eligible and last_check_result->>'status'='failed'),
  'oldestNextCheckAt',min(next_check_at) filter(where eligible),'checkedAt',now()) from sources
$$;

create or replace function public.aq_preview_summary() returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 with sources as (
  select source_id as id,organization as name,endpoint_url as url,
   case when jsonb_typeof(definition->'municipality')='array' then definition->'municipality'
    when nullif(definition->>'municipality','') is not null then jsonb_build_array(definition->>'municipality') else '[]'::jsonb end as towns,
   definition->>'endpoint_type' as kind,coalesce(last_check_result->>'status','unchecked') as status,
   last_checked_at as "checkedAt",runtime_enabled as enabled,
   runtime_enabled and aq_source_eligible(definition,verification_status) as collecting,
   definition->>'monitor_mode' as mode,definition->>'collection_scope' as scope,
   definition->>'setup_issue' as "setupIssue",last_check_result->>'error_code' as "errorCode",
   coalesce(last_check_result->'item_count','0'::jsonb) as "itemCount"
  from aq_source_registry order by source_id
 ), latest as (
  select distinct on(source_id,url) * from aq_review_records() order by source_id,url,observed_at desc,id desc
 ), candidates as (
  select r.id,r.title,r.url,r.source,r.towns,r.date,r.destination,r.decision,r."aiEvidence",r."localEvidence",r.reason,
   coalesce(e.status,'unpublished') as status,e.kind,e.starts_at as "startsAt",e.ends_at as "endsAt",e.published_at as "publishedAt"
  from latest r left join aq_entries e on e.observation_id=r.id
  where r.status='completed' and r.decision='candidate' order by r.observed_at desc,r.id desc limit 100
 ), counts as (
  select count(*) as observations,count(*) filter(where status='completed') as classified,
   count(*) filter(where decision='needs_review') as review_required from aq_review_records()
 ) select jsonb_build_object('fetchedAt',now(),'sources',coalesce((select jsonb_agg(to_jsonb(s)) from sources s),'[]'::jsonb),
  'items',coalesce((select jsonb_agg(to_jsonb(c)) from candidates c),'[]'::jsonb),
  'observations',observations,'classified',classified,'classificationPending',observations-classified,'reviewRequired',review_required,
  'candidateDisplayLimit',100) from counts
$$;

create or replace function public.aq_finish_feed_run(p_source_id text,p_lease_token uuid,p_result jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare s public.aq_source_registry; r public.aq_collection_runs; e jsonb; n integer:=0; added integer;
 total integer; stamp timestamptz:=clock_timestamp(); ok boolean; cadence integer; unchanged boolean; cache jsonb;
begin
 select * into s from public.aq_source_registry where source_id=p_source_id for update;
 select * into r from public.aq_collection_runs where id=p_lease_token and source_id=p_source_id;
 if r.id is null then raise exception 'Unknown run'; end if;
 if r.status<>'running' then return jsonb_build_object('status',r.status,'new_items',r.new_item_count,'replayed',true); end if;
 if s.lease_token is distinct from p_lease_token then raise exception 'Stale lease'; end if;
 if p_result->>'status' not in ('parsed','failed','not_modified') or p_result->>'status' is null then raise exception 'Invalid status'; end if;
 unchanged:=p_result->>'status'='not_modified';
 ok:=p_result->>'status' in ('parsed','not_modified');
 cache:=s.last_check_result->'http_cache';
 if unchanged and (cache is null or cache->>'endpoint_url' is distinct from s.endpoint_url
   or cache->>'final_url' is distinct from s.endpoint_url or cache->>'adapter_version' is distinct from 'conditional-v1'
   or cache->>'last_full_fetch_at' is null or coalesce(cache->>'etag',cache->>'last_modified') is null
   or p_result->'http_cache'->>'endpoint_url' is distinct from s.endpoint_url
   or p_result->'http_cache'->>'final_url' is distinct from s.endpoint_url
   or p_result->'http_cache'->>'adapter_version' is distinct from 'conditional-v1') then
  raise exception 'Uncached not-modified response';
 end if;
 total:=case when unchanged then (cache->>'item_count')::integer
   when ok then jsonb_array_length(p_result->'entries') else 0 end;
 if total is null or total<0 or total>500 then raise exception 'Invalid item count'; end if;
 if ok and not unchanged then
  for e in select value from jsonb_array_elements(p_result->'entries') loop
   insert into public.aq_observations(source_id,run_id,url,content_hash,title,evidence_excerpt,source_published_at)
   values(p_source_id,p_lease_token,e->>'url',e->>'content_hash',e->>'title',e->>'description',
     nullif(e->>'published_at','')::timestamptz)
   on conflict(source_id,url,content_hash) do nothing;
   get diagnostics added=row_count; n:=n+added;
  end loop;
 end if;
 update public.aq_collection_runs set status=case when ok then 'succeeded' else 'failed' end,
  finished_at=stamp,item_count=total,new_item_count=n,error_code=case when ok then null else left(p_result->>'error_type',80) end
 where id=p_lease_token;
 if ok then
  if p_result->'http_cache'->>'endpoint_url'=s.endpoint_url
    and p_result->'http_cache'->>'adapter_version'='conditional-v1' then
   cache:=(case when unchanged then cache else '{}'::jsonb end)||p_result->'http_cache'
     ||jsonb_build_object('item_count',total,'last_full_fetch_at',case when unchanged then cache->>'last_full_fetch_at' else stamp::text end);
  else cache:=null; end if;
 end if;
 insert into public.aq_source_checks(source_id,checked_at,check_kind,status,item_count,details)
 values(p_source_id,stamp,coalesce(s.definition->>'monitor_mode','rss')||'_parse',case when ok then 'parsed' else 'failed' end,total,jsonb_build_object('run_id',p_lease_token,'new_items',n,'not_modified',unchanged));
 cadence:=greatest(15,least(10080,coalesce((s.definition->>'poll_interval_minutes')::integer,360)));
 update public.aq_source_registry set last_checked_at=stamp,
  last_check_result=jsonb_build_object('status',case when ok then 'parsed' else 'failed' end,'item_count',total,'new_items',n,'run_id',p_lease_token,'not_modified',unchanged,'http_cache',cache,'error_code',case when ok then null else left(p_result->>'error_type',80) end),
  next_check_at=stamp+make_interval(mins=>case when ok then cadence else greatest(60,cadence) end),
  lease_until=null,lease_token=null where source_id=p_source_id;
 return jsonb_build_object('status',case when ok then 'succeeded' else 'failed' end,'items',total,'new_items',n,'replayed',false,'not_modified',unchanged);
end $$;

create or replace function public.aq_pending_assessments(p_limit integer default 80, p_reassess boolean default false)
returns table(observation jsonb, source jsonb, prior_report jsonb)
language sql stable security invoker set search_path=public,pg_temp as $$
 select jsonb_build_object('id',o.id,'source_id',o.source_id,'title',o.title,
   'evidence_excerpt',o.evidence_excerpt,'source_published_at',o.source_published_at),
  jsonb_build_object('source_id',s.source_id,'organization',s.organization,
   'definition',jsonb_build_object('municipality',s.definition->'municipality','endpoint_type',case when s.definition->>'monitor_mode'='public_page' then to_jsonb('public_page'::text) else s.definition->'endpoint_type' end)),
  t.report
 from aq_observations o join aq_source_registry s using(source_id)
 left join aq_classification_trials t on t.request_id='observation-v1:'||o.id::text
 where t.request_id is null or (p_reassess and t.report->>'status'='completed'
   and nullif(t.report->>'assessment_issue','') is not null
   and coalesce(t.report->>'reassessment_attempted','false')='false')
 order by o.observed_at,o.id limit greatest(1,least(coalesce(p_limit,80),80))
$$;
revoke all on function public.aq_source_eligible(jsonb,text),public.aq_claim_feed_sources(boolean),public.aq_health_summary(),public.aq_preview_summary(),public.aq_finish_feed_run(text,uuid,jsonb),public.aq_pending_assessments(integer,boolean) from public,anon,authenticated;
grant execute on function public.aq_source_eligible(jsonb,text),public.aq_claim_feed_sources(boolean),public.aq_health_summary(),public.aq_preview_summary(),public.aq_finish_feed_run(text,uuid,jsonb),public.aq_pending_assessments(integer,boolean) to service_role;
notify pgrst,'reload schema';
commit;
