-- Retarget the unused pilot pipeline to the canonical endpoint registry.
-- Fails atomically if legacy observations/runs need a migration first.
begin;
alter table public.aq_collection_runs drop constraint aq_collection_runs_source_id_fkey;
alter table public.aq_collection_runs add constraint aq_collection_runs_source_id_fkey
 foreign key(source_id) references public.aq_source_registry(source_id);
alter table public.aq_observations drop constraint aq_observations_source_id_fkey;
alter table public.aq_observations add constraint aq_observations_source_id_fkey
 foreign key(source_id) references public.aq_source_registry(source_id);
comment on table public.aq_sources is 'Legacy six-source discovery seed. Collector uses aq_source_registry exclusively.';
alter table public.aq_source_registry add column next_check_at timestamptz,
 add column lease_until timestamptz, add column lease_token uuid;
alter table public.aq_collection_runs add column new_item_count integer not null default 0;

create function public.aq_claim_feed_sources(p_pilot boolean default false)
returns setof public.aq_source_registry language plpgsql security invoker
set search_path=public,pg_temp as $$
begin
 update public.aq_collection_runs r set status='failed',finished_at=now(),error_code='lease_expired'
 from public.aq_source_registry s where r.id=s.lease_token and r.status='running' and s.lease_until<now();
 return query
 with due as (
  select source_id from public.aq_source_registry
  where definition->>'monitor_enabled'='true' and definition->>'monitor_mode'='rss'
   and verification_status='feed_parsed'
   and (lease_until is null or lease_until<now())
   and (p_pilot or (runtime_enabled and (next_check_at is null or next_check_at<=now())))
  order by priority,source_id for update skip locked limit 7
 ), claimed as (
  update public.aq_source_registry s set lease_token=gen_random_uuid(),lease_until=now()+interval '10 minutes'
  from due where s.source_id=due.source_id returning s.*
 ), runs as (
  insert into public.aq_collection_runs(id,source_id) select lease_token,source_id from claimed
  returning id
 ) select c.* from claimed c join runs r on r.id=c.lease_token;
end $$;

create function public.aq_finish_feed_run(p_source_id text,p_lease_token uuid,p_result jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare s public.aq_source_registry; r public.aq_collection_runs; e jsonb; n integer:=0; added integer;
 total integer; stamp timestamptz:=clock_timestamp(); ok boolean; cadence integer;
begin
 select * into s from public.aq_source_registry where source_id=p_source_id for update;
 select * into r from public.aq_collection_runs where id=p_lease_token and source_id=p_source_id;
 if r.id is null then raise exception 'Unknown run'; end if;
 if r.status<>'running' then return jsonb_build_object('status',r.status,'new_items',r.new_item_count,'replayed',true); end if;
 if s.lease_token is distinct from p_lease_token then raise exception 'Stale lease'; end if;
 if p_result->>'status' not in ('parsed','failed') or p_result->>'status' is null then raise exception 'Invalid status'; end if;
 ok:=p_result->>'status'='parsed';
 total:=case when ok then jsonb_array_length(p_result->'entries') else 0 end;
 if total is null or total>500 then raise exception 'Invalid item count'; end if;
 if ok then
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
 insert into public.aq_source_checks(source_id,checked_at,check_kind,status,item_count,details)
 values(p_source_id,stamp,'rss_parse',p_result->>'status',total,jsonb_build_object('run_id',p_lease_token,'new_items',n));
 cadence:=greatest(15,least(10080,coalesce((s.definition->>'poll_interval_minutes')::integer,360)));
 update public.aq_source_registry set last_checked_at=stamp,
  last_check_result=jsonb_build_object('status',p_result->>'status','item_count',total,'new_items',n,'run_id',p_lease_token),
  next_check_at=stamp+make_interval(mins=>case when ok then cadence else greatest(60,cadence) end),
  lease_until=null,lease_token=null where source_id=p_source_id;
 return jsonb_build_object('status',case when ok then 'succeeded' else 'failed' end,'items',total,'new_items',n,'replayed',false);
end $$;
revoke all on function public.aq_claim_feed_sources(boolean),public.aq_finish_feed_run(text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.aq_claim_feed_sources(boolean),public.aq_finish_feed_run(text,uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
