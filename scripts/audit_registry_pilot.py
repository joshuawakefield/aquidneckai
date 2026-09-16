"""Bounded read-only audit of imported RSS candidates; no AI or publication."""
import concurrent.futures
import datetime as dt
import json
from audit_sources import ROOT, AI, download, feed_entries


def check(source):
    result = {'source_id': source['source_id'], 'url': source['endpoint_url'],
              'checked_at': dt.datetime.now(dt.timezone.utc).isoformat()}
    try:
        final_url, body = download(source['endpoint_url'])
        entries = feed_entries(body, final_url)
        result.update(status='parsed', final_url=final_url, item_count=len(entries),
                      entries=entries,
                      title_candidates=[x for x in entries if AI.search(x['title'])])
    except Exception as error:
        result.update(status='failed', error_type=type(error).__name__, error=str(error))
    return result


if __name__ == '__main__':
    sources = json.loads((ROOT / 'data/imports/pilot-candidates.json').read_text(encoding='utf-8'))
    sources = [s for s in sources if s['monitor_mode'] == 'rss']
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(check, sources))
    report = {'scope': 'read-only RSS accessibility audit, not verified AI coverage', 'sources': results}
    (ROOT / 'data/registry-pilot-audit.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    for result in results:
        print(json.dumps({k: v for k, v in result.items() if k not in ('entries', 'title_candidates')}), flush=True)
