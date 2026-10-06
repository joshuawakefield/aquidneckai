-- Apply this migration alone after rollback fixtures. No source publication occurs here.
begin;
create table public.aq_editorial_reviews (
 id uuid primary key default gen_random_uuid(),
 observation_id uuid not null references public.aq_observations(id),
 canonical_url text not null check(canonical_url ~ '^https://'),
 version integer not null check(version>0),
 action text not null check(action in('note','approve','reject','withdraw')),
 note text not null default '' check(length(note)<=2000),
 review jsonb not null check(jsonb_typeof(review)='object'),
 reviewed_at timestamptz not null default now(),
 reviewer text not null default 'owner',
 unique(canonical_url,version)
);
create index aq_editorial_observation on public.aq_editorial_reviews(observation_id,version desc);
create index if not exists aq_observations_source_url_latest on public.aq_observations(source_id,url,observed_at desc,id desc);
alter table public.aq_editorial_reviews enable row level security;
revoke all on public.aq_editorial_reviews from public,anon,authenticated,service_role;
grant select,insert on public.aq_editorial_reviews to service_role;

create function public.aq_editorial_state(p_id uuid) returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 select jsonb_build_object(
  'version',coalesce((select max(version) from aq_editorial_reviews where canonical_url=o.url),0),
  'canApprove',coalesce(s.definition->>'monitor_mode' in('rss','calendar'),false) and not exists(select 1 from aq_observations newer where newer.source_id=o.source_id and newer.url=o.url and (newer.observed_at,newer.id)>(o.observed_at,o.id)),
  'approvalBlocker',case when coalesce(s.definition->>'monitor_mode','') not in('rss','calendar') then 'Approve an individual feed or calendar item; whole-page watches and unsupported sources need individual evidence first.'
   when exists(select 1 from aq_observations newer where newer.source_id=o.source_id and newer.url=o.url and (newer.observed_at,newer.id)>(o.observed_at,o.id)) then 'A newer source revision exists. Open that item before approving publication.' else null end,
  'entry',(select jsonb_build_object('status',e.status,'title',e.title,'summary',e.summary,'aiQuote',e.ai_evidence,'usefulness',e.local_evidence,'kind',e.kind,'towns',e.towns,'startsAt',e.starts_at,'endsAt',e.ends_at) from aq_entries e where e.canonical_url=o.url),
  'review',(select review from aq_editorial_reviews where canonical_url=o.url order by version desc limit 1),
  'history',coalesce((select jsonb_agg(to_jsonb(h)) from (select version,action,note,reviewer,reviewed_at as "reviewedAt" from aq_editorial_reviews where canonical_url=o.url order by version desc limit 10) h),'[]'::jsonb))
 from aq_observations o join aq_source_registry s using(source_id) where o.id=p_id
$$;

