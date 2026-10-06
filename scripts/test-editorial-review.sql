-- Run within the migration transaction before replacing its COMMIT with ROLLBACK,
-- or run this after the migration inside a separate BEGIN / ROLLBACK transaction.
do $test$
declare
 prefix text:='editorial-test-'||gen_random_uuid(); sid text; rid uuid; oid uuid; duplicate_id uuid; page_id uuid;
 original_id uuid; newer_id uuid; canonical text; entry_id uuid; n integer; response jsonb; request jsonb; before_count integer;
begin
 if has_table_privilege('anon','aq_editorial_reviews','select') or has_table_privilege('authenticated','aq_editorial_reviews','insert')
  or has_table_privilege('service_role','aq_editorial_reviews','update') then raise exception 'Editorial audit permissions are too broad'; end if;
 if has_function_privilege('anon','aq_save_editorial_review(jsonb)','execute') or has_function_privilege('authenticated','aq_editorial_state(uuid)','execute')
  or has_function_privilege('anon','aq_reconcile_calendar_publications(integer)','execute') then raise exception 'Editorial RPC exposed to clients'; end if;
 for n in 1..3 loop
  sid=prefix||'-'||n;rid=gen_random_uuid();
  insert into aq_source_registry(source_id,org_id,organization,endpoint_url,priority,import_sha256,definition,verification_status,runtime_enabled,last_check_result)
  values(sid,prefix,'Rollback editorial fixture','https://example.org/'||sid,'test',repeat('0',64),jsonb_build_object('source_id',sid,'municipality','Providence','endpoint_type',case when n=3 then 'calendar' else 'news' end,'monitor_mode',case when n=2 then 'public_page' when n=3 then 'calendar' else 'rss' end),case when n=2 then 'page_parsed' when n=3 then 'api_parsed' else 'feed_parsed' end,true,'{"status":"parsed"}');
  insert into aq_collection_runs(id,source_id,status) values(rid,sid,'succeeded');
  if n=1 then
   oid=gen_random_uuid();duplicate_id=gen_random_uuid();
   insert into aq_observations(id,source_id,run_id,url,content_hash,title,evidence_excerpt,source_published_at)
   values(oid,sid,rid,'https://example.org/'||prefix||'/article','original','AI training','AI training for Rhode Island businesses.',now());
  elsif n=2 then
   page_id=gen_random_uuid();insert into aq_observations(id,source_id,run_id,url,content_hash,title,evidence_excerpt)
   values(page_id,sid,rid,'https://example.org/'||prefix||'/page','snapshot','AI page watch','AI training for Rhode Island businesses.');
  end if;
 end loop;
 request=jsonb_build_object('id',oid,'expectedVersion',0,'action','approve','note','Verified original item','title','AI training in Rhode Island','summary','Training information from the source.','aiQuote','AI training','usefulness','Rhode Island business owners can review the training.','kind','news','towns',jsonb_build_array('Rhode Island'));
 response=aq_save_editorial_review(request||jsonb_build_object('aiQuote','Invented AI quote'));
 if (response->>'status')::integer<>422 then raise exception 'Non-exact quote accepted'; end if;
 response=aq_save_editorial_review(request||jsonb_build_object('towns','[]'::jsonb));
 if (response->>'status')::integer<>422 then raise exception 'Missing geography accepted'; end if;
 response=aq_save_editorial_review(request||jsonb_build_object('towns','{}'::jsonb));
 if (response->>'status')::integer<>422 then raise exception 'Malformed geography accepted'; end if;
 response=aq_save_editorial_review(request||jsonb_build_object('id',page_id));
 if (response->>'status')::integer<>422 then raise exception 'Whole-page watch published'; end if;
 response=aq_save_editorial_review(request||jsonb_build_object('kind','event','startsAt',to_char(now()-interval '1 day','YYYY-MM-DD"T"HH24:MI:SS"Z"')));
 if (response->>'status')::integer<>422 then raise exception 'Past event accepted'; end if;
 response=aq_save_editorial_review(request||jsonb_build_object('kind','event','startsAt','2027-10-01'));
 if (response->>'status')::integer<>422 then raise exception 'Event without time/timezone accepted'; end if;
 response=aq_save_editorial_review(request||jsonb_build_object('kind','event','startsAt',to_char(now()+interval '2 days','YYYY-MM-DD"T"HH24:MI:SS"Z"'),'endsAt','infinity'));
 if (response->>'status')::integer<>422 then raise exception 'Unbounded event end time accepted'; end if;
 response=aq_save_editorial_review(request||jsonb_build_object('kind','event','startsAt',to_char(now()+interval '2 days','YYYY-MM-DD"T"HH24:MI:SS"Z"'),'endsAt',to_char(now()+interval '3 days','YYYY-MM-DD"T"HH24:MI:SS')));
 if (response->>'status')::integer<>422 then raise exception 'Event end time without timezone accepted'; end if;
 response=aq_save_editorial_review(request||jsonb_build_object('kind','event','title','Cancelled: AI event','startsAt',to_char(now()+interval '2 days','YYYY-MM-DD"T"HH24:MI:SS"Z"')));
 if (response->>'status')::integer<>422 then raise exception 'Explicitly cancelled event accepted'; end if;
 if (select count(*) from aq_editorial_reviews where canonical_url='https://example.org/'||prefix||'/article')<>0 then raise exception 'Validation failures wrote audit records'; end if;
 response=aq_save_editorial_review(request);
 if response->>'ok'<>'true' or (response->'state'->>'version')::integer<>1 or response->'state'->'entry'->>'status'<>'published' then raise exception 'Valid human approval failed: %',response; end if;
 if (select decision from aq_review_records() where id=oid)<>'candidate' then raise exception 'Approved review not resolved'; end if;
 select id into rid from aq_collection_runs where source_id=prefix||'-1' limit 1;
 insert into aq_observations(id,source_id,run_id,url,content_hash,title,evidence_excerpt,source_published_at,observed_at)
 values(duplicate_id,prefix||'-1',rid,'https://example.org/'||prefix||'/article','revision','AI training updated','AI training for Rhode Island businesses.',now(),now()+interval '1 second');
 insert into aq_classification_trials(request_id,report) values('observation-v1:'||duplicate_id,jsonb_build_object('kind','observation_classification','status','completed','observation_id',duplicate_id,'result',jsonb_build_object('decision','needs_review','reason','New source revision requires review')));
 if (select decision from aq_review_records() where id=duplicate_id)<>'needs_review' then raise exception 'Approval silently approved a newer source revision'; end if;
 response=aq_save_editorial_review(request||jsonb_build_object('expectedVersion',1));
 if (response->>'status')::integer<>409 then raise exception 'Old source revision was approved after a newer revision arrived'; end if;
 if (aq_editorial_state(oid)->>'canApprove')::boolean then raise exception 'Stale item still advertises approval'; end if;
 response=aq_save_editorial_review(request||jsonb_build_object('id',duplicate_id));
 if (response->>'status')::integer<>409 then raise exception 'Concurrent revision did not conflict'; end if;
 response=aq_save_editorial_review(jsonb_build_object('id',oid,'expectedVersion',1,'action','note','note','Follow-up note'));
 if response->>'ok'<>'true' or response->'state'->'entry'->>'status'<>'published' then raise exception 'Note changed publication'; end if;
 response=aq_save_editorial_review(jsonb_build_object('id',oid,'expectedVersion',2,'action','reject','note','Use withdrawal instead'));
 if (response->>'status')::integer<>422 then raise exception 'Reject silently withdrew a publication'; end if;
 response=aq_save_editorial_review(jsonb_build_object('id',oid,'expectedVersion',2,'action','withdraw','note','Source correction'));
 if response->>'ok'<>'true' or response->'state'->'entry'->>'status'<>'withdrawn' then raise exception 'Withdrawal failed'; end if;
 if (select decision from aq_review_records() where id=oid)<>'reject' then raise exception 'Withdrawn review not resolved'; end if;
 response=aq_save_editorial_review(jsonb_build_object('id',page_id,'expectedVersion',0,'action','reject','note','Whole-page evidence is not a story'));
 if response->>'ok'<>'true' then raise exception 'Rejection failed'; end if;
 if not exists(select 1 from aq_entries where observation_id=page_id and status='rejected') then raise exception 'Rejected item could re-enter automatic publication'; end if;

 -- Official-calendar reconciliation: cancellation, date change, unchanged body,
 -- no replacement observation, and past history are deliberately distinct.
 sid=prefix||'-3';select id into rid from aq_collection_runs where source_id=sid limit 1;
 for n in 1..6 loop
  original_id=gen_random_uuid();newer_id=gen_random_uuid();canonical='https://example.org/'||prefix||'/calendar-'||n;
  insert into aq_observations(id,source_id,run_id,url,content_hash,title,evidence_excerpt,source_published_at,observed_at)
  values(original_id,sid,rid,canonical,'original-'||n,'AI event','AI workshop',case when n=5 then now()-interval '2 days' else now()+interval '2 days' end,now()-interval '1 hour');
  insert into aq_entries(observation_id,canonical_url,title,kind,status,towns,local_evidence,ai_evidence,starts_at,published_at)
  values(original_id,canonical,'AI event','event','published',array['Rhode Island'],'Official calendar','AI workshop',case when n=5 then now()-interval '2 days' else now()+interval '2 days' end,now());
  if n<>4 then
   insert into aq_observations(id,source_id,run_id,url,content_hash,title,evidence_excerpt,source_published_at,observed_at)
   values(newer_id,sid,rid,canonical,'replacement-'||n,case when n in(1,5) then 'Cancelled: AI event' when n=6 then 'How AI handles cancelled appointments' else 'AI event' end,'AI workshop with updated description',case when n=2 then now()+interval '3 days' when n=5 then now()-interval '2 days' else now()+interval '2 days' end,now());
  end if;
 end loop;
 response=aq_reconcile_calendar_publications(50);
 if (select count(*) from aq_entries where canonical_url like 'https://example.org/'||prefix||'/calendar-%' and status='withdrawn')<>2 then raise exception 'Calendar reconciliation withdrew wrong items: %',response; end if;
 if exists(select 1 from aq_entries where canonical_url in('https://example.org/'||prefix||'/calendar-3','https://example.org/'||prefix||'/calendar-4','https://example.org/'||prefix||'/calendar-5','https://example.org/'||prefix||'/calendar-6') and status<>'published') then raise exception 'Ordinary edit, disappearance, past event or incidental word treated as cancellation'; end if;
 if (select count(*) from aq_editorial_reviews where canonical_url like 'https://example.org/'||prefix||'/calendar-%' and reviewer='system:calendar-reconciliation')<>2 then raise exception 'Calendar withdrawal audit missing'; end if;
 response=aq_reconcile_calendar_publications(50);
 if (response->>'withdrawn')::integer<>0 then raise exception 'Calendar reconciliation is not idempotent'; end if;
 -- A valid future event is accepted only after explicit editorial input.
 request=request||jsonb_build_object('id',duplicate_id,'expectedVersion',3,'kind','event','startsAt',to_char(now()+interval '2 days','YYYY-MM-DD"T"HH24:MI:SS"Z"'),'endsAt',to_char(now()+interval '2 days 1 hour','YYYY-MM-DD"T"HH24:MI:SS"Z"'));
 response=aq_save_editorial_review(request);
 if response->>'ok'<>'true' or response->'state'->'entry'->>'kind'<>'event' then raise exception 'Valid future event approval failed: %',response; end if;
 raise notice 'Editorial rollback fixtures passed: permissions, exact evidence, explicit geography, snapshot blocking, date checks, optimistic locking, approval, note, rejection, withdrawal, queue resolution and conservative calendar reconciliation.';
end $test$;
