"""Allowlisted source adapter: stdin source JSON -> normalized feed-like JSON."""
import json
import re
import sys
from conditional_download import download
from audit_registry_pilot import check
from audit_sources import ROOT
from expanded_feeds import FEEDS
from source_pages import check_page

CATALOG=json.loads((ROOT/'scripts/source-catalog.json').read_text(encoding='utf-8'))

SALVE_API = 'https://events.salve.edu/api/2/events?days=30&pp=100&for=main'
AI = re.compile(r'\b(?:AI|artificial intelligence|machine learning|ChatGPT|generative AI|large language models?|LLMs?|neural networks?)\b', re.I)
STRONG_AI = re.compile(r'\b(?:artificial intelligence|machine learning|ChatGPT|generative AI|large language models?|LLMs?|neural networks?)\b', re.I)

def salve_events(cache=None):
    fetched=download(SALVE_API,cache,accept='application/json')
    if fetched['status']=='not_modified': return fetched
    payload=json.loads(fetched['body'])
    if not isinstance(payload.get('events'),list) or len(payload['events'])>500: raise ValueError('InvalidEventResponse')
    entries=[]
    for wrapper in payload['events']:
        event=wrapper.get('event') or {}
        title=str(event.get('title') or '').strip();description=str(event.get('description_text') or '')
        if not (AI.search(title) or STRONG_AI.search(description)): continue
        instances=event.get('event_instances') or []
        instance=(instances[0].get('event_instance') or {}) if instances else {}
        url=event.get('localist_url')
        start=instance.get('start')
        if not isinstance(url,str) or not url.startswith('https://events.salve.edu/event/') or not start: continue
        location=' · '.join(filter(None,[event.get('location_name'),event.get('address')]))
        entries.append({'title':title,'url':url,'sourceDate':start,
          'description':'\n'.join(filter(None,[description,location]))})
    return {'status':'parsed','entries':entries,'http_cache':fetched['http_cache']}

if __name__=='__main__':
    source=json.load(sys.stdin)
    configured=CATALOG.get(source.get('source_id'),{})
    if configured.get('url')==source.get('endpoint_url') and configured.get('mode') in ('public_page','rss'):
        try:
            result=check_page({**source,'include_forms':configured.get('include_forms',False),'max_response_bytes':configured.get('max_response_bytes',3_000_000)}) if configured['mode']=='public_page' else check({**source,'use_syndicated_content':configured.get('use_syndicated_content',False)})
            if configured['mode']=='rss' and result.get('status')=='parsed' and configured.get('max_items'):
                result['entries']=result['entries'][:max(1,min(100,int(configured['max_items'])))]
        except Exception as error: result={'status':'failed','error_type':type(error).__name__+':'+str(error)[:60]}
    elif source.get('source_id')=='salve-events' and source.get('endpoint_url')==SALVE_API:
        try: result=salve_events(source.get('http_cache'))
        except Exception as error: result={'status':'failed','error_type':type(error).__name__}
    elif FEEDS.get(source.get('source_id')) == source.get('endpoint_url') and source.get('source_id') in FEEDS:
        result=check(source)
    else:
        allowed=json.loads((ROOT/'data/imports/pilot-candidates.json').read_text(encoding='utf-8'))
        if not any(s['source_id']==source.get('source_id') and s['endpoint_url']==source.get('endpoint_url') and s['monitor_mode']=='rss' for s in allowed):
            result={'status':'failed','error_type':'UnsupportedEndpoint'}
        else: result=check(source)
    print(json.dumps(result))
