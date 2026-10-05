"""Monitor a configured public page; never enroll or crawl linked websites."""
import re
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit
from conditional_download import download

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
SKIP = {'script','style','noscript','svg','nav','header','footer','form','button','select','aside'}
BLOCK = {'p','div','section','article','li','h1','h2','h3','h4','tr','br'}
WALL = re.compile(r'^(?:access denied|just a moment|attention required|request rejected|forbidden|page not found|404\b|log in|sign in)',re.I)
AI = re.compile(r'\b(?:AI|artificial intelligence|machine learning|deep learning|ChatGPT|generative AI|large language models?|LLMs?|neural networks?)\b',re.I)


def evidence_excerpt(text, limit=18500):
    # Keep the opening context plus AI-bearing passages even on long municipal indexes.
    if len(text)<=limit:return text
    spans=[(0,3000)]
    for match in AI.finditer(text):
        start=max(0,match.start()-500);end=min(len(text),match.end()+900)
        if start<=spans[-1][1]:spans[-1]=(spans[-1][0],max(end,spans[-1][1]))
        else:spans.append((start,end))
    return '\n[... excerpt ...]\n'.join(text[a:b] for a,b in spans)[:limit]


class PublicPage(HTMLParser):
    def __init__(self, url):
        super().__init__(convert_charrefs=True)
        self.url=url; self.stack=[]; self.all=[]; self.main=[]; self.titles=[]; self.feeds=[]

    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        hidden=(self.stack[-1][1] if self.stack else False) or tag in SKIP or 'hidden' in attrs or attrs.get('aria-hidden')=='true'
        main=(self.stack[-1][2] if self.stack else False) or tag=='main' or attrs.get('role')=='main'
        if tag=='link' and attrs.get('type') in ('application/rss+xml','application/atom+xml'):
            self.feeds.append(urljoin(self.url,attrs.get('href','')))
        if not hidden and tag in BLOCK:
            self.all.append('\n')
            if main:self.main.append('\n')
        if tag not in VOID:self.stack.append((tag,hidden,main))

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0]==tag:
                del self.stack[i:]
                break
        if tag in BLOCK:
            self.all.append('\n');self.main.append('\n')

    def handle_data(self, value):
        if any(x[0]=='title' for x in self.stack):self.titles.append(value)
        if self.stack and not self.stack[-1][1] and not any(x[0]=='head' for x in self.stack):
            self.all.append(value)
            if self.stack[-1][2]:self.main.append(value)

    def content(self):
        clean=lambda parts:'\n'.join(dict.fromkeys(line for line in (re.sub(r'\s+',' ',x).strip() for x in ''.join(parts).split('\n')) if line))
        main=clean(self.main)
        return main if len(main)>=180 else clean(self.all)


def parse_page(body,url):
    if not re.search(r'<(?:html|body|main|article|!doctype html)\b',body[:20000],re.I):raise ValueError('NotHTMLPage')
    page=PublicPage(url);page.feed(body)
    title=re.sub(r'\s+',' ',' '.join(page.titles)).strip()
    text=page.content()
    if WALL.search(title) or len(text)<180:raise ValueError('NoUsablePublicContent')
    if re.search(r'(enable javascript|javascript (?:is )?required|checking your browser|verify you are human)',text[:1500],re.I) and len(text)<2500:
        raise ValueError('BrowserOrAccessRequired')
    if re.search(r'(your session will expire|welcome to clerkbase|open default modal)',text,re.I):
        raise ValueError('PortalShellNeedsAdapter')
    return {'title':title or urlsplit(url).hostname,'text':text,'advertised_feeds':list(dict.fromkeys(page.feeds))[:8]}


def check_page(source):
    fetched=download(source['endpoint_url'],source.get('http_cache'),accept='text/html, application/xhtml+xml')
    if fetched['status']=='not_modified':return fetched
    url=fetched['http_cache']['final_url']
    page=parse_page(fetched['body'],url)
    # A source-page snapshot is deliberately not described as a full linked article or PDF.
    return {'status':'parsed','http_cache':fetched['http_cache'],
            'evidence_scope':'public_page_snapshot','advertised_feeds':page['advertised_feeds'],
            'text_length':len(page['text']),
            'entries':[{'title':page['title'],'url':url,'sourceDate':None,
                        'description':'Public source-page snapshot; linked articles, attachments and private portal contents are not included.\n'+evidence_excerpt(page['text'])}]}
