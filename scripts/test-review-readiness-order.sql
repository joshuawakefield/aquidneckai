-- Append inside migration BEGIN after removing its COMMIT; finish with ROLLBACK.
do $test$
declare
 prefix text:='readiness-test-'||gen_random_uuid(); sid text; rid uuid; oid uuid; ids uuid[]:='{}';
 n integer; mode_name text; decision_name text; destination_name text; observed timestamptz;
 response jsonb; actual uuid[]; expected uuid[]; filter_name text;
begin
 for n in 1..10 loop
  sid=prefix||'-'||n; rid=gen_random_uuid(); oid=gen_random_uuid();ids=array_append(ids,oid);
  mode_name=case when n in(2,3,7,9) then 'rss' when n=4 then 'calendar' else 'public_page' end;
  decision_name=case when n<=5 then 'candidate' when n in(6,7) then 'needs_review' when n in(8,9) then 'reject' else 'pending' end;
  destination_name=case when n in(3,5) then 'archive_review' when n<=5 then 'current_review' when n in(6,7) then 'evidence_review' else 'excluded' end;
  observed=case n when 1 then now() when 2 then now()-interval '1 day' when 3 then now()-interval '12 hours'
   when 4 then now()-interval '2 days' when 5 then now()-interval '3 days' when 6 then now()+interval '5 days'
   when 7 then now()+interval '4 days' when 8 then now()+interval '3 days' when 9 then now()+interval '2 days' else now()+interval '6 days' end;
  insert into aq_source_registry(source_id,org_id,organization,endpoint_url,priority,import_sha256,definition,verification_status)
  values(sid,prefix,'Readiness rollback fixture','https://example.org/'||sid,'test',repeat('0',64),
   jsonb_build_object('source_id',sid,'monitor_mode',mode_name,'endpoint_type',case when mode_name='calendar' then 'calendar' else 'news' end),
   case mode_name when 'calendar' then 'api_parsed' when 'rss' then 'feed_parsed' else 'page_parsed' end);
  insert into aq_collection_runs(id,source_id,status) values(rid,sid,'succeeded');
  insert into aq_observations(id,source_id,run_id,url,content_hash,title,evidence_excerpt,source_published_at,observed_at)
  values(oid,sid,rid,'https://example.org/'||sid,'fixture-'||n,prefix||' item '||n,'AI training evidence',
   case when destination_name='archive_review' then now()-interval '1 year' else now()-interval '1 day' end,observed);
  if decision_name<>'pending' then
   insert into aq_classification_trials(request_id,report)
   values('observation-v1:'||oid,jsonb_build_object('kind','observation_classification','status','completed','observation_id',oid,
    'result',jsonb_build_object('decision',decision_name,'destination',destination_name,'ai_quote','AI training','local_basis','Rhode Island','reason','Rollback fixture')));
  end if;
 end loop;
 response=aq_review_page('candidate',prefix,0,25);
 select array_agg((item->>'id')::uuid order by ordinal) into actual from jsonb_array_elements(response->'items') with ordinality as a(item,ordinal);
 expected=array[ids[2],ids[4],ids[3],ids[1],ids[5]];
 if actual is distinct from expected or (response->>'total')::integer<>5 then raise exception 'Candidate readiness order/count changed: %',response; end if;
 -- The oldest individual current event precedes a newer archive article;
 -- even the archive article precedes a fresh whole-page snapshot.
 response=aq_review_page('candidate',prefix,1,2);
 select array_agg((item->>'id')::uuid order by ordinal) into actual from jsonb_array_elements(response->'items') with ordinality as a(item,ordinal);
 if actual is distinct from array[ids[4],ids[3]] or (response->>'total')::integer<>5 then raise exception 'Pagination lost readiness order or total'; end if;
 foreach filter_name in array array['all','needs_review','reject','pending'] loop
  response=aq_review_page(filter_name,prefix,0,25);
  select array_agg((item->>'id')::uuid order by ordinal) into actual from jsonb_array_elements(response->'items') with ordinality as a(item,ordinal);
  select array_agg(id order by observed_at desc,id desc) into expected from aq_review_records()
   where source_id like prefix||'-%' and (filter_name='all' or decision=filter_name);
  if actual is distinct from expected or (response->>'total')::integer<>cardinality(expected) then raise exception 'Existing % recency ordering/filter changed',filter_name; end if;
 end loop;
 response=aq_review_page('candidate',prefix||' item 1',0,25);
 if (response->>'total')::integer<>1 or response->'items'->0->>'id'<>ids[1]::text then raise exception 'Candidate title search changed'; end if;
 response=aq_review_page('candidate',prefix,-1,0);
 if jsonb_array_length(response->'items')<>1 or response->'items'->0->>'id'<>ids[2]::text then raise exception 'Existing offset/limit clamping changed'; end if;
 if exists(select 1 from jsonb_array_elements(aq_review_page('candidate',prefix,0,25)->'items') as a(item) where item ? 'source_mode' or item ? 'excerpt' or item ? 'observed_at') then raise exception 'RPC leaked internal sort/full-evidence fields'; end if;
 if has_function_privilege('anon','aq_review_page(text,text,integer,integer)','execute')
  or has_function_privilege('authenticated','aq_review_page(text,text,integer,integer)','execute')
  or not has_function_privilege('service_role','aq_review_page(text,text,integer,integer)','execute') then raise exception 'Review RPC privileges changed'; end if;
 raise notice 'Readiness ordering fixtures passed: feed/calendar before snapshots, current before archives, stable other filters, search, pagination, bounds and private RPC privileges.';
end $test$;
