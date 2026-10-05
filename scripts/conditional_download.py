"""Bounded public-source GETs with persisted, representation-specific validators."""
import datetime as dt
import gzip
import io
import re
import time
import urllib.error
import urllib.request
from email.utils import parsedate_to_datetime

VERSION = 'conditional-v1'
MAX_BYTES = 3_000_000


def validator(value, kind):
    if not isinstance(value, str) or not value or len(value) > 1024:
        return None
    if any(ord(c) < 32 or ord(c) > 126 for c in value):
        return None
    if kind == 'etag':
        return value if re.fullmatch(r'(?:W/)?"[\x21\x23-\x7e]*"', value) else None
    try:
        return value if parsedate_to_datetime(value).tzinfo else None
    except (TypeError, ValueError, OverflowError):
        return None


class PublicRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected:
            redirected.remove_header('If-none-match')
            redirected.remove_header('If-modified-since')
        return redirected


def download(url, cache=None, accept='application/rss+xml, application/atom+xml, application/xml;q=0.9', opener=None):
    cache = cache if isinstance(cache, dict) else {}
    headers = {'User-Agent': 'AquidneckAI/0.1 (+https://aquidneckai.com)', 'Accept': accept}
    usable = False
    try:
        age = (dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(cache['last_full_fetch_at'])).total_seconds()
        usable = (cache.get('endpoint_url') == url == cache.get('final_url') and
                  cache.get('adapter_version') == VERSION and 0 <= age < 86400)
    except (KeyError, TypeError, ValueError):
        pass
    if usable:
        for key, header in [('etag', 'If-None-Match'), ('last_modified', 'If-Modified-Since')]:
            value = validator(cache.get(key), key)
            if value:
                headers[header] = value
    conditional = 'If-None-Match' in headers or 'If-Modified-Since' in headers
    open_url = opener or urllib.request.build_opener(PublicRedirect()).open
    for attempt in range(2):
        try:
            response = open_url(urllib.request.Request(url, headers=headers), timeout=20)
            break
        except urllib.error.HTTPError as error:
            if error.code == 304:
                if not conditional or error.geturl() != url:
                    error.close()
                    raise ValueError('UnexpectedNotModified')
                response = error
                break
            if error.code not in (502, 503, 504) or attempt:
                raise
            error.close()
        except (TimeoutError, urllib.error.URLError):
            if attempt:
                raise
        time.sleep(1)
    with response:
        status = response.code
        if status not in (200, 304):
            raise ValueError('UnexpectedHTTPStatus')
        if status == 304 and (not conditional or response.geturl() != url):
            raise ValueError('UnexpectedNotModified')
        metadata = {'endpoint_url': url, 'final_url': response.geturl(), 'adapter_version': VERSION}
        for key, header in [('etag', 'ETag'), ('last_modified', 'Last-Modified')]:
            value = validator(response.headers.get(header), key)
            if value is None and status == 304:
                value = validator(cache.get(key), key)
            if value:
                metadata[key] = value
        if status == 304:
            return {'status': 'not_modified', 'http_cache': metadata}
        body = response.read(MAX_BYTES + 1)
        if len(body) > MAX_BYTES:
            raise ValueError('ResponseTooLarge')
        encoding = response.headers.get('Content-Encoding', 'identity').lower().strip()
        if encoding == 'gzip':
            with gzip.GzipFile(fileobj=io.BytesIO(body)) as compressed:
                body = compressed.read(MAX_BYTES + 1)
            if len(body) > MAX_BYTES:
                raise ValueError('ResponseTooLarge')
        elif encoding not in ('', 'identity'):
            raise ValueError('UnsupportedContentEncoding')
        return {'status': 'downloaded', 'http_cache': metadata,
                'body': body.decode(response.headers.get_content_charset() or 'utf-8', errors='replace')}
