import datetime as dt
import io
import gzip
import unittest
import urllib.error
import urllib.request
from email.message import Message
from unittest.mock import Mock, patch
from conditional_download import download, PublicRedirect, validator
from audit_registry_pilot import check

URL = 'https://example.org/feed'


def headers(**values):
    result = Message()
    for key, value in values.items():
        result[key.replace('_', '-')] = value
    return result


def response(body=b'<rss/>', **values):
    result = Mock()
    result.code = 200
    result.headers = headers(**values)
    result.geturl.return_value = URL
    result.read.return_value = body
    result.__enter__ = Mock(return_value=result)
    result.__exit__ = Mock(return_value=False)
    return result


def cache(**values):
    return dict(endpoint_url=URL, final_url=URL, adapter_version='conditional-v1', etag='W/"v1"',
                last_modified='Wed, 01 Oct 2025 12:00:00 GMT',
                last_full_fetch_at=dt.datetime.now(dt.timezone.utc).isoformat(), **values)


class ConditionalTests(unittest.TestCase):
    def test_reviewed_large_source_has_a_hard_per_source_ceiling(self):
        body=b'x'*3_000_001
        self.assertEqual(len(download(URL,opener=Mock(return_value=response(body)),max_bytes=8_000_000)['body']),len(body))
        with self.assertRaisesRegex(ValueError,'ResponseTooLarge'):
            download(URL,opener=Mock(return_value=response(b'x'*8_000_001)),max_bytes=8_000_000)
        with self.assertRaisesRegex(ValueError,'InvalidResponseLimit'):
            download(URL,max_bytes=8_000_001)

    def test_gzip_response_and_decompressed_size_limit(self):
        result=download(URL,opener=Mock(return_value=response(gzip.compress(b'<rss/>'),Content_Encoding='gzip')))
        self.assertEqual(result['body'],'<rss/>')
        with self.assertRaisesRegex(ValueError,'ResponseTooLarge'):
            download(URL,opener=Mock(return_value=response(gzip.compress(b'x'*3_000_001),Content_Encoding='gzip')))

    def test_initial_fetch_captures_validators(self):
        opened = Mock(return_value=response(ETag='"v2"'))
        result = download(URL, opener=opened)
        self.assertEqual(result['http_cache']['etag'], '"v2"')
        self.assertNotIn('If-none-match', opened.call_args.args[0].headers)

    def test_304_sends_both_validators_and_never_reads_body(self):
        body = io.BytesIO()
        body.read = Mock(wraps=body.read)
        error = urllib.error.HTTPError(URL, 304, 'Not modified', headers(ETag='"v2"'), body)
        opened = Mock(side_effect=error)
        result = download(URL, cache(), opener=opened)
        request = opened.call_args.args[0]
        self.assertEqual(request.get_header('If-none-match'), 'W/"v1"')
        self.assertEqual(request.get_header('If-modified-since'), 'Wed, 01 Oct 2025 12:00:00 GMT')
        self.assertEqual(result['status'], 'not_modified')
        self.assertEqual(result['http_cache']['etag'], '"v2"')
        body.read.assert_not_called()

    def test_changed_response_drops_old_validators(self):
        result = download(URL, cache(), opener=Mock(return_value=response()))
        self.assertNotIn('etag', result['http_cache'])
        self.assertNotIn('last_modified', result['http_cache'])

    def test_weekly_full_fetch_and_endpoint_or_adapter_changes(self):
        for change in [{'last_full_fetch_at':'2020-01-01T00:00:00+00:00'}, {'endpoint_url':URL+'/changed'},
                       {'final_url':URL+'/redirected'}, {'adapter_version':'old'}]:
            stored = cache(); stored.update(change)
            opened = Mock(return_value=response())
            download(URL, stored, opener=opened)
            self.assertNotIn('If-none-match', opened.call_args.args[0].headers)

    def test_daily_pages_keep_validators_until_weekly_refresh(self):
        for days, conditional in [(1,True),(6,True),(7,False),(8,False)]:
            stored=cache();stored['last_full_fetch_at']=(dt.datetime.now(dt.timezone.utc)-dt.timedelta(days=days)).isoformat()
            opened=Mock(return_value=response())
            download(URL,stored,opener=opened)
            self.assertEqual('If-none-match' in opened.call_args.args[0].headers,conditional)

    def test_missing_or_injected_validators_and_unexpected_304_fail_safely(self):
        self.assertIsNone(validator('"tag"\r\nOther: injected', 'etag'))
        self.assertIsNone(validator('garbage', 'last_modified'))
        with self.assertRaises(ValueError):
            download(URL, opener=Mock(side_effect=urllib.error.HTTPError(URL,304,'',headers(),io.BytesIO())))

    def test_errors_and_oversized_responses_do_not_become_success(self):
        with self.assertRaises(urllib.error.HTTPError):
            download(URL,cache(),opener=Mock(side_effect=urllib.error.HTTPError(URL,500,'',headers(),io.BytesIO())))
        with self.assertRaises(ValueError):
            download(URL,opener=Mock(return_value=response(b'x'*3_000_001)))

    def test_redirect_strips_representation_validators(self):
        request=urllib.request.Request(URL,headers={'If-None-Match':'"v1"','If-Modified-Since':'date'})
        redirected=PublicRedirect().redirect_request(request,None,302,'',headers(),URL+'/new')
        self.assertNotIn('If-none-match',redirected.headers)
        self.assertNotIn('If-modified-since',redirected.headers)

    def test_failed_parse_does_not_save_new_cache(self):
        with patch('audit_registry_pilot.download',return_value={'status':'downloaded','http_cache':{'final_url':URL,'etag':'"bad"'},'body':'<html/>'}):
            result=check({'source_id':'fixture','endpoint_url':URL})
        self.assertEqual(result['status'],'failed')
        self.assertNotIn('http_cache',result)

    def test_not_modified_skips_feed_parser(self):
        with patch('audit_registry_pilot.download',return_value={'status':'not_modified','http_cache':cache()}), patch('audit_registry_pilot.feed_entries') as parse:
            self.assertEqual(check({'source_id':'fixture','endpoint_url':URL})['status'],'not_modified')
            parse.assert_not_called()

    def test_transient_failure_retries_once(self):
        opened=Mock(side_effect=[urllib.error.HTTPError(URL,503,'',headers(),io.BytesIO()),response()])
        with patch('conditional_download.time.sleep'):
            self.assertEqual(download(URL,opener=opened)['status'],'downloaded')
        self.assertEqual(opened.call_count,2)


if __name__ == '__main__':
    unittest.main()
