-- Additive read-only RPC replacement. Apply alone; no editorial decisions change.
begin;
create or replace function public.aq_review_page(p_decision text default 'needs_review',p_query text default '',p_offset integer default 0,p_limit integer default 25)
returns jsonb language sql stable security invoker set search_path=public,pg_temp as $$
 with matching as (
  select r.*,s.definition->>'monitor_mode' as source_mode
  from aq_review_records() r
  left join aq_source_registry s on s.source_id=r.source_id and p_decision='candidate'
  where (p_decision='all' or r.decision=p_decision)
   and (coalesce(p_query,'')='' or strpos(lower(r.title||' '||r.source||' '||coalesce(r.excerpt,'')),lower(left(p_query,200)))>0)
 ), page as (
  select id,title,url,source,date,decision,issue,reason,"aiEvidence","localEvidence","modelDecision","modelReason",status,destination
  from matching
  order by
   -- Individual records can be reviewed for publication; a whole-page watch
   -- still needs article-level evidence. This is readiness, not importance.
   case when p_decision='candidate' and source_mode in('rss','calendar') then 0 when p_decision='candidate' then 1 else 0 end,
   case when p_decision='candidate' and destination='archive_review' then 1 else 0 end,
   observed_at desc,id desc
  offset greatest(0,least(coalesce(p_offset,0),1000000)) limit greatest(1,least(coalesce(p_limit,25),50))
 ) select jsonb_build_object('total',(select count(*) from matching),
   'items',coalesce((select jsonb_agg(to_jsonb(p)) from page p),'[]'::jsonb))
$$;
revoke all on function public.aq_review_page(text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.aq_review_page(text,text,integer,integer) to service_role;
notify pgrst,'reload schema';
commit;
