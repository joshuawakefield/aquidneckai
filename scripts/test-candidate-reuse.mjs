import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {materialDigest, planCandidateBatch} from './offline/candidate-reuse.mjs';
import {buildReplayReport, replayAt, replayFixture} from './offline/replay-candidate-reuse.mjs';
import {loadRecoveryResponses} from './recovery-cache.mjs';
import {assessResponse} from './assessment-result.mjs';
const fixture = () => {
  const f = replayFixture();
  return {...f, manifest: {seeds: [{sourceId: f.candidate.seedId}], candidates: [f.candidate]}};
};
const run = f => planCandidateBatch(f.manifest, [f.observation], {at: replayAt, usage: f.usage}).rows[0];

test('twelve deterministic alternative replays predict reuse, change, recovery and stops', () => {
  const report = buildReplayReport();
  assert.equal(report.matches, 12);
  assert.ok(report.rows.every(r => r.paidCalls === 0 && r.enrollment === 'not_authorized'));
  assert.deepEqual(report, buildReplayReport());
});

test('substantive body, title, source dates, rights and disclosures invalidate reuse', () => {
  for (const change of [m => {m.body += ' Fee increased to 25.';}, m => {m.title += ' cancelled';},
    m => {m.evidence.provenance.sourcePublishedAt.value = '2026-10-04';},
    m => {m.evidence.source.rights.value = 'prohibited';}, m => {m.evidence.source.commercial.value = 'affiliate';}]) {
    const f = fixture(), before = materialDigest(f.observation.material);
    change(f.observation.material);
    assert.notEqual(materialDigest(f.observation.material), before);
    assert.notEqual(run(f).action, 'reuse_existing_assessment');
  }
});

test('transport clocks and object key order do not change meaningful material', () => {
  const f = fixture(), material = f.observation.material, before = materialDigest(material);
  material.evidence.provenance.fetched = {at: replayAt};
  material.evidence.provenance.checked.at = replayAt;
  material.evidence.source.reviewedAt = replayAt;
  assert.equal(materialDigest(material), before);
  assert.equal(materialDigest({evidence: material.evidence, body: material.body, title: material.title}), before);
  assert.equal(run(f).action, 'reuse_existing_assessment');
});

test('304 requires exact identity, scope, cache endpoint, validator and full-fetch freshness', () => {
  for (const mutate of [o => {delete o.previous.material;}, o => {o.previous.sourceId = 'other';},
    o => {o.previous.scope = 'page';}, o => {o.previous.httpCache.endpoint_url += '?different=1';},
    o => {o.previous.httpCache.last_full_fetch_at = '2026-09-01T00:00:00Z';},
    o => {o.http.validatorSent = '"wrong"';}, o => {o.http.conditional = false;}]) {
    const f = fixture(), o = f.observation;
    Object.assign(o.http, {status: 304, conditional: true, validatorSent: '"fixture-v1"'});
    mutate(o);
    assert.equal(run(f).action, 'hold_304_without_baseline');
  }
});

test('versions, stale review, expiration and missing usage do not launch new paid work', () => {
  for (const mutate of [f => {f.observation.previous.evidenceVersion = 'old';},
    f => {f.observation.previous.policyVersion = 'old';},
    f => {f.observation.previous.expiresAt = null;},
    f => {f.observation.material.evidence.source.reviewedAt = '2026-01-01T00:00:00Z';}]) {
    const f = fixture(); mutate(f);
    assert.notEqual(run(f).action, 'reuse_existing_assessment'); assert.equal(run(f).paidCalls, 0);
    assert.notEqual(run(f).costCategory, 'potential_paid_separate_authorization');
  }
  for (const usage of [null, {}, {authoritative: true, remaining: 0.9},
    {...fixture().usage, observedAt: '2026-10-01T00:00:00Z'}, {...fixture().usage, remaining: 0.01}]) {
    const f = fixture(); f.usage = usage; f.observation.material.body += ' A real change.';
    assert.equal(run(f).action, 'stop_usage_unknown_or_unavailable');
  }
  const f = fixture(); f.usage = null;
  assert.equal(run(f).action, 'reuse_existing_assessment');
});

test('unknown and uncertain outcomes dominate changed content, expiry and usage', () => {
  for (const claimState of ['pending', 'claimed', 'uncertain', 'typo', undefined, 'response_saved']) {
    const f = fixture(); Object.assign(f.observation.previous, {claimState, expiresAt: null});
    f.observation.http.status = 403; f.usage = null;
    assert.equal(run(f).action, 'reconcile_without_inference');
  }
});

