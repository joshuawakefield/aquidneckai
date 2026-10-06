-- Apply alone; preserves existing source IDs, leases, history and service-only permissions.
begin;
create or replace function public.aq_finish_feed_run(p_source_id text,p_lease_token uuid,p_result jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare s public.aq_source_registry; r public.aq_collection_runs; e jsonb; n integer:=0; added integer;
 total integer; stamp timestamptz:=clock_timestamp(); ok boolean; cadence integer; unchanged boolean; cache jsonb;
begin
 select * into s from public.aq_source_registry where source_id=p_source_id for update;
 select * into r from public.aq_collection_runs where id=p_lease_token and source_id=p_source_id;
 if r.id is null then raise exception 'Unknown run'; end if;
 if r.status<>'running' then return jsonb_build_object('status',r.status,'new_items',r.new_item_count,'replayed',true); end if;
 if s.lease_token is distinct from p_lease_token then raise exception 'Stale lease'; end if;
 if p_result->>'status' not in ('parsed','failed','not_modified') or p_result->>'status' is null then raise exception 'Invalid status'; end if;
 unchanged:=p_result->>'status'='not_modified';
 ok:=p_result->>'status' in ('parsed','not_modified');
 cache:=s.last_check_result->'http_cache';
 if unchanged and (cache is null or cache->>'endpoint_url' is distinct from s.endpoint_url
   or cache->>'final_url' is distinct from s.endpoint_url or cache->>'adapter_version' is distinct from 'conditional-v1'
   or cache->>'last_full_fetch_at' is null or coalesce(cache->>'etag',cache->>'last_modified') is null
   or p_result->'http_cache'->>'endpoint_url' is distinct from s.endpoint_url
   or p_result->'http_cache'->>'final_url' is distinct from s.endpoint_url
   or p_result->'http_cache'->>'adapter_version' is distinct from 'conditional-v1') then
  raise exception 'Uncached not-modified response';
 end if;
 total:=case when unchanged then (cache->>'item_count')::integer
   when ok then jsonb_array_length(p_result->'entries') else 0 end;
 if total is null or total<0 or total>500 then raise exception 'Invalid item count'; end if;
 if ok and not unchanged then
  for e in select value from jsonb_array_elements(p_result->'entries') loop
   insert into public.aq_observations(source_id,run_id,url,content_hash,title,evidence_excerpt,source_published_at)
   values(p_source_id,p_lease_token,e->>'url',e->>'content_hash',e->>'title',e->>'description',
     nullif(e->>'published_at','')::timestamptz)
   on conflict(source_id,url,content_hash) do nothing;
   get diagnostics added=row_count; n:=n+added;
  end loop;
 end if;
 update public.aq_collection_runs set status=case when ok then 'succeeded' else 'failed' end,
  finished_at=stamp,item_count=total,new_item_count=n,error_code=case when ok then null else left(p_result->>'error_type',80) end
 where id=p_lease_token;
 if ok then
  if p_result->'http_cache'->>'endpoint_url'=s.endpoint_url
    and p_result->'http_cache'->>'adapter_version'='conditional-v1' then
   cache:=(case when unchanged then cache else '{}'::jsonb end)||p_result->'http_cache'
     ||jsonb_build_object('item_count',total,'last_full_fetch_at',case when unchanged then cache->>'last_full_fetch_at' else stamp::text end);
  else cache:=null; end if;
 end if;
 insert into public.aq_source_checks(source_id,checked_at,check_kind,status,item_count,details)
 values(p_source_id,stamp,'rss_parse',case when ok then 'parsed' else 'failed' end,total,jsonb_build_object('run_id',p_lease_token,'new_items',n,'not_modified',unchanged));
 cadence:=greatest(15,least(10080,coalesce((s.definition->>'poll_interval_minutes')::integer,360)));
 update public.aq_source_registry set last_checked_at=stamp,
  last_check_result=jsonb_build_object('status',case when ok then 'parsed' else 'failed' end,'item_count',total,'new_items',n,'run_id',p_lease_token,'not_modified',unchanged,'http_cache',cache),
  next_check_at=stamp+make_interval(mins=>case when ok then cadence else greatest(60,cadence) end),
  lease_until=null,lease_token=null where source_id=p_source_id;
 return jsonb_build_object('status',case when ok then 'succeeded' else 'failed' end,'items',total,'new_items',n,'replayed',false,'not_modified',unchanged);
end $$;
revoke all on function public.aq_finish_feed_run(text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.aq_finish_feed_run(text,uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
