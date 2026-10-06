-- Run after the additive helper migration. Every fixture is rolled back.
begin;
do $test$
declare s text:='egress-fixture-'||gen_random_uuid()::text; run uuid:=gen_random_uuid();
 ids uuid[]:='{}'; item uuid; n integer; page jsonb; h jsonb; fn text;
begin
 insert into aq_source_registry(source_id,org_id,organization,endpoint_url,priority,import_sha256,definition,verification_status,runtime_enabled,last_check_result)
 values(s,s,s,'https://example.org/'||s,'test',repeat('0',64),
  jsonb_build_object('source_id',s,'monitor_enabled',true,'monitor_mode','calendar','endpoint_type','calendar','municipality','Newport'),
  'api_parsed',true,'{"status":"parsed"}');
 insert into aq_collection_runs(id,source_id) values(run,s);
 for n in 1..90 loop
  item:=gen_random_uuid();ids:=array_append(ids,item);
  insert into aq_observations(id,source_id,run_id,url,content_hash,title,evidence_excerpt,source_published_at,observed_at)
  values(item,s,run,'https://example.org/'||s||'/'||n,n::text,'AI fixture '||n,'searchable-only-in-evidence '||s,now(),'1900-01-01'::timestamptz+make_interval(secs=>n));
 end loop;
 if (select count(*) from aq_pending_assessments(500,false))<>80 then raise exception 'pending limit failed';end if;
 insert into aq_classification_trials(request_id,report) values('observation-v1:'||ids[1],jsonb_build_object('kind','observation_classification','observation_id',ids[1],'status','claimed','claimed_at',now()));
 if exists(select from aq_pending_assessments(80,false) where observation->>'id'=ids[1]::text) then raise exception 'already claimed item selected';end if;
 insert into aq_classification_trials(request_id,report) values('observation-v1:'||ids[2],jsonb_build_object('kind','observation_classification','observation_id',ids[2],'status','completed','assessment_issue','fixture_issue','result',jsonb_build_object('decision','reject','reason','fixture')));
 if exists(select from aq_pending_assessments(80,false) where observation->>'id'=ids[2]::text) then raise exception 'completed item selected';end if;
 if not exists(select from aq_pending_assessments(80,true) where observation->>'id'=ids[2]::text) then raise exception 'explicit reassessment lost';end if;
 update aq_observations set url='https://example.org/'||s||'/3' where id=ids[4];
 for n in 3..4 loop
  insert into aq_classification_trials(request_id,report) values('observation-v1:'||ids[n],jsonb_build_object('kind','observation_classification','observation_id',ids[n],'status','completed','input_text','AI fixture','result',jsonb_build_object('decision','candidate','destination','current_review','publication_status','unpublished','ai_quote','AI','local_basis','Newport')));
 end loop;
 insert into aq_entries(observation_id,canonical_url,title,status) values(ids[3],'https://example.org/'||s||'/3','AI fixture','withdrawn');
 if exists(select from aq_publication_candidates('',80) where observation->>'id'=any(array[ids[3]::text,ids[4]::text])) then raise exception 'duplicate/withdrawn URL queued';end if;
 page:=aq_review_page('all',s,0,25);
 if (page->>'total')::integer<>90 or jsonb_array_length(page->'items')<>25 then raise exception 'review pagination/count failed';end if;
 if (page->'items'->0) ? 'excerpt' then raise exception 'bulk evidence leak';end if;
 if jsonb_array_length(aq_review_page('all',s,25,25)->'items')<>25 then raise exception 'second page failed';end if;
 if (aq_review_page('reject',s,0,25)->>'total')::integer<>1 then raise exception 'review filter failed';end if;
 if (aq_review_page('all','searchable-only-in-evidence '||s,0,25)->>'total')::integer<>90 then raise exception 'evidence search failed';end if;
 h:=aq_preview_summary();
 if h ? 'reviewItems' then raise exception 'summary includes review history';end if;
 if not exists(select from jsonb_array_elements(h->'sources') x where x->>'id'=s and x->>'collecting'='true') then raise exception 'source readiness lost';end if;
 foreach fn in array array['aq_pending_assessments(integer,boolean)','aq_publication_candidates(text,integer)','aq_health_summary()','aq_review_records()','aq_review_page(text,text,integer,integer)','aq_preview_summary()'] loop
  if has_function_privilege('anon',fn,'execute') or has_function_privilege('authenticated',fn,'execute') or not has_function_privilege('service_role',fn,'execute') then raise exception 'function permissions incorrect: %',fn;end if;
 end loop;
end $test$;
select 'bounded-read database scenarios passed; fixtures rolled back' as result;
rollback;
