import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {normalizeNewsProvenance as normalize, provenanceDate, provenanceDisplay, publicUrl, compareProvenanceLinks} from './offline/news-provenance.mjs';
import {localStory, pageWatch, broaderIdea, selectionAlternatives} from './offline/news-provenance-fixtures.mjs';
import {assessResponse} from './assessment-result.mjs';
const claim = (value, evidenceUrl = localStory.sourceUrl) => ({value, evidenceUrl});

test('missing and malformed provenance remains unknown without invented identity or approval', () => {
  for (const input of [undefined, null, [], 'invalid', {}, {organization: 'Publisher', author: 'Guess', published_at: localStory.approvedAt}]) {
    const result = normalize(input);
    assert.equal(result.author.value, null); assert.equal(result.organization.value, null);
    assert.equal(result.approvedAt.value, null); assert.equal(result.sourcePublishedAt.value, null);
    assert.equal(result.provenanceScope, 'unknown'); assert.equal(result.condition.state, 'unknown');
  }
  assert.equal(normalize({...localStory, author: {value: 'Assumed from domain'}}).author.value, null);
  assert.equal(normalize({...localStory, author: {value: 'Guess', evidenceUrl: 'javascript:alert(1)'}}).author.value, null);
});

test('source, update, fetch, check and approval dates are distinct and retain their precision', () => {
  const result = normalize(localStory);
  assert.deepEqual([result.sourcePublishedAt.value, result.sourceUpdatedAt.value, result.fetched.at.value, result.checked.at.value, result.approvedAt.value],
    ['2026-10-01T13:30:00.000Z', '2026-10-02', '2026-10-03T12:00:00.000Z', '2026-10-04T12:00:00.000Z', '2026-10-06T12:00:00.000Z']);
  assert.equal(result.sourceUpdatedAt.precision, 'date');
  assert.equal(normalize({...localStory, sourcePublishedAt: undefined}).sourcePublishedAt.value, null);
  assert.equal(normalize({...localStory, approvedAt: undefined}).approvedAt.value, null);
  assert.equal(normalize({...localStory, sourcePublishedAt: {value: '2026-10-01'}}).sourcePublishedAt.value, null);
});

test('ambiguous, impossible and unzoned dates fail closed; date-only never becomes midnight', () => {
  for (const value of ['10/07/2026', 'yesterday', '2026-10-07T12:30:00', '2026-10-07T12:30:00 EST', '2026-02-29', '2026-02-31T10:00:00Z', '2026-13-01', '2026-10-07T24:00:00Z', '2026-10-07T12:00:60Z', '2026-10-07T12:00:00+14:30', '2026-10-07T12:00:00+04:99', '2026-10-07T12:00:00-00:00', ['2026-10-07'], 1791331200000]) {
    assert.equal(provenanceDate(value).value, null, JSON.stringify(value));
  }
  assert.equal(provenanceDate('2024-02-29').value, '2024-02-29');
  assert.equal(provenanceDate('2026-10-07', {instantOnly: true}).value, null);
  assert.equal(provenanceDate('2026-10-07T00:30:00+02:00').value, '2026-10-06T22:30:00.000Z');
  assert.equal(provenanceDate('2026-11-01T01:30:00-04:00').value, '2026-11-01T05:30:00.000Z');
  assert.equal(provenanceDate('2026-11-01T01:30:00-05:00').value, '2026-11-01T06:30:00.000Z');
  assert.equal(provenanceDate('2026-10-07').value, '2026-10-07');
});

test('page, excerpt and mismatched checks do not establish individual-story review', () => {
  assert.ok(normalize(pageWatch).issues.includes('individual_story_not_established'));
  assert.ok(normalize(pageWatch).issues.includes('check_does_not_cover_this_story'));
  assert.ok(normalize(broaderIdea).issues.includes('individual_story_not_established'));
  const pageOnly = normalize({...localStory, checked: pageWatch.checked});
  assert.ok(pageOnly.issues.includes('check_does_not_cover_this_story'));
  const otherStory = normalize({...localStory, checked: {...localStory.checked, url: 'https://local.example.org/news/other'}});
  assert.ok(otherStory.issues.includes('check_does_not_cover_this_story'));
  const missingScope = normalize({...localStory, checked: {at: localStory.checked.at}});
  assert.equal(missingScope.checked.at.value, null);
  assert.equal(normalize({...localStory, checked: {...localStory.checked, at: '2026-10-07'}}).checked.scope, 'unknown');
  assert.equal(normalize({...localStory, checked: undefined}).checked.at.value, null);
  const misattributed = normalize({...pageWatch, author: localStory.author, sourcePublishedAt: localStory.sourcePublishedAt});
  assert.equal(misattributed.author.value, null); assert.equal(misattributed.sourcePublishedAt.value, null);
});

