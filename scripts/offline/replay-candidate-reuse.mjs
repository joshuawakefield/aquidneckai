// Twelve synthetic replay candidates under one fictional seed; never fetched.
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {technologyFixtures} from './technology-scope-fixtures.mjs';
import {rubricVersion} from './technology-scope.mjs';
import {extractionVersion, planCandidateBatch} from './candidate-reuse.mjs';
export const replayAt = '2026-10-07T01:30:00Z';
export function replayFixture() {
  const evidence = structuredClone(technologyFixtures[0].input);
  const url = evidence.provenance.sourceUrl;
  const material = {title: 'Fictional local AI workshop', body: evidence.assets[0].text, evidence};
  const candidate = {id: 'unchanged-200', seedId: 'fictional-source', sourceId: 'fictional-source', canonicalUrl: url, scope: 'story'};
  const previous = {sourceId: candidate.sourceId, url, scope: 'story', material, policyVersion: rubricVersion,
    evidenceVersion: extractionVersion, claimState: 'complete', expiresAt: '2026-10-20T00:00:00Z',
    httpCache: {endpoint_url: url, final_url: url, adapter_version: 'conditional-v1', etag: '"fixture-v1"', last_full_fetch_at: '2026-10-06T12:00:00Z'}};
  return {candidate, observation: {id: candidate.id, previous, material: structuredClone(material), http: {status: 200, finalUrl: url}},
    usage: {authoritative: true, observedAt: replayAt, limit: 1, limitReset: null, remaining: 0.5}};
}
export const scenarios = [
  ['unchanged-200', 'reuse_existing_assessment', () => {}],
  ['unchanged-304', 'reuse_existing_assessment', o => {o.http.status = 304; o.http.conditional = true; o.http.validatorSent = '"fixture-v1"'; delete o.material;}],
  ['volatile-metadata', 'reuse_existing_assessment', o => {o.material.evidence.provenance.fetched = {at: replayAt}; o.http.etag = '"transport-v2"';}],
  ['changed-body', 'review_new_or_changed_material', o => {o.material.body += ' Registration now requires a fee.';}],
  ['confirmed-copy', 'hold_duplicate', (o, c) => {c.duplicate = {state: 'confirmed_copy', originalUrl: 'https://original.example.org/story'};}],
  ['rate-limit', 'hold_backoff', o => {o.http.status = 429; o.retryAt = '2026-10-07T02:30:00Z';}],
  ['access-denied', 'hold_access', o => {o.http.status = 403;}],
  ['saved-response', 'reuse_saved_response_for_validation', o => {o.previous.claimState = 'response_saved'; o.previous.savedResponse = {choices: []};}],
  ['uncertain-paid', 'reconcile_without_inference', o => {o.previous.claimState = 'uncertain'; o.material.body += ' Changed.';}],
  ['missing-usage', 'stop_usage_unknown_or_unavailable', o => {o.material.body += ' Changed.';}],
  ['expired', 'review_expired', o => {o.previous.expiresAt = replayAt;}],
  ['missing-baseline-304', 'hold_304_without_baseline', o => {o.http.status = 304; delete o.previous;}],
];
export function buildReplayReport() {
  // Separate replays share one fixture URL: these are alternative states, not
  // twelve actual requests or a persistent run. Each invocation stays bounded.
  const rows = scenarios.map(([id, expected, modify]) => {
    const {candidate, observation, usage} = replayFixture();
    candidate.id = id; observation.id = id; modify(observation, candidate);
    const manifest = {seeds: [{sourceId: candidate.seedId}], candidates: [candidate]};
    const report = planCandidateBatch(manifest, [observation], {at: replayAt, usage: id === 'missing-usage' ? null : usage,
      requestTrace: [{candidateId: id, url: candidate.canonicalUrl, bytes: 0}]});
    return {scenario: id, expected, ...report.rows[0], matches: report.rows[0].action === expected};
  });
  return {scope: '12 alternative synthetic states, not a live run or accuracy dataset', rows,
    matches: rows.filter(r => r.matches).length, realHttpRequests: 0, realModelCalls: 0, incrementalApiSpendUsd: 0};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) throw Error('Usage: node scripts/offline/replay-candidate-reuse.mjs');
  console.log(JSON.stringify(buildReplayReport(), null, 2));
}
