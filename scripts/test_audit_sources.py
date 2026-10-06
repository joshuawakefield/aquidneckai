import unittest
from unittest.mock import patch
from audit_sources import AI, Page, audit, feed_entries, web_url


class AuditTests(unittest.TestCase):
    def test_feed_accepts_atom_and_rss(self):
        atom = '<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>AI workshop</title><link href="/event"/><published>2026-09-15</published></entry></feed>'
        rss = '<rss><channel><item><title>AI workshop</title><link>https://example.org/event</link></item></channel></rss>'
        self.assertEqual(feed_entries(atom, 'https://example.org/')[0]['url'], 'https://example.org/event')
        self.assertIsNone(feed_entries(rss, 'https://example.org/')[0]['sourceDate'])

    def test_html_error_page_is_not_a_successful_feed(self):
        with self.assertRaises(ValueError):
            feed_entries('<html><body>Access denied</body></html>', 'https://example.org/')

    def test_untrusted_xml_declarations_rejected(self):
        with self.assertRaises(ValueError):
            feed_entries('<!DOCTYPE rss><rss/>', 'https://example.org/')

    def test_script_text_cannot_become_a_candidate(self):
        page = Page()
        page.feed('<script>AI workshop</script><a href="/a">AI <b>workshop</b></a>')
        self.assertEqual(page.words, ['AI', 'workshop'])
        self.assertEqual(page.links, [('/a', 'AI workshop')])

    def test_links_and_keyword_boundaries(self):
        self.assertIsNone(web_url('javascript:alert(1)', 'https://example.org'))
        self.assertIsNone(AI.search('chair repair and sailing'))
        self.assertTrue(AI.search('artificial intelligence'))

    def test_empty_href_on_municipal_page_does_not_break_audit(self):
        with patch('audit_sources.download', return_value=('https://example.org/', '<a href>Menu</a>')):
            result = audit({'url': 'https://example.org/'})
        self.assertEqual(result['status'], 'reachable')

    def test_failed_collection_is_never_reported_as_success(self):
        with patch('audit_sources.download', side_effect=TimeoutError('timeout')):
            self.assertEqual(audit({'url': 'https://example.org/'})['status'], 'failed')


if __name__ == '__main__':
    unittest.main()
