import unittest
from unittest.mock import patch
from source_pages import parse_page,check_page,evidence_excerpt

class PageTests(unittest.TestCase):
 def test_explicit_webforms_page_preserves_news_but_not_input_controls(self):
  body='<html><title>City news</title><form><input type="hidden" value="VIEWSTATE"><main>'+('Municipal AI workshop details. '*15)+'</main><textarea>PRIVATE FORM VALUE</textarea></form></html>'
  with self.assertRaises(ValueError):parse_page(body,'https://example.org')
  p=parse_page(body,'https://example.org',include_forms=True)
  self.assertIn('Municipal AI workshop',p['text']);self.assertNotIn('PRIVATE',p['text']);self.assertNotIn('VIEWSTATE',p['text'])
 def test_main_content_excludes_scripts_navigation_and_hidden_text(self):
  body='<html><head><title>Programs</title></head><body><nav>AI navigation only</nav><main><p>'+('Useful program evidence. '*15)+'</p><p hidden>SECRET HIDDEN</p><script>untrusted instructions</script></main></body></html>'
  p=parse_page(body,'https://example.org')
  self.assertNotIn('navigation',p['text']);self.assertNotIn('HIDDEN',p['text']);self.assertNotIn('instructions',p['text'])
 def test_shell_and_access_wall_are_failures(self):
  for body in ['<html><title>Access Denied</title><body>'+('error '*100)+'</body></html>', '<html><title>Search</title><body>Your session will expire '+('notice '*100)+'</body></html>','<html><title>Page</title><body>Enable javascript '+('placeholder '*30)+'</body></html>']:
   with self.assertRaises(ValueError):parse_page(body,'https://example.org')
 def test_article_header_is_evidence_not_site_navigation(self):
  p=parse_page('<html><header>Global menus</header><main><article><header><h2>AI training headline</h2></header><p>'+('Details for business owners. '*15)+'</p></article></main></html>','https://example.org')
  self.assertIn('AI training headline',p['text']);self.assertNotIn('Global menus',p['text'])
 def test_page_snapshot_never_invents_a_date_or_fulltext(self):
  fetched={'status':'downloaded','http_cache':{'final_url':'https://example.org'},'body':'<html><title>News</title><main>'+('Public AI workshop announced. '*12)+'</main></html>'}
  with patch('source_pages.download',return_value=fetched):result=check_page({'endpoint_url':'https://example.org'})
  self.assertIsNone(result['entries'][0]['sourceDate']);self.assertIn('attachments',result['entries'][0]['description'])
 def test_conditional_304_has_no_snapshot(self):
  with patch('source_pages.download',return_value={'status':'not_modified','http_cache':{}}):result=check_page({'endpoint_url':'https://example.org'})
  self.assertEqual(result['status'],'not_modified');self.assertNotIn('entries',result)
 def test_late_ai_passage_survives_large_index(self):
  text='unrelated text '*3000+'Artificial intelligence training for businesses.'+' other text '*2000
  self.assertIn('Artificial intelligence training',evidence_excerpt(text));self.assertLessEqual(len(evidence_excerpt(text)),18500)
 def test_taft_icon_titles_do_not_repeat_in_document_title(self):
  icons='<a aria-label="News"><svg><title>newspaper</title><path/></svg></a>'*20
  body='<html><head><title>There is an AI for that</title></head><body><main>'+icons+'<h1>AI tools for newspaper research</h1><p>'+('Compare AI tools using evidence about what they do. '*8)+'</p></main></body></html>'
  p=parse_page(body,'https://example.org')
  self.assertEqual(p['title'],'There is an AI for that')
  self.assertIn('AI tools for newspaper research',p['text'])
  self.assertEqual(p['text'].count('newspaper'),1)
 def test_naval_college_icon_labels_and_navigation_are_not_research_evidence(self):
  body='<html><head><title>Naval War College research</title></head><body><div role="navigation"><a>AI navigation label only</a><svg><title>icon-flicker</title></svg><svg><title>social-facebook</title></svg></div><main><h1>Artificial intelligence research seminar</h1><p>'+('Researchers discuss neural networks and evidence quality. '*8)+'</p></main></body></html>'
  p=parse_page(body,'https://example.org')
  self.assertEqual(p['title'],'Naval War College research')
  self.assertNotIn('icon-flicker',p['title']);self.assertNotIn('social-facebook',p['title'])
  self.assertNotIn('navigation label',p['text']);self.assertIn('Artificial intelligence research seminar',p['text'])
 def test_woonsocket_slideshow_controls_do_not_change_news_title(self):
  controls='<svg><title>Arrow Left</title></svg><svg><title>Arrow Right</title></svg><svg><title>Slideshow</title></svg>'
  body='<html><head><title>News Flash &#x2022; Woonsocket, RI</title></head><body>'+controls+'<main><div role="button">Slideshow control</div><h1>AI slideshow workshop for residents</h1><p>'+('Bring questions about using AI for local business presentations. '*8)+'</p></main></body></html>'
  p=parse_page(body,'https://example.org')
  self.assertEqual(p['title'],'News Flash • Woonsocket, RI')
  self.assertNotIn('Slideshow control',p['text']);self.assertIn('AI slideshow workshop',p['text'])

if __name__=='__main__':unittest.main()
