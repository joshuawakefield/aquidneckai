// AQ-035: pure offline planning. No I/O, persistent cache, scheduling or paid path.
import {createHash} from 'node:crypto';
import {evaluateTechnologyCandidate, planReassessment, rubricVersion} from './technology-scope.mjs';
import {publicUrl} from './news-provenance.mjs';

export const plannerLimits = Object.freeze({seeds: 6, candidates: 12, requests: 8, perHost: 2,
  responseBytes: 262144, totalBytes: 1048576, fullRefreshMs: 7 * 86400000, usageAgeMs: 900000});
export const extractionVersion = 'aq035-reviewed-material-v1';
const instant = value => typeof value === 'string' && /T.*(?:Z|[+-]\d\d:\d\d)$/.test(value) ? Date.parse(value) : NaN;
const fresh = (value, at, age) => Number.isFinite(instant(value)) && at >= instant(value) && at - instant(value) < age;
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;

// Explicit extraction boundary: body and evidence annotations are substantive.
// Never strip arbitrary dates/numbers/HTML from prose. Only transport/check clocks
// are omitted; original/update dates, rights, attribution and disclosures remain.
export function materialDigest(material) {
  if (!material || typeof material.body !== 'string' || !material.body.trim() || material.body.length > 6000 ||
      typeof material.title !== 'string' || material.title.length > 2000 || !material.evidence ||
      JSON.stringify(material).length > 24000) return null;
  const evidence = structuredClone(material.evidence);
  if (evidence.provenance) {
    delete evidence.provenance.fetched;
    delete evidence.provenance.approvedAt;
    if (evidence.provenance.checked) delete evidence.provenance.checked.at;
  }
  if (evidence.source) delete evidence.source.reviewedAt;
  return createHash('sha256').update(JSON.stringify(canonical({title: material.title, body: material.body, evidence}))).digest('hex');
}

function rowPlan(candidate, observation, at, usage) {
  const result = (action, reason, costCategory = 'offline_review', extra = {}) => ({id: candidate.id,
    sourceId: candidate.sourceId, action, reason, costCategory, paidCalls: 0,
    enrollment: 'not_authorized', publication: 'not_authorized', ...extra});
  const old = observation.previous;
  // Reconciliation always precedes expiry, changed content, failures and budget.
  if (old && !['complete', 'none'].includes(old.claimState)) {
    if (['response_saved', 'saved_response'].includes(old.claimState) && old.savedResponse) {
      return result('reuse_saved_response_for_validation', 'Use existing recovery/assessment validation; never reissue inference.', 'saved_response_recovery');
    }
    return result('reconcile_without_inference', 'Pending, uncertain, missing or unrecognized paid outcome; retain reservation.');
  }
  const http = observation.http;
  if (observation.retryAt && (!Number.isFinite(instant(observation.retryAt)) || instant(observation.retryAt) > at)) {
    return result('hold_backoff', 'Retry date is future or invalid; no timer or request scheduled.');
  }
  if (!http) return result('hold_no_response', 'No supplied HTTP evidence; planner does not fetch.');
  if ([401, 403].includes(http.status)) return result('hold_access', 'Access failure stays visible; no bypass or automatic retry.');
  if ([429, 502, 503, 504].includes(http.status)) return result('hold_backoff', 'Transient failure; respect supplied Retry-After/backoff and review later.', 'offline_review', {retryAt: observation.retryAt ?? null});
  if (http.finalUrl !== candidate.canonicalUrl || (http.status >= 300 && http.status !== 304 && http.status < 400)) {
    return result('hold_redirect', 'Stop ambiguous redirect; no destination expansion.');
  }
  if (candidate.duplicate?.state === 'confirmed_copy') return result('hold_duplicate', 'Retain original attribution; do not repeat assessment.');
  if (candidate.duplicate?.state === 'possible_copy') return result('review_duplicate', 'Canonical/syndication hint alone cannot merge records.');
  if (![200, 304].includes(http.status)) return result('hold_http_failure', 'Unsuccessful or unknown response.');
  const binding = old && old.sourceId === candidate.sourceId && old.url === candidate.canonicalUrl && old.scope === candidate.scope;
  const validators = old?.httpCache;
  if (http.status === 304 && !(binding && old.material && http.conditional === true &&
      validators?.endpoint_url === candidate.canonicalUrl && validators?.final_url === candidate.canonicalUrl &&
      validators?.adapter_version === 'conditional-v1' && http.validatorSent &&
      [validators.etag, validators.last_modified].includes(http.validatorSent) &&
      fresh(validators.last_full_fetch_at, at, plannerLimits.fullRefreshMs))) {
    return result('hold_304_without_baseline', 'Need matching saved representation and fresh endpoint-bound conditional cache.');
  }
  const material = http.status === 304 ? old.material : observation.material;
  const digest = materialDigest(material);
  if (!digest || material.evidence.provenance?.sourceUrl !== candidate.canonicalUrl ||
      material.evidence.provenance?.provenanceScope !== candidate.scope) {
    return result('hold_missing_evidence', 'Bounded material and matching article/page evidence required.');
  }
  const evaluation = evaluateTechnologyCandidate(material.evidence, {at: new Date(at).toISOString()});
  if (evaluation.source.status !== 'verified' || evaluation.topic.status !== 'eligible' || evaluation.story.status !== 'candidate') {
    return result('review_evidence', 'AQ-033 supplied annotations require review; no automated semantic verification.', 'offline_review', {evaluation});
  }
  if (old && (!Number.isFinite(instant(old.expiresAt)) || instant(old.expiresAt) <= at)) {
    return result('review_expired', 'Expiry prompts evidence review, never paid reassessment by itself.');
  }
  const previousDigest = binding ? materialDigest(old.material) : null;
  if (old?.claimState === 'complete' && !previousDigest) return result('hold_missing_baseline', 'Completed work lacks matching saved material; review before any assessment.');
  if (binding && previousDigest === digest && (old.policyVersion !== rubricVersion || old.evidenceVersion !== extractionVersion)) {
    return result('review_cache_version', 'Version change alone is not new substantive material or permission to reassess.');
  }
  const current = {url: candidate.canonicalUrl, scope: candidate.scope, digest, httpStatus: http.status,
    policyVersion: rubricVersion, evidenceVersion: extractionVersion};
  const previous = binding ? {...old, digest: previousDigest} : null;
  const planned = planReassessment(current, previous);
  if (planned === 'reuse_existing_assessment') return result(planned, 'Matching meaningful material, identity, scope and versions.', 'reuse_no_assessment');
  if (http.status === 304) return result('review_cache_version', '304 cannot renew policy/extraction evidence or an absent completed assessment.');
  if (!usage || !fresh(usage.observedAt, at, plannerLimits.usageAgeMs) || usage.authoritative !== true ||
      usage.limit !== 1 || usage.limitReset !== null || !Number.isFinite(usage.remaining) || usage.remaining < 0.02 || usage.remaining > 1) {
    return result('stop_usage_unknown_or_unavailable', 'New/changed material cannot advance to paid assessment without current authoritative usage.');
  }
  return result('review_new_or_changed_material', 'Substantive change/new evidence; paid activation, price check and shared reservation still required.', 'potential_paid_separate_authorization');
}