create function public.aq_save_editorial_review(p_review jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare
 o aq_observations; s aq_source_registry; existing aq_entries;
 item_id uuid; action_name text; expected integer; current_version integer; chosen_towns text[];
 title_text text; summary_text text; ai_quote text; usefulness text; kind_name text; note_text text;
 starts timestamptz; ends timestamptz; evidence text; field_name text;
begin
 if jsonb_typeof(p_review) is distinct from 'object' or octet_length(p_review::text)>16000 then
  return jsonb_build_object('ok',false,'status',422,'error','Invalid editorial request'); end if;
 if coalesce(p_review->>'id','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  or coalesce(p_review->>'expectedVersion','') !~ '^\d{1,10}$' then
  return jsonb_build_object('ok',false,'status',422,'error','Invalid item or review version'); end if;
 if (p_review->>'expectedVersion')::bigint>2147483646 then return jsonb_build_object('ok',false,'status',422,'error','Invalid review version'); end if;
 item_id=(p_review->>'id')::uuid; expected=(p_review->>'expectedVersion')::integer;
 action_name=p_review->>'action'; note_text=coalesce(p_review->>'note','');
 if action_name is null or action_name not in('note','approve','reject','withdraw') or length(note_text) not between 1 and 2000 or nullif(trim(note_text),'') is null then
  return jsonb_build_object('ok',false,'status',422,'error','Invalid action or note'); end if;
 for field_name in select jsonb_object_keys(p_review) loop
  if field_name not in('id','expectedVersion','action','note','title','summary','aiQuote','usefulness','kind','towns','startsAt','endsAt') then return jsonb_build_object('ok',false,'status',422,'error','Unexpected review field'); end if;
 end loop;
 select * into o from aq_observations where id=item_id;
 if not found then return jsonb_build_object('ok',false,'status',404,'error','Item not found'); end if;
 -- Lock the canonical URL: edits to two revisions of one article cannot overwrite one another.
 perform pg_advisory_xact_lock(hashtextextended(o.url,0));
 select coalesce(max(version),0) into current_version from aq_editorial_reviews where canonical_url=o.url;
 if current_version<>expected then return jsonb_build_object('ok',false,'status',409,'error','This item changed. Refresh before saving.','version',current_version); end if;
 select * into s from aq_source_registry where source_id=o.source_id;
 select * into existing from aq_entries where canonical_url=o.url;
 if action_name='approve' then
  if coalesce(s.definition->>'monitor_mode','') not in('rss','calendar') then return jsonb_build_object('ok',false,'status',422,'error','Only an individual feed or calendar item can be approved'); end if;
  if exists(select 1 from aq_observations newer where newer.source_id=o.source_id and newer.url=o.url and (newer.observed_at,newer.id)>(o.observed_at,o.id)) then return jsonb_build_object('ok',false,'status',409,'error','A newer source revision exists. Open that item before approving publication.','version',current_version); end if;
  title_text=trim(coalesce(p_review->>'title','')); summary_text=trim(coalesce(p_review->>'summary',''));
  ai_quote=trim(coalesce(p_review->>'aiQuote','')); usefulness=trim(coalesce(p_review->>'usefulness','')); kind_name=p_review->>'kind';
  if length(title_text) not between 1 and 300 or length(summary_text) not between 1 and 2000 or length(usefulness) not between 1 and 2000 or length(ai_quote) not between 1 and 1000
   or kind_name is null or kind_name not in('news','event','program','job','policy','opportunity','other') then
   return jsonb_build_object('ok',false,'status',422,'error','Supply a title, summary, exact AI quote, usefulness and content type'); end if;
  select report->>'input_text' into evidence from aq_classification_trials where request_id='observation-v1:'||o.id::text;
  evidence=coalesce(evidence,o.title||' '||coalesce(o.evidence_excerpt,''));
  if strpos(evidence,ai_quote)=0 or ai_quote !~* '\m(AI|artificial intelligence|machine learning|deep learning|ChatGPT|OpenAI|GPT-[0-9]+|Claude (Sonnet|Opus|Haiku|Fable|Mythos)|Gemini [0-9]|generative AI|large language models?|LLMs?|neural networks?)\M' then
   return jsonb_build_object('ok',false,'status',422,'error','The AI quote must match the collected evidence exactly and explicitly establish AI relevance'); end if;
  if jsonb_typeof(p_review->'towns') is distinct from 'array' then
   return jsonb_build_object('ok',false,'status',422,'error','Choose the reader geography explicitly'); end if;
  if jsonb_array_length(p_review->'towns') not between 1 and 10 then
   return jsonb_build_object('ok',false,'status',422,'error','Choose the reader geography explicitly'); end if;
  select array_agg(distinct t) into chosen_towns from jsonb_array_elements_text(p_review->'towns') as t;
  if exists(select 1 from unnest(chosen_towns) as t where t is null or t not in('Newport','Middletown','Portsmouth','Jamestown','Tiverton','Little Compton','Bristol','Barrington','Providence','Rhode Island','South Coast','Regional','Global')) then
   return jsonb_build_object('ok',false,'status',422,'error','Invalid reader geography'); end if;
  if kind_name='event' then
   if o.title ~* '(^[[:space:]]*(cancelled|canceled|postponed)([[:space:][:punct:]]|$)|[[:space:][:punct:]](cancelled|canceled|postponed)[[:space:][:punct:]]*$)' or title_text ~* '(^[[:space:]]*(cancelled|canceled|postponed)([[:space:][:punct:]]|$)|[[:space:][:punct:]](cancelled|canceled|postponed)[[:space:][:punct:]]*$)' then return jsonb_build_object('ok',false,'status',422,'error','The event title marks cancellation or postponement. Await a corrected source revision.'); end if;
   if coalesce(p_review->>'startsAt','') !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$' then return jsonb_build_object('ok',false,'status',422,'error','An event requires a verified date, time and timezone'); end if;
   if nullif(p_review->>'endsAt','') is not null and p_review->>'endsAt' !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$' then return jsonb_build_object('ok',false,'status',422,'error','The event end time needs a timezone'); end if;
   begin starts=(p_review->>'startsAt')::timestamptz; ends=nullif(p_review->>'endsAt','')::timestamptz;
   exception when others then return jsonb_build_object('ok',false,'status',422,'error','Invalid event dates'); end;
   if starts<=now() or (ends is not null and ends<starts) then return jsonb_build_object('ok',false,'status',422,'error','Approve only a future event with valid end time'); end if;
  else starts=null; ends=null; end if;
  insert into aq_entries(observation_id,canonical_url,title,summary,towns,kind,status,local_evidence,ai_evidence,starts_at,ends_at,published_at)
  values(o.id,o.url,title_text,summary_text,chosen_towns,kind_name,'published',usefulness,ai_quote,starts,ends,now())
  on conflict(canonical_url) do update set observation_id=excluded.observation_id,title=excluded.title,summary=excluded.summary,towns=excluded.towns,kind=excluded.kind,status='published',local_evidence=excluded.local_evidence,ai_evidence=excluded.ai_evidence,starts_at=excluded.starts_at,ends_at=excluded.ends_at,published_at=excluded.published_at;
 elsif action_name='reject' then
  if existing.status='published' then return jsonb_build_object('ok',false,'status',422,'error','Use Withdraw for a published item'); end if;
  insert into aq_entries(observation_id,canonical_url,title,kind,status) values(o.id,o.url,o.title,'other','rejected')
  on conflict(canonical_url) do update set status='rejected';
 elsif action_name='withdraw' then
  if existing.id is null or existing.status<>'published' then return jsonb_build_object('ok',false,'status',422,'error','Only a published item can be withdrawn'); end if;
  update aq_entries set status='withdrawn' where id=existing.id;
 end if;
 insert into aq_editorial_reviews(observation_id,canonical_url,version,action,note,review)
 values(o.id,o.url,current_version+1,action_name,note_text,p_review);
 return jsonb_build_object('ok',true,'state',aq_editorial_state(o.id));
end $$;

-- Reconcile only explicit changes in an existing official calendar item. Missing
-- items, failed checks and unrelated description edits are not cancellation evidence.
create function public.aq_reconcile_calendar_publications(p_limit integer default 50) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare candidate record; current_entry aq_entries; newest aq_observations; revision integer; reason_text text; changed integer:=0; checked integer:=0;
begin
 for candidate in
  select e.id,e.canonical_url,e.observation_id,o.source_id,o.observed_at
  from aq_entries e join aq_observations o on o.id=e.observation_id join aq_source_registry s on s.source_id=o.source_id
  join lateral(select newer.title,newer.source_published_at from aq_observations newer
   where newer.source_id=o.source_id and newer.url=e.canonical_url and newer.observed_at>o.observed_at
   order by newer.observed_at desc,newer.id desc limit 1) latest on true
  where e.status='published' and e.kind='event' and e.starts_at>now()
   and s.verification_status='api_parsed' and s.definition->>'monitor_mode'='calendar' and s.definition->>'endpoint_type'='calendar'
   and (latest.title ~* '(^[[:space:]]*(cancelled|canceled|postponed)([[:space:][:punct:]]|$)|[[:space:][:punct:]](cancelled|canceled|postponed)[[:space:][:punct:]]*$)'
    or (latest.source_published_at is not null and latest.source_published_at is distinct from e.starts_at))
  order by e.starts_at,e.id limit greatest(1,least(coalesce(p_limit,50),50))
 loop
  checked=checked+1;
  select * into newest from aq_observations where source_id=candidate.source_id and url=candidate.canonical_url
   and observed_at>candidate.observed_at order by observed_at desc,id desc limit 1;
  if newest.id is null then continue; end if;
  perform pg_advisory_xact_lock(hashtextextended(candidate.canonical_url,0));
  select * into current_entry from aq_entries where id=candidate.id;
  if current_entry.status<>'published' or current_entry.starts_at<=now() or current_entry.observation_id is distinct from candidate.observation_id then continue; end if;
  reason_text=null;
  if newest.title ~* '(^[[:space:]]*(cancelled|canceled|postponed)([[:space:][:punct:]]|$)|[[:space:][:punct:]](cancelled|canceled|postponed)[[:space:][:punct:]]*$)' then
   reason_text='Official calendar title explicitly marks this event cancelled or postponed. Review the original source before republishing.';
  elsif newest.source_published_at is not null and newest.source_published_at is distinct from current_entry.starts_at then
   reason_text='The official calendar changed the event start time. The previous listing was withdrawn pending review.';
  end if;
  if reason_text is null then continue; end if;
  update aq_entries set status='withdrawn' where id=current_entry.id;
  select coalesce(max(version),0)+1 into revision from aq_editorial_reviews where canonical_url=candidate.canonical_url;
  insert into aq_editorial_reviews(observation_id,canonical_url,version,action,note,review,reviewer)
  values(newest.id,candidate.canonical_url,revision,'withdraw',reason_text,
   jsonb_build_object('action','withdraw','origin','official_calendar_change','previousObservation',candidate.observation_id,'newObservation',newest.id,'previousStart',current_entry.starts_at,'newStart',newest.source_published_at),
   'system:calendar-reconciliation');
  changed=changed+1;
 end loop;
 return jsonb_build_object('checked',checked,'withdrawn',changed);
end $$;

-- Human decisions resolve the review queue without rewriting saved model evidence.
create or replace function public.aq_review_records()
returns table(id uuid,source_id text,title text,url text,source text,towns jsonb,date timestamptz,
 excerpt text,decision text,issue text,reason text,"aiEvidence" text,"localEvidence" text,
 "modelDecision" text,"modelReason" text,status text,destination text,observed_at timestamptz)
language sql stable security invoker set search_path=public,pg_temp as $$
 select o.id,o.source_id,o.title,o.url,s.organization,
  case when jsonb_typeof(s.definition->'municipality')='array' then s.definition->'municipality'
   when nullif(s.definition->>'municipality','') is not null then jsonb_build_array(s.definition->>'municipality') else '[]'::jsonb end,
  o.source_published_at,o.evidence_excerpt,
  case when editorial.action='approve' then 'candidate' when editorial.action in('reject','withdraw') then 'reject' when t.report->>'status'='completed' then t.report->'result'->>'decision' else 'pending' end,
  case when editorial.action is null then t.report->>'assessment_issue' else null end,
  case when editorial.action is not null then 'Editor '||editorial.action||': '||coalesce(nullif(editorial.note,''),'Reviewed in dashboard') else coalesce(t.report->'result'->>'reason','Awaiting assessment') end,
  coalesce(t.report->'result'->>'ai_quote',''),coalesce(t.report->'result'->>'local_basis',''),
  t.report->'model_result'->>'decision',t.report->'model_result'->>'reason',
  case when editorial.action is not null then 'completed' else coalesce(t.report->>'status','unassessed') end,
  case when editorial.action='approve' then 'current_review' when editorial.action in('reject','withdraw') then 'excluded' else t.report->'result'->>'destination' end,o.observed_at
 from aq_observations o join aq_source_registry s using(source_id)
 left join aq_classification_trials t on t.request_id='observation-v1:'||o.id::text
 left join lateral(select action,note from aq_editorial_reviews where observation_id=o.id and action<>'note' order by version desc limit 1) editorial on true
$$;
revoke all on function public.aq_editorial_state(uuid),public.aq_save_editorial_review(jsonb),public.aq_reconcile_calendar_publications(integer) from public,anon,authenticated;
grant execute on function public.aq_editorial_state(uuid),public.aq_save_editorial_review(jsonb),public.aq_reconcile_calendar_publications(integer) to service_role;
notify pgrst,'reload schema';
commit;
