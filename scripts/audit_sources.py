"""Read-only pilot audit. No AI charges, account credentials, or publication.

Run: python scripts/audit_sources.py
Outputs preserve failures and review candidates separately. Discovery is limited
to the registry and at most two same-host feeds per source, never a whole crawl.
"""
import concurrent.futures
import datetime as dt
import hashlib
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AI = re.compile(r"\b(?:AI|artificial intelligence|machine learning|ChatGPT|generative AI)\b", re.I)
MAX_BYTES = 3_000_000


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.feeds, self.words = [], [], []
        self.hidden = 0
        self.anchor = None

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag in ('script', 'style', 'noscript'):
            self.hidden += 1
        if tag == 'link' and attrs.get('type', '') in ('application/rss+xml', 'application/atom+xml'):
            self.feeds.append(attrs.get('href') or '')
        if tag == 'a':
            self.anchor = [attrs.get('href') or '', []]

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript'):
            self.hidden = max(0, self.hidden - 1)
        if tag == 'a' and self.anchor:
            self.links.append((self.anchor[0], ' '.join(self.anchor[1])))
            self.anchor = None

    def handle_data(self, value):
        if not self.hidden and value.strip():
            value = ' '.join(value.split())
            self.words.append(value)
            if self.anchor:
                self.anchor[1].append(value)


def web_url(value, base):
    url = urllib.parse.urljoin(base, value)
    parts = urllib.parse.urlsplit(url)
    if parts.scheme not in ('http', 'https') or not parts.hostname or parts.username or parts.password:
        return None
    return urllib.parse.urlunsplit(parts._replace(fragment=''))


def download(url):
    request = urllib.request.Request(url, headers={
        'User-Agent': 'AquidneckAI-SourceAudit/0.1 (+https://aquidneckai.com)',
        'Accept': 'text/html, application/rss+xml, application/atom+xml, application/xml;q=0.9',
    })
    for attempt in range(2):
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                body = response.read(MAX_BYTES + 1)
                if len(body) > MAX_BYTES:
                    raise ValueError('Response exceeds 3 MB audit limit')
                encoding = response.headers.get_content_charset() or 'utf-8'
                return response.geturl(), body.decode(encoding, errors='replace')
        except urllib.error.HTTPError as error:
            if error.code not in (502, 503, 504) or attempt:
                raise
        except (TimeoutError, urllib.error.URLError):
            if attempt:
                raise
        time.sleep(1)


def feed_entries(body, base):
    if re.search(r'<!\s*(DOCTYPE|ENTITY)', body, re.I):
        raise ValueError('DTD/entity declarations are not supported')
    root = ET.fromstring(body)
    local = lambda tag: tag.rsplit('}', 1)[-1]
    if local(root.tag) not in ('rss', 'feed', 'RDF'):
        raise ValueError('Response is not RSS or Atom')
    entries = []
    for item in root.iter():
        if local(item.tag) not in ('item', 'entry'):
            continue
        fields = {}
        for child in item:
            key = local(child.tag)
            if key == 'link' and child.attrib.get('rel', 'alternate') == 'alternate':
                fields['link'] = child.attrib.get('href') or ''.join(child.itertext())
            elif key in ('title', 'description', 'summary', 'pubDate', 'published'):
                fields[key] = ''.join(child.itertext())
        url = web_url(fields.get('link', ''), base) if fields.get('link') else None
        if url:
            entries.append({'title': fields.get('title', '').strip(), 'url': url,
                            'sourceDate': fields.get('pubDate') or fields.get('published'),
                            'description': fields.get('description') or fields.get('summary', '')})
    return entries


def audit(source):
    result = {**source, 'checkedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
              'status': 'failed', 'feeds': [], 'candidates': []}
    try:
        final_url, body = download(source['url'])
        page = Page()
        page.feed(body)
        result.update(status='reachable', finalUrl=final_url,
                      contentHash=hashlib.sha256(body.encode()).hexdigest())
        discovered = page.feeds + [url for url, _ in page.links if re.search(r'(?:rss|feed|atom)', url, re.I)]
        feeds = []
        for href in discovered:
            url = web_url(href, final_url)
            if (url and url != final_url and '/comments/feed' not in url and urllib.parse.urlsplit(url).hostname == urllib.parse.urlsplit(final_url).hostname
                    and url not in feeds):
                feeds.append(url)
        # CivicPlus RSS directories list page feeds first; news/calendar are the
        # useful initial audit targets. Other discovered feeds remain recorded.
        feeds.sort(key=lambda url: (not bool(re.search(r'(?:CID=All|calendar|newsflash)', url, re.I)), url))
        result['discoveredFeeds'] = feeds
        candidates = [{'title': title, 'url': web_url(href, final_url), 'sourceDate': None}
                      for href, title in page.links if AI.search(title) and web_url(href, final_url)]
        if AI.search(' '.join(page.words)):
            result['pageHasAiMention'] = True
        for url in feeds[:2]:
            feed = {'url': url, 'status': 'failed'}
            try:
                resolved, xml = download(url)
                entries = feed_entries(xml, resolved)
                feed.update(status='parsed', entryCount=len(entries))
                for entry in entries:
                    if AI.search(entry['title']):
                        candidates.append({key: value for key, value in entry.items() if key != 'description'})
            except Exception as error:
                feed['error'] = str(error)
            result['feeds'].append(feed)
        seen = set()
        for candidate in candidates:
            if candidate['url'] not in seen:
                seen.add(candidate['url'])
                result['candidates'].append({**candidate, 'status': 'needs_review',
                    'reason': 'AI term in title. Local relevance, date, and underlying evidence still need validation.'})
    except Exception as error:
        result['status'] = 'failed'
        result['error'] = str(error)
    return result


def main():
    sources = json.loads((ROOT / 'data/sources.json').read_text(encoding='utf-8-sig'))
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(audit, sources))
    output = ROOT / 'data/source-audit.json'
    output.write_text(json.dumps({'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
                                 'mode': 'read-only pilot; not publication', 'sources': results}, indent=2), encoding='utf-8')
    for result in results:
        print(f"{result['name']}: {result['status']}; {sum(f['status'] == 'parsed' for f in result['feeds'])} feeds parsed; {len(result['candidates'])} review candidates")
    print(f'Report saved: {output}')


if __name__ == '__main__':
    main()
