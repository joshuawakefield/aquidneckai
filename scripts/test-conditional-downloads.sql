-- Run in one transaction after the replacement function; rolls back all fixtures.
do $test$
declare sid text:='conditional-fixture-'||gen_random_uuid(); run uuid; result jsonb; cached jsonb; stamp text;
 meta jsonb:='{"endpoint_url":"https://example.org/feed","final_url":"https://example.org/feed","adapter_version":"conditional-v1","etag":"\"v1\""}';
 payload jsonb; n integer;
begin
 insert into aq_source_registry(source_id,org_id,organization,endpoint_url,priority,import_sha256,definition)
 values(sid,sid,sid,'https://example.org/feed','test',repeat('0',64),jsonb_build_object('source_id',sid));
 for n in 1..5 loop
  run:=gen_random_uuid();
  insert into aq_collection_runs(id,source_id) values(run,sid);
  update aq_source_registry set lease_token=run,lease_until=now()+interval '10 minutes' where source_id=sid;
  payload:=case n
   when 1 then jsonb_build_object('status','parsed','http_cache',meta,'entries',jsonb_build_array(jsonb_build_object('url','https://example.org/article','content_hash','fixture1','title','Fixture','description','Evidence')))
   when 2 then jsonb_build_object('status','not_modified','http_cache',meta)
   when 3 then '{"status":"failed","error_type":"Timeout"}'::jsonb
   when 4 then jsonb_build_object('status','not_modified','http_cache',meta)
   when 5 then '{"status":"parsed","entries":[]}'::jsonb end;
  result:=aq_finish_feed_run(sid,run,payload);
  select last_check_result->'http_cache' into cached from aq_source_registry where source_id=sid;
  if n=1 then
   if result->>'new_items'<>'1' or cached->>'etag'<>'"v1"' then raise exception 'Initial cache missing';end if;
   stamp:=cached->>'last_full_fetch_at';
  elsif n in (2,4) then
   if result->>'not_modified'<>'true' or result->>'items'<>'1' or result->>'new_items'<>'0' or cached->>'last_full_fetch_at'<>stamp then raise exception '304 persistence failed';end if;
   if (select count(*) from aq_observations where source_id=sid)<>1 then raise exception '304 changed observations';end if;
   if (select last_check_result->>'status' from aq_source_registry where source_id=sid)<>'parsed' then raise exception '304 readiness lost';end if;
  elsif n=3 then
   if result->>'status'<>'failed' or cached->>'etag'<>'"v1"' then raise exception 'Failure lost cache';end if;
  elsif n=5 then
   if cached is distinct from 'null'::jsonb then raise exception 'Changed response kept old cache';end if;
  end if;
  if aq_finish_feed_run(sid,run,payload)->>'replayed'<>'true' then raise exception 'Replay unsafe';end if;
 end loop;
 run:=gen_random_uuid(); insert into aq_collection_runs(id,source_id) values(run,sid);
 update aq_source_registry set lease_token=run where source_id=sid;
 begin
  perform aq_finish_feed_run(sid,run,jsonb_build_object('status','not_modified','http_cache',meta));
  raise exception 'Unexpected304Accepted';
 exception when others then
  if sqlerrm<>'Uncached not-modified response' then raise;end if;
 end;
 if has_function_privilege('anon','aq_finish_feed_run(text,uuid,jsonb)','execute') or has_function_privilege('authenticated','aq_finish_feed_run(text,uuid,jsonb)','execute') then raise exception 'Function exposed';end if;
end $test$;
select 'conditional persistence scenarios passed; fixtures rolled back' as result;
rollback;
