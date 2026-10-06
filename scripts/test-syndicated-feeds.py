import unittest
from unittest.mock import patch
from audit_sources import feed_entries
from audit_registry_pilot import check

URL = 'https://example.org/newsletter/feed'


def rss(content, summary='<p>Short summary</p>'):
    return ('<rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><item>'
            '<title>Newsletter issue</title><link>https://example.org/issue</link>'
            '<pubDate>Mon, 05 Oct 2026 12:00:00 GMT</pubDate>'
            '<description><![CDATA[' + summary + ']]></description>'
            '<content:encoded><![CDATA[' + content + ']]></content:encoded>'
            '</item></channel></rss>')


class SyndicatedFeedTests(unittest.TestCase):
    def test_default_preserves_original_description_and_dates(self):
        entry = feed_entries(rss('<p>A much longer artificial intelligence essay.</p>'), URL)[0]
        self.assertEqual(entry['description'], '<p>Short summary</p>')
        self.assertEqual(entry['sourceDate'], 'Mon, 05 Oct 2026 12:00:00 GMT')
        self.assertEqual(entry['url'], 'https://example.org/issue')

    def test_opt_in_uses_longer_syndicated_text_and_keeps_late_ai_evidence(self):
        content = '<p>' + 'Unrelated context. ' * 1600 + '</p>'
        content += '<p>Artificial intelligence training is now available to local businesses.</p>'
        content += '<p>' + 'Closing remarks. ' * 1600 + '</p>'
        entry = feed_entries(rss(content), URL, use_content=True)[0]
        self.assertIn('Artificial intelligence training is now available', entry['description'])
        self.assertLessEqual(len(entry['description']), 18500)
        self.assertNotIn('<p>', entry['description'])

    def test_opt_in_removes_scripts_styles_and_noscript(self):
        content = ('<script>hidden AI script</script><style>hidden AI stylesheet</style>'
                   '<noscript>hidden AI fallback</noscript>'
                   '<p>The newsletter discusses useful business productivity tools.</p>')
        description = feed_entries(rss(content), URL, use_content=True)[0]['description']
        self.assertEqual(description, 'The newsletter discusses useful business productivity tools.')

    def test_short_content_does_not_replace_a_useful_summary(self):
        summary = '<p>A substantial summary of artificial intelligence research and education.</p>'
        description = feed_entries(rss('<p>Read more</p>', summary), URL, use_content=True)[0]['description']
        self.assertEqual(description, 'A substantial summary of artificial intelligence research and education.')

    def test_atom_html_content_is_opt_in_and_preserves_link_and_date(self):
        atom = ('<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Research</title>'
                '<link href="/research"/><published>2026-10-05T12:00:00Z</published>'
                '<summary>Short abstract</summary><content type="html">'
                '&lt;p&gt;Artificial intelligence research with detailed practical examples.&lt;/p&gt;'
                '</content></entry></feed>')
        self.assertEqual(feed_entries(atom, URL)[0]['description'], 'Short abstract')
        entry = feed_entries(atom, URL, use_content=True)[0]
        self.assertEqual(entry['description'], 'Artificial intelligence research with detailed practical examples.')
        self.assertEqual(entry['url'], 'https://example.org/research')
        self.assertEqual(entry['sourceDate'], '2026-10-05T12:00:00Z')

    def test_atom_xhtml_namespace_does_not_expose_script_text(self):
        atom = ('<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Research</title>'
                '<link href="/research"/><content type="xhtml"><div xmlns="http://www.w3.org/1999/xhtml">'
                '<script>hidden AI tracking</script><p>Artificial intelligence research explained.</p>'
                '</div></content></entry></feed>')
        self.assertEqual(feed_entries(atom, URL, use_content=True)[0]['description'],
                         'Artificial intelligence research explained.')

    def test_opt_in_also_strips_xhtml_summary_scripts(self):
        atom = ('<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Research</title>'
                '<link href="/research"/><summary type="xhtml"><div xmlns="http://www.w3.org/1999/xhtml">'
                '<script>hidden AI tracking</script><p>Useful summary text.</p>'
                '</div></summary></entry></feed>')
        self.assertEqual(feed_entries(atom, URL, use_content=True)[0]['description'], 'Useful summary text.')

    def test_registry_option_uses_same_download_without_link_fetches(self):
        fetched = {'status': 'downloaded', 'http_cache': {'final_url': URL},
                   'body': rss('<p>Artificial intelligence with practical business examples.</p>')}
        with patch('audit_registry_pilot.download', return_value=fetched) as download:
            result = check({'source_id': 'fixture', 'endpoint_url': URL, 'use_syndicated_content': True})
        self.assertEqual(result['status'], 'parsed')
        self.assertIn('practical business examples', result['entries'][0]['description'])
        download.assert_called_once_with(URL, None)

    def test_dtd_and_entities_remain_rejected_in_opt_in_mode(self):
        with self.assertRaisesRegex(ValueError, 'DTD/entity'):
            feed_entries('<!DOCTYPE rss><rss/>', URL, use_content=True)


if __name__ == '__main__':
    unittest.main()
