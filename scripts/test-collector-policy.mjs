import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeEntry,normalizeResult} from './collector-policy.mjs';
const e={url:'https://example.org/article?a=1&amp;b=2#top',title:'AI event',description:'Details',sourceDate:'2026-09-15'};
test('normalizes encoded query separators and fragments',()=>assert.equal(normalizeEntry(e).url,'https://example.org/article?a=1&b=2'));
test('same content has stable hash; changed content has a different version',()=>{
 assert.equal(normalizeEntry(e).content_hash,normalizeEntry({...e}).content_hash);
 assert.notEqual(normalizeEntry(e).content_hash,normalizeEntry({...e,description:'Changed'}).content_hash);
});
test('repeated feed entries collapse to one observation',()=>assert.equal(normalizeResult({status:'parsed',entries:[e,e]}).entries.length,1));
test('failed feed never becomes an empty success',()=>assert.equal(normalizeResult({status:'failed',error_type:'Timeout'}).status,'failed'));
test('unsafe article schemes rejected',()=>assert.throws(()=>normalizeEntry({...e,url:'javascript:alert(1)'})));
test('invalid dates stay unknown',()=>assert.equal(normalizeEntry({...e,sourceDate:'garbage'}).published_at,null));
test('not-modified results stay distinct from empty feeds',()=>{
 const http_cache={endpoint_url:'https://example.org/feed',final_url:'https://example.org/feed',adapter_version:'conditional-v1',etag:'"v1"'};
 assert.deepEqual(normalizeResult({status:'not_modified',http_cache}),{status:'not_modified',http_cache});
 assert.throws(()=>normalizeResult({status:'not_modified'}));
 assert.equal(normalizeResult({status:'parsed',entries:[],http_cache}).http_cache.etag,'"v1"');
});