// Each trace entry represents one attempted request, including redirects/retries
// and failures. Bounds reject the whole replay, never silently omit cost entries.
export function planCandidateBatch(manifest, observations, {at, usage = null, requestTrace = []} = {}) {
  const now = instant(at);
  if (!Number.isFinite(now) || !Array.isArray(manifest?.seeds) || manifest.seeds.length > plannerLimits.seeds ||
      !Array.isArray(manifest.candidates) || manifest.candidates.length > plannerLimits.candidates ||
      !Array.isArray(observations) || observations.length > plannerLimits.candidates ||
      !Array.isArray(requestTrace) || requestTrace.length > plannerLimits.requests) throw Error('Invalid or over-cap replay');
  const seedIds = new Set(manifest.seeds.map(s => s.sourceId));
  if (seedIds.size !== manifest.seeds.length) throw Error('Duplicate seed identity');
  const ids = new Set(), urls = new Map(), inputs = new Map(), hosts = new Map();
  let bytes = 0;
  for (const c of manifest.candidates) {
    if (!c || !/^[a-z0-9-]{1,80}$/.test(c.id) || ids.has(c.id) || !seedIds.has(c.seedId) ||
        typeof c.sourceId !== 'string' || !c.sourceId || publicUrl(c.canonicalUrl) !== c.canonicalUrl ||
        !['story', 'page', 'syndicated_excerpt'].includes(c.scope)) throw Error('Invalid candidate identity/scope');
    ids.add(c.id);
  }
  for (const o of observations) {
    if (!o || !ids.has(o.id) || inputs.has(o.id)) throw Error('Unknown or duplicate observation');
    inputs.set(o.id, o);
  }
  for (const r of requestTrace) {
    if (!ids.has(r.candidateId) || !publicUrl(r.url) || !Number.isSafeInteger(r.bytes) || r.bytes < 0 ||
        r.bytes > plannerLimits.responseBytes) throw Error('Invalid request evidence');
    const host = new URL(r.url).hostname;
    hosts.set(host, (hosts.get(host) ?? 0) + 1);
    bytes += r.bytes;
    if (hosts.get(host) > plannerLimits.perHost || bytes > plannerLimits.totalBytes) throw Error('Request budget exceeded');
  }
  const rows = manifest.candidates.map(c => {
    const o = inputs.get(c.id) ?? {};
    // Preserve uncertain work even when its URL also appears elsewhere.
    if (!o.previous || ['none', 'complete'].includes(o.previous.claimState)) {
      if (urls.has(c.canonicalUrl)) return {id: c.id, sourceId: c.sourceId, action: 'reuse_manifest_identity',
        reason: `Same exact URL as ${urls.get(c.canonicalUrl)}; no repeated work or trust inheritance.`,
        costCategory: 'reuse_no_assessment', paidCalls: 0, enrollment: 'not_authorized', publication: 'not_authorized'};
    }
    urls.set(c.canonicalUrl, c.id);
    return rowPlan(c, o, now, usage);
  });
  return {rows, measuredReplay: {requests: requestTrace.length, bytes, candidates: rows.length, paidCalls: 0},
    actualNetworkCalls: 0, actualModelCalls: 0};
}