test('existing saved-response recovery and validator yield a candidate without HTTP or paid retry', () => {
  const input = {id: 'fictional', text: 'Newport ChatGPT workshop', sourceKind: 'news'};
  const response = {choices: [{message: {content: JSON.stringify({items: [{id: input.id, decision: 'candidate',
    ai_quote: 'ChatGPT workshop', local_basis: 'Newport', reason: 'Explicit AI learning event'}]})}}]};
  let reads = 0;
  const files = {opendirSync: () => ({readSync: () => ({name: 'saved.json', isFile: () => true}), closeSync: () => {}}),
    readFileSync: () => {reads++; return JSON.stringify({inputs: [input], response});}};
  const cached = loadRecoveryResponses([{report: {observation_id: input.id}}], {directory: new URL('file:///fictional/'), files});
  const saved = cached.get(input.id);
  const assessed = assessResponse(saved.input, {source_id: 'fictional-source', url: 'https://example.org/story', source_published_at: '2026-10-06'}, saved.response, Date.parse(replayAt));
  assert.equal(assessed.result.decision, 'candidate'); assert.equal(reads, 1);
  const f = fixture(); Object.assign(f.observation.previous, {claimState: 'response_saved', savedResponse: saved.response});
  assert.equal(run(f).action, 'reuse_saved_response_for_validation');
  assert.equal(assessResponse(input, {}, {choices: []}, Date.parse(replayAt)).result.decision, 'needs_review');
});

test('duplicate URLs suppress repeated work but never hide a pending paid claim', () => {
  const f = fixture(), copy = {...f.candidate, id: 'copy'}; f.manifest.candidates.push(copy);
  const plan = observations => planCandidateBatch(f.manifest, observations, {at: replayAt});
  assert.equal(plan([f.observation]).rows[1].action, 'reuse_manifest_identity');
  const uncertain = {id: 'copy', previous: {claimState: 'uncertain'}};
  assert.equal(plan([f.observation, uncertain]).rows[1].action, 'reconcile_without_inference');
  copy.canonicalUrl += '?edition=2';
  assert.equal(plan([f.observation]).rows[1].action, 'hold_no_response');
});

test('transient failures, access denial and redirects stay visible without expansion', () => {
  for (const [status, action] of [[429, 'hold_backoff'], [503, 'hold_backoff'], [403, 'hold_access'], [302, 'hold_redirect'], [500, 'hold_http_failure']]) {
    const f = fixture(); f.observation.http.status = status; assert.equal(run(f).action, action);
  }
  const f = fixture(); f.observation.http.finalUrl = 'https://other.example.org/';
  assert.equal(run(f).action, 'hold_redirect');
  f.observation.retryAt = 'invalid'; assert.equal(run(f).action, 'hold_backoff');
});

test('request ledger counts attempts and enforces total, per-host and byte caps', () => {
  const f = fixture();
  const trace = Array.from({length: 8}, (_, i) => ({candidateId: f.candidate.id, url: `https://h${Math.floor(i / 2)}.example.org/`, bytes: 10}));
  const plan = requestTrace => planCandidateBatch(f.manifest, [], {at: replayAt, requestTrace});
  assert.deepEqual(plan(trace).measuredReplay, {requests: 8, bytes: 80, candidates: 1, paidCalls: 0});
  assert.throws(() => plan([...trace, trace[0]]), /cap/);
  assert.throws(() => plan([trace[0], trace[0], trace[0]]), /budget/);
  assert.throws(() => plan([{...trace[0], bytes: 262145}]), /Invalid/);
  assert.throws(() => plan(trace.map(r => ({...r, bytes: 262144}))), /budget/);
});

test('seed/candidate caps and malformed identities fail closed; input remains unchanged', () => {
  const f = fixture(), before = structuredClone(f);
  run(f); assert.deepEqual(f, before);
  f.manifest.seeds = Array.from({length: 7}, (_, i) => ({sourceId: String(i)}));
  assert.throws(() => run(f), /cap/);
  const g = fixture(); g.manifest.candidates = Array(13).fill(g.candidate);
  assert.throws(() => run(g), /cap/);
  const h = fixture(); h.candidate.canonicalUrl = 'https://user:password@example.org/';
  assert.throws(() => run(h), /identity/);
  assert.equal(materialDigest({body: 'x'.repeat(6001), title: 'x', evidence: {}}), null);
});

test('real manifest uses six existing stable catalog IDs, honest unknowns and inactive cadences', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('./offline/candidate-manifest.json', import.meta.url)));
  const catalog = JSON.parse(fs.readFileSync(new URL('./source-catalog.json', import.meta.url)));
  assert.equal(manifest.seeds.length, 6); assert.equal(manifest.candidates.length, 6);
  for (const c of manifest.candidates) {
    assert.equal(c.canonicalUrl, catalog[c.sourceId].url);
    assert.equal(c.verification.state, 'needs_review'); assert.equal(c.rights.state, 'unknown');
    assert.equal(c.proposedCadence.active, false); assert.equal(c.aq033Annotations, null);
  }
  assert.ok(planCandidateBatch(manifest, [], {at: replayAt}).rows.every(r => r.action === 'hold_no_response'));
  assert.equal(manifest.inspection.attemptedRequests, 3);
});

test('planner is offline and only imported by its replay/tests, never runtime wiring', () => {
  const code = fs.readFileSync(new URL('./offline/candidate-reuse.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(code, /\bfetch\s*\(|setTimeout|setInterval|node:fs|supabase-server|classify-new|recover-assessments/);
  for (const file of fs.readdirSync(new URL('./', import.meta.url)).filter(f => f.endsWith('.mjs') && !f.startsWith('test-'))) {
    assert.doesNotMatch(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), /from ['"].*candidate-reuse/);
  }
});
