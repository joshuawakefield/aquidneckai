-- Additive, service-only read functions. Apply this file alone; older migration history is unreconciled.
begin;

create function public.aq_pending_assessments(p_limit integer default 80, p_reassess boolean default false)
returns table(observation jsonb, source jsonb, prior_report jsonb)
language sql stable security invoker set search_path=public,pg_temp as $$
 select jsonb_build_object('id',o.id,'source_id',o.source_id,'title',o.title,
   'evidence_excerpt',o.evidence_excerpt,'source_published_at',o.source_published_at),
  jsonb_build_object('source_id',s.source_id,'organization',s.organization,
   'definition',jsonb_build_object('municipality',s.definition->'municipality','endpoint_type',s.definition->'endpoint_type')),
  t.report
 from aq_observations o join aq_source_registry s using(source_id)
 left join aq_classification_trials t on t.request_id='observation-v1:'||o.id::text
 where t.request_id is null or (p_reassess and t.report->>'status'='completed'
   and nullif(t.report->>'assessment_issue','') is not null
   and coalesce(t.report->>'reassessment_attempted','false')='false')
 order by o.observed_at,o.id limit greatest(1,least(coalesce(p_limit,80),80))
$$;

create function public.aq_publication_candidates(p_after text default '', p_limit integer default 80)
returns table(request_id text, observation jsonb, source jsonb, report jsonb)
language sql stable security invoker set search_path=public,pg_temp as $$
 select t.request_id,
  jsonb_build_object('id',o.id,'source_id',o.source_id,'url',o.url,'title',o.title,'source_published_at',o.source_published_at),
  jsonb_build_object('runtime_enabled',s.runtime_enabled,'verification_status',s.verification_status,
    'last_check_result',jsonb_build_object('status',s.last_check_result->'status'),
    'definition',jsonb_build_object('municipality',s.definition->'municipality','endpoint_type',s.definition->'endpoint_type')),
  jsonb_build_object('kind',t.report->'kind','status',t.report->'status','observation_id',o.id,
    'input_text',t.report->'input_text','result',t.report->'result')
 from aq_classification_trials t join aq_observations o on t.request_id='observation-v1:'||o.id::text
 join aq_source_registry s using(source_id)
 where t.request_id>coalesce(p_after,'') and t.report->>'kind'='observation_classification'
  and t.report->>'status'='completed' and t.report->'result'->>'decision'='candidate'
  and t.report->'result'->>'destination'='current_review'
  and not exists(select 1 from aq_entries e where e.observation_id=o.id or e.canonical_url=o.url)
 order by t.request_id limit greatest(1,least(coalesce(p_limit,80),80))
$$;

create function public.aq_health_summary() returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 with sources as (
  select *, definition->>'monitor_enabled'='true' and
   ((definition->>'monitor_mode'='rss' and verification_status='feed_parsed') or
    (definition->>'monitor_mode'='calendar' and verification_status='api_parsed')) as eligible
  from aq_source_registry where runtime_enabled
 ) select jsonb_build_object('enabledSources',count(*),'eligibleSources',count(*) filter(where eligible),
  'waitingSources',count(*) filter(where eligible is not true),
  'sourceFailure',coalesce(bool_or(last_check_result->>'status'='failed') filter(where eligible),false),
  'oldestNextCheckAt',min(next_check_at) filter(where eligible),'checkedAt',now()) from sources
$$;

create function public.aq_review_records()
returns table(id uuid,source_id text,title text,url text,source text,towns jsonb,date timestamptz,
 excerpt text,decision text,issue text,reason text,"aiEvidence" text,"localEvidence" text,
 "modelDecision" text,"modelReason" text,status text,destination text,observed_at timestamptz)
language sql stable security invoker set search_path=public,pg_temp as $$
 select o.id,o.source_id,o.title,o.url,s.organization,
  case when jsonb_typeof(s.definition->'municipality')='array' then s.definition->'municipality'
   when nullif(s.definition->>'municipality','') is not null then jsonb_build_array(s.definition->>'municipality') else '[]'::jsonb end,
  o.source_published_at,o.evidence_excerpt,
  case when t.report->>'status'='completed' then t.report->'result'->>'decision' else 'pending' end,
  t.report->>'assessment_issue',coalesce(t.report->'result'->>'reason','Awaiting assessment'),
  coalesce(t.report->'result'->>'ai_quote',''),coalesce(t.report->'result'->>'local_basis',''),
  t.report->'model_result'->>'decision',t.report->'model_result'->>'reason',
  coalesce(t.report->>'status','unassessed'),t.report->'result'->>'destination',o.observed_at
 from aq_observations o join aq_source_registry s using(source_id)
 left join aq_classification_trials t on t.request_id='observation-v1:'||o.id::text
$$;

create function public.aq_review_page(p_decision text default 'needs_review',p_query text default '',p_offset integer default 0,p_limit integer default 25)
returns jsonb language sql stable security invoker set search_path=public,pg_temp as $$
 with matching as (
  select * from aq_review_records() r
  where (p_decision='all' or r.decision=p_decision)
   and (coalesce(p_query,'')='' or strpos(lower(r.title||' '||r.source||' '||coalesce(r.excerpt,'')),lower(left(p_query,200)))>0)
 ), page as (
  select id,title,url,source,date,decision,issue,reason,"aiEvidence","localEvidence","modelDecision","modelReason",status,destination
  from matching order by observed_at desc,id desc
  offset greatest(0,least(coalesce(p_offset,0),1000000)) limit greatest(1,least(coalesce(p_limit,25),50))
 ) select jsonb_build_object('total',(select count(*) from matching),
   'items',coalesce((select jsonb_agg(to_jsonb(p)) from page p),'[]'::jsonb))
$$;

create function public.aq_preview_summary() returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 with sources as (
  select source_id as id,organization as name,endpoint_url as url,
   case when jsonb_typeof(definition->'municipality')='array' then definition->'municipality'
    when nullif(definition->>'municipality','') is not null then jsonb_build_array(definition->>'municipality') else '[]'::jsonb end as towns,
   definition->>'endpoint_type' as kind,coalesce(last_check_result->>'status','unchecked') as status,
   last_checked_at as "checkedAt",runtime_enabled as enabled,
   coalesce(runtime_enabled and definition->>'monitor_enabled'='true' and
     ((definition->>'monitor_mode'='rss' and verification_status='feed_parsed') or
      (definition->>'monitor_mode'='calendar' and verification_status='api_parsed')),false) as collecting,
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

create index if not exists aq_observations_time_id on public.aq_observations(observed_at,id);
create index if not exists aq_entries_observation on public.aq_entries(observation_id);

revoke all on function public.aq_pending_assessments(integer,boolean),public.aq_publication_candidates(text,integer),
 public.aq_health_summary(),public.aq_review_records(),public.aq_review_page(text,text,integer,integer),public.aq_preview_summary()
 from public,anon,authenticated;
grant execute on function public.aq_pending_assessments(integer,boolean),public.aq_publication_candidates(text,integer),
 public.aq_health_summary(),public.aq_review_records(),public.aq_review_page(text,text,integer,integer),public.aq_preview_summary() to service_role;
notify pgrst,'reload schema';
commit;