test('late approval does not freshen old reporting; corrections and withdrawals remain explicit', () => {
  const old = normalize({...localStory, sourcePublishedAt: claim('2020-01-01')});
  assert.equal(old.sourcePublishedAt.value, '2020-01-01'); assert.equal(old.condition.state, 'unknown');
  const corrected = normalize({...localStory, sourceUpdatedAt: claim('2026-10-05T12:00:00Z'), condition: {state: 'corrected', evidenceUrl: localStory.sourceUrl}});
  assert.ok(corrected.issues.includes('source_updated_after_check')); assert.equal(corrected.condition.state, 'corrected');
  for (const state of ['outdated', 'withdrawn']) assert.equal(normalize({...localStory, condition: {state, evidenceUrl: localStory.sourceUrl}}).condition.state, state);
  assert.equal(normalize({...localStory, condition: {state: 'corrected'}}).condition.state, 'unknown');
  assert.equal(normalize({...localStory, condition: {state: 'current', evidenceUrl: localStory.sourceUrl}}).condition.state, 'unknown');
  const conflicting = normalize({...localStory, sourceUpdatedAt: claim('2026-09-01T12:00:00Z'), approvedAt: '2026-09-30T12:00:00Z'});
  assert.ok(conflicting.issues.includes('source_update_precedes_publication')); assert.ok(conflicting.issues.includes('approval_precedes_source_publication'));
  assert.equal(conflicting.sourcePublishedAt.value, '2026-10-01T13:30:00.000Z');
  assert.ok(!normalize({...localStory, sourceUpdatedAt: claim('2026-10-04')}).issues.includes('source_updated_after_check'));
});

test('syndication and canonical hints propose review without rewriting or merging links', () => {
  const copy = {...localStory, sourceUrl: 'https://copy.example.org/item', syndicationOriginal: {url: localStory.sourceUrl, evidenceUrl: 'https://copy.example.org/item'}};
  assert.equal(compareProvenanceLinks(localStory, copy), 'possible_duplicate_review');
  assert.equal(normalize(copy).sourceUrl, copy.sourceUrl);
  const malicious = {...localStory, sourceUrl: 'https://other.example.org/post', canonicalClaim: {url: localStory.sourceUrl}};
  assert.equal(compareProvenanceLinks(localStory, malicious), 'distinct_links_or_unknown');
  assert.equal(compareProvenanceLinks(localStory, {...malicious, canonicalClaim: {url: localStory.sourceUrl, evidenceUrl: malicious.sourceUrl}}), 'possible_duplicate_review');
  assert.equal(compareProvenanceLinks(localStory, {...localStory, sourceUpdatedAt: claim('2026-10-07')}), 'same_url_not_same_revision');
  assert.equal(compareProvenanceLinks({}, {}), 'unknown');
});

test('URL matching preserves meaningful distinctions and rejects unsafe or relative links', () => {
  const url = 'https://news.example.org/Story?a=1&b=2';
  for (const value of [url + '#section', url + '&utm_source=feed', 'http://news.example.org/Story?a=1&b=2', 'https://www.news.example.org/Story?a=1&b=2', 'https://news.example.org/Story?b=2&a=1', 'https://news.example.org/story?a=1&b=2', 'https://news.example.org/Story/?a=1&b=2']) {
    assert.notEqual(publicUrl(value), publicUrl(url));
  }
  for (const value of ['//news.example.org', '/story', 'javascript:alert(1)', 'data:text/html,hi', 'https://name:password@example.org/', 'https://news.example.org/\\story', 'https://news.example.org/a\nb']) assert.equal(publicUrl(value), null);
  assert.equal(publicUrl('https://NEWS.example.org:443/Story'), 'https://news.example.org/Story');
});

test('attribution, commercial and reuse claims remain unknown unless evidenced', () => {
  const result = normalize(localStory);
  assert.equal(result.rights.access, 'public'); assert.equal(result.rights.reuse.value, null);
  assert.equal(result.rights.commercialDisclosure.value, null);
  const licensed = normalize({...localStory, rights: {access: 'restricted', reuse: claim('Fictional permission: attribution required; no images'), commercialDisclosure: claim('Fictional affiliate disclosure')}});
  assert.equal(licensed.rights.access, 'restricted'); assert.match(licensed.rights.reuse.value, /no images/);
  assert.equal(normalize({...localStory, rights: {reuse: {value: 'Allowed'}}}).rights.reuse.value, null);
  assert.equal(normalize(pageWatch).rights.access, 'unavailable');
});

