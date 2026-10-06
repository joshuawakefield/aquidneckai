-- Run after the migration inside its rollback verification transaction.
do $$
declare sid text:='expansion-rollback-fixture';s aq_source_registry;h jsonb;
begin
 if public.aq_source_eligible('{"monitor_enabled":true,"monitor_mode":"public_page"}', 'imported_unverified') then raise exception 'Unverified page eligible';end if;
 if not public.aq_source_eligible('{"monitor_enabled":true,"monitor_mode":"public_page"}', 'page_parsed') then raise exception 'Verified page excluded';end if;
 insert into aq_source_registry(source_id,org_id,organization,endpoint_url,priority,import_sha256,definition,verification_status,runtime_enabled,next_check_at)
 values(sid,'test','Rollback only','https://example.org/page','P0','test',jsonb_build_object('source_id',sid,'monitor_enabled',true,'monitor_mode','public_page','poll_interval_minutes',1440),'page_parsed',true,'2000-01-01');
 select * into s from aq_claim_feed_sources() where source_id=sid;
 if s.lease_token is null then raise exception 'Page was not claimed';end if;
 if exists(select 1 from aq_claim_feed_sources() where source_id=sid) then raise exception 'Lease claimed twice';end if;
 perform aq_finish_feed_run(sid,s.lease_token,'{"status":"parsed","entries":[{"url":"https://example.org/page","title":"Fixture","description":"AI course","content_hash":"test"}]}');
 if (select count(*) from aq_observations where source_id=sid)<>1 then raise exception 'Snapshot not persisted';end if;
 h:=aq_preview_summary();
 if not exists(select 1 from jsonb_array_elements(h->'sources') x where x->>'id'=sid and x->>'collecting'='true' and x->>'mode'='public_page') then raise exception 'Dashboard page readiness lost';end if;
 if not has_function_privilege('service_role','public.aq_source_eligible(jsonb,text)','execute') then raise exception 'Service access lost';end if;
 if has_function_privilege('anon','public.aq_source_eligible(jsonb,text)','execute') then raise exception 'Anonymous access opened';end if;
end$$;
select 'Source expansion rollback checks passed' as result;
