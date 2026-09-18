"""Allowlisted source adapter: stdin source JSON -> normalized feed-like JSON."""
import json
import re
import sys
import urllib.request
from audit_registry_pilot import check
from audit_sources import ROOT
from expanded_feeds import FEEDS

SALVE_API = 'https://events.salve.edu/api/2/events?days=30&pp=100&for=main'
AI = re.compile(r'\b(?:AI|artificial intelligence|machine learning|ChatGPT|generative AI|large language models?|LLMs?|neural networks?)\b', re.I)
STRONG_AI = re.compile(r'\b(?:artificial intelligence|machine learning|ChatGPT|generative AI|large language models?|LLMs?|neural networks?)\b', re.I)

def salve_events():
    request=urllib.request.Request(SALVE_API,headers={'User-Agent':'AquidneckAI/0.1 (+https://aquidneckai.com)','Accept':'application/json'})
    with urllib.request.urlopen(request,timeout=20) as response:
        body=response.read(3_000_001)
        if len(body)>3_000_000: raise ValueError('ResponseTooLarge')
    payload=json.loads(body)
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
    return {'status':'parsed','entries':entries}

if __name__=='__main__':
    source=json.load(sys.stdin)
    if source.get('source_id')=='salve-events' and source.get('endpoint_url')==SALVE_API:
        try: result=salve_events()
        except Exception as error: result={'status':'failed','error_type':type(error).__name__}
    elif FEEDS.get(source.get('source_id')) == source.get('endpoint_url') and source.get('source_id') in FEEDS:
        result=check(source)
    else:
        allowed=json.loads((ROOT/'data/imports/pilot-candidates.json').read_text(encoding='utf-8'))
        if not any(s['source_id']==source.get('source_id') and s['endpoint_url']==source.get('endpoint_url') and s['monitor_mode']=='rss' for s in allowed):
            result={'status':'failed','error_type':'UnsupportedEndpoint'}
        else: result=check(source)
    print(json.dumps(result))
