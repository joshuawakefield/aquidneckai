-- All fixture runs and observations are rolled back.
begin;
do $$
declare n integer; s public.aq_source_registry; first_result jsonb; replay jsonb;
 payload jsonb:='{"status":"parsed","entries":[{"url":"https://example.org/aqai-test","content_hash":"test-fixture","title":"Rollback test only","description":"Not real content","published_at":null}]}';
begin
 select count(*) into n from public.aq_claim_feed_sources(false);
 if n<>0 then raise exception 'Disabled sources were scheduled'; end if;
 create temporary table test_claims as select * from public.aq_claim_feed_sources(true);
 select count(*) into n from test_claims;
 if n<>7 then raise exception 'Expected seven pilot claims, got %',n; end if;
 select count(*) into n from public.aq_claim_feed_sources(true);
 if n<>0 then raise exception 'Leased sources claimed twice'; end if;
 select * into s from test_claims order by source_id limit 1;
 first_result:=public.aq_finish_feed_run(s.source_id,s.lease_token,payload);
 replay:=public.aq_finish_feed_run(s.source_id,s.lease_token,payload);
 if first_result->>'new_items'<>'1' or replay->>'replayed'<>'true' then raise exception 'Replay handling failed'; end if;
 select * into s from public.aq_claim_feed_sources(true) limit 1;
 first_result:=public.aq_finish_feed_run(s.source_id,s.lease_token,payload);
 if first_result->>'new_items'<>'0' then raise exception 'Duplicate observation inserted'; end if;
end $$;
select 'passed: disabled scheduling, lease exclusion, replay safety, cross-run dedup' as result;
rollback;
