-- Apply this additive migration alone. Preserve the publisher's existing policy;
-- reject impossible source types before sending their assessment text over REST.
begin;

create or replace function public.aq_publication_candidates(p_after text default '', p_limit integer default 80)
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
  and t.report->'result'->>'publication_status'='unpublished'
  -- These are necessary conditions already enforced by publish-qualified.mjs.
  -- Evidence matching and the date window remain in that final publication gate.
  and s.runtime_enabled and s.verification_status='api_parsed'
  and s.last_check_result->>'status'='parsed'
  and s.definition->>'endpoint_type'='calendar'
  and jsonb_typeof(s.definition->'municipality')='string'
  and s.definition->>'municipality' in ('Newport','Middletown','Portsmouth')
  and not exists(select 1 from aq_entries e where e.observation_id=o.id or e.canonical_url=o.url)
 order by t.request_id limit greatest(1,least(coalesce(p_limit,80),80))
$$;

revoke all on function public.aq_publication_candidates(text,integer) from public,anon,authenticated;
grant execute on function public.aq_publication_candidates(text,integer) to service_role;
notify pgrst,'reload schema';
commit;
