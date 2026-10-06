-- Run after the publication-candidate migration. Fixtures and mutations roll back.
begin;
do $test$
declare
 prefix text:='publication-filter-'||gen_random_uuid()::text;
 sid text; run_id uuid; item_id uuid; ids uuid[]:='{}'; n integer;
 returned uuid[]; expected uuid[]; first_request text;
 town jsonb; definition jsonb; result jsonb; source_status jsonb;
 verification text; enabled boolean; endpoint_type text; request_status text;
begin
 for n in 1..20 loop
  sid:=prefix||'-'||n;
  -- Low, isolated UUIDs sort ahead of ordinary records, so the bounded RPC can
  -- be exercised without changing existing records or relying on an empty DB.
  item_id:=('00000000-0000-4000-8000-'||lpad((1000+n)::text,12,'0'))::uuid;
  ids:=array_append(ids,item_id); run_id:=gen_random_uuid();
  town:=to_jsonb(case n when 2 then 'Middletown' when 3 then 'Portsmouth' else 'Newport' end);
  verification:='api_parsed'; enabled:=true; endpoint_type:='calendar';
  source_status:='{"status":"parsed"}'::jsonb; request_status:='completed';
  result:=jsonb_build_object('decision','candidate','destination','current_review',
   'publication_status','unpublished','ai_quote','AI','local_basis','Official local calendar');
  case n
   when 5 then verification:='page_parsed'; endpoint_type:='news';
   when 6 then verification:='feed_parsed'; endpoint_type:='rss';
   when 7 then enabled:=false;
   when 8 then source_status:='{"status":"failed"}'::jsonb;
   when 9 then endpoint_type:='news';
   when 10 then town:='"Providence"'::jsonb;
   when 11 then town:='["Newport"]'::jsonb;
   when 12 then verification:='imported_unverified';
   when 13 then result:=result||'{"publication_status":"draft"}'::jsonb;
   when 14 then result:=result||'{"decision":"reject"}'::jsonb;
   when 15 then request_status:='claimed';
   when 16 then result:=result||'{"destination":"archive_review"}'::jsonb;
   when 19 then town:='null'::jsonb;
   when 20 then source_status:=null;
   else null;
  end case;
  definition:=jsonb_build_object('source_id',sid,'municipality',town,'endpoint_type',endpoint_type,
   'monitor_enabled',n<>4,'monitor_mode',case when n=4 then 'public_page' else 'calendar' end);
  -- #4 proves collection-mode settings do not add an unrequested publication
  -- restriction: the existing JS gate only tests the source fields above.
  insert into aq_source_registry(source_id,org_id,organization,endpoint_url,priority,import_sha256,
   definition,verification_status,runtime_enabled,last_check_result)
  values(sid,prefix,'Rollback publication fixture','https://example.org/'||sid,'test',repeat('0',64),
   definition,verification,enabled,source_status);
  insert into aq_collection_runs(id,source_id) values(run_id,sid);
  insert into aq_observations(id,source_id,run_id,url,content_hash,title,evidence_excerpt,source_published_at)
  values(item_id,sid,run_id,'https://example.org/'||prefix||'/'||case when n=18 then 17 else n end,
   n::text,'AI calendar fixture','AI workshop',now());
  insert into aq_classification_trials(request_id,report)
  values('observation-v1:'||item_id,jsonb_build_object('kind','observation_classification',
   'status',request_status,'observation_id',item_id,'input_text','AI workshop','result',result));
 end loop;
 -- Existing entries, including withdrawn entries and another observation at
 -- their canonical URL, must not return to the automatic publication queue.
 insert into aq_entries(observation_id,canonical_url,title,status)
 values(ids[17],'https://example.org/'||prefix||'/17','Previously reviewed fixture','withdrawn');

 expected:=ids[1:4];
 select array_agg((observation->>'id')::uuid order by request_id) into returned
 from aq_publication_candidates('',500) where source->'definition'->>'endpoint_type' is not null
  and observation->>'source_id' like prefix||'-%';
 if returned is distinct from expected then
  raise exception 'Publication source filter failed: expected %, received %',expected,returned;
 end if;
 if exists(select from aq_publication_candidates('',80) where observation->>'source_id' like prefix||'-%'
  and (report->>'input_text'<>'AI workshop' or source->>'verification_status'<>'api_parsed')) then
  raise exception 'Publication response fields changed';
 end if;
 select request_id into first_request from aq_publication_candidates('',1);
 if first_request is distinct from 'observation-v1:'||ids[1]::text then
  raise exception 'First keyset page changed';
 end if;
 if (select request_id from aq_publication_candidates(first_request,1)) is distinct from 'observation-v1:'||ids[2]::text then
  raise exception 'Keyset pagination skipped the next eligible calendar';
 end if;
 if has_function_privilege('anon','public.aq_publication_candidates(text,integer)','execute')
  or has_function_privilege('authenticated','public.aq_publication_candidates(text,integer)','execute')
  or not has_function_privilege('service_role','public.aq_publication_candidates(text,integer)','execute') then
  raise exception 'Publication RPC privileges changed';
 end if;
end $test$;
select 'Publication filter scenarios passed; fixtures rolled back' as result;
rollback;