test('factual local evidence and editorial usefulness remain separate, including broader ideas', () => {
  assert.equal(normalize(localStory).localFact.value, 'The fictional clinic is in Newport.');
  assert.equal(normalize(broaderIdea).localFact.value, null);
  assert.match(normalize(broaderIdea).editorialInterpretation, /no local adoption/);
  assert.equal(normalize({...broaderIdea, local_evidence: 'Useful to every local business'}).localFact.value, null);
  const unsupported = normalize({...broaderIdea, localFact: {value: 'Used in Newport'}});
  assert.equal(unsupported.localFact.value, null);
});

test('public projection excludes unknown private keys recursively and never mutates input', () => {
  const original = structuredClone(localStory);
  const contaminate = input => {
    for (const value of Object.values(input)) if (value && typeof value === 'object') contaminate(value);
    Object.assign(input, {notes: 'PRIVATE_FIXTURE', privateAssessment: 'PRIVATE_FIXTURE', account_id: 'PRIVATE_FIXTURE', rawText: 'PRIVATE_FIXTURE'});
  };
  contaminate(original);
  const before = structuredClone(original), output = normalize(original);
  assert.deepEqual(output, normalize(localStory)); assert.deepEqual(original, before);
  assert.doesNotMatch(JSON.stringify(output), /PRIVATE_FIXTURE|notes|privateAssessment|account_id|rawText/);
  assert.deepEqual(Object.keys(output).sort(), ['contractVersion', 'sourceUrl', 'provenanceScope', 'organization', 'author', 'evidenceKind', 'sourcePublishedAt', 'sourceUpdatedAt', 'fetched', 'checked', 'approvedAt', 'canonicalClaim', 'syndicationOriginal', 'rights', 'condition', 'localFact', 'editorialInterpretation', 'issues'].sort());
});

test('reader preview labels source dates, scoped checks, approval, unknowns and interpretation honestly', () => {
  const labels = Object.fromEntries(provenanceDisplay(localStory).map(row => [row.label, row.value]));
  assert.equal(labels['Source published'], '2026-10-01T13:30:00.000Z');
  assert.equal(labels['Source updated'], '2026-10-02 (date only)');
  assert.equal(labels['Approved by AquidneckAI'], '2026-10-06T12:00:00.000Z');
  assert.match(labels['Reuse permission'], /Unknown/);
  assert.match(JSON.stringify(provenanceDisplay(pageWatch)), /linked stories not checked/);
  assert.match(JSON.stringify(provenanceDisplay(broaderIdea)), /Syndicated excerpt only/);
  assert.doesNotMatch(JSON.stringify(provenanceDisplay(pageWatch)), /Verified|Endorsed/);
  const mismatch = Object.fromEntries(provenanceDisplay({...localStory, checked: {...localStory.checked, url: pageWatch.sourceUrl}}).map(row => [row.label, row.value]));
  assert.equal(mismatch['Story review'], 'Individual-story review not established');
  assert.match(mismatch.Checked, /directory.example.org/);
  assert.match(JSON.stringify(provenanceDisplay({...localStory, sourceUpdatedAt: claim('2026-10-05T12:00:00Z')})), /Source updated after this check; review needed/);
});

test('selection fixtures preserve current gates while exposing owner-confirmed tech breadth gaps', () => {
  for (const fixture of selectionAlternatives) {
    const input = {id: fixture.id, text: fixture.text, sourceKind: 'news'};
    const response = {choices: [{message: {content: JSON.stringify({items: [{id: fixture.id, decision: 'candidate', ai_quote: fixture.aiQuote, local_basis: fixture.localBasis, reason: 'Synthetic candidate suggestion'}]})}}]};
    const actual = assessResponse(input, {source_id: 'fixture', url: localStory.sourceUrl, source_published_at: '2026-10-01'}, response, Date.parse('2026-10-07T00:00:00Z'));
    assert.equal(actual.result.decision, fixture.expected);
    assert.equal(actual.result.publication_status, 'unpublished');
    if (fixture.policyGap) {
      assert.equal(fixture.ownerScope, 'in_scope'); assert.equal(actual.result.decision, 'reject');
    }
    if (fixture.ownerScope === 'out_of_scope') assert.equal(actual.result.decision, 'reject');
  }
});

test('offline module is not imported by runtime, providers, frontend or SQL', () => {
  for (const directory of ['src', 'scripts', 'supabase']) {
    for (const file of readdirSync(new URL('../' + directory + '/', import.meta.url), {recursive: true})) {
      if (!/\.(?:mjs|ts|tsx|py|sql)$/.test(file) || file.startsWith('offline/') || file.startsWith('test-')) continue;
      const body = readFileSync(new URL('../' + directory + '/' + file, import.meta.url), 'utf8');
      assert.doesNotMatch(body, /(?:from\s*|import\s*\()['"][^'"]*offline\/news-provenance/, directory + '/' + file);
    }
  }
});
