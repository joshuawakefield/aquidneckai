// AQ-033 OFFLINE ONLY. Applies a rubric to reviewed annotations, not raw prose.
// Evidence matching establishes traceability, never truth or permission to publish.
import {normalizeNewsProvenance, provenanceDate, publicUrl} from './news-provenance.mjs';

export const rubricVersion = 'aq033-v1';
export const limits = Object.freeze({items: 40, assets: 8, text: 12000, quote: 500, reviewDays: 30});
const families = ['ai', 'robotics', 'automation', 'frontier'];
const audiences = ['residents', 'smbs'];
const applications = ['consumer', 'art', 'luxury', 'home', 'workflow', 'learning', 'civic', 'research'];
const roles = ['original_reporting', 'first_party', 'commentary', 'research', 'directory', 'syndication'];
const sourceValues = {
  identity: ['matched', 'ambiguous', 'conflicting'],
  authority: ['editorial', 'first_party', 'research', 'curator', 'unclear'],
  access: ['public', 'snippet_only', 'restricted', 'unavailable'],
  rights: ['link_summary_reviewed', 'prohibited', 'unclear'],
  commercial: ['reviewed_no_disclosure_found', 'sponsored', 'affiliate', 'unclear'],
  conflicts: ['reviewed_none_identified', 'disclosed', 'unresolved'],
};
const hasText = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 1000;
const unknown = (status, reasons) => ({status, reasons});

function validBundle(input) {
  return input && typeof input === 'object' && Array.isArray(input.assets) && input.assets.length > 0 &&
    input.assets.length <= limits.assets && input.assets.every(a => a && publicUrl(a.url) &&
      ['story', 'syndicated_excerpt', 'page', 'metadata'].includes(a.scope) && typeof a.text === 'string') &&
    new Set(input.assets.map(a => publicUrl(a.url))).size === input.assets.length &&
    input.assets.reduce((n, a) => n + a.text.length, 0) <= limits.text;
}

function evidence(input, annotation, allowedValues, assetUrl) {
  if (!annotation || !allowedValues.includes(annotation.value) || typeof annotation.quote !== 'string' ||
      !annotation.quote.trim() || annotation.quote.length > limits.quote) return null;
  const url = publicUrl(annotation.evidenceUrl);
  if (!url || (assetUrl && url !== assetUrl)) return null;
  const asset = input.assets.find(a => publicUrl(a.url) === url);
  return asset?.text.includes(annotation.quote) ? {value: annotation.value, evidenceUrl: url, quote: annotation.quote} : null;
}

function topicReview(input) {
  const topic = input.topic ?? {}, reach = input.reach ?? {};
  const assetUrl = publicUrl(input.provenance?.sourceUrl);
  const family = evidence(input, topic.family, [...families, 'none'], assetUrl);
  const connection = evidence(input, topic.connection, ['substantive', 'incidental', 'unclear', 'none'], assetUrl);
  const reasons = [];
  let status = 'eligible';
  if (!assetUrl || !family || !connection) {status = 'needs_review'; reasons.push('technology_evidence_incomplete');}
  else if (family.value === 'none' || ['incidental', 'none'].includes(connection.value)) {
    status = 'out_of_scope'; reasons.push('no_substantive_technology_relationship');
  } else if (connection.value === 'unclear') {status = 'needs_review'; reasons.push('technology_relationship_ambiguous');}
  const audience = Array.isArray(topic.audiences) ? audiences.filter(v => topic.audiences.includes(v)) : [];
  const application = Array.isArray(topic.applications) ? applications.filter(v => topic.applications.includes(v)) : [];
  const localEvidence = evidence(input, reach.fact, ['local', 'regional'], assetUrl);
  const validReach = reach.kind === 'global' || (['local', 'regional'].includes(reach.kind) && localEvidence?.value === reach.kind);
  if (!audience.length || !application.length || !hasText(reach.usefulness) || !validReach) {
    if (status !== 'out_of_scope') status = 'needs_review';
    reasons.push('audience_application_or_geographic_basis_incomplete');
  }
  if (!reasons.length) reasons.push(reach.kind === 'local' ? 'local_technology_with_reader_use' : 'wider_technology_with_reader_use');
  return {status, reasons, family: family?.value ?? 'unknown', audiences: audience, applications: application,
    reach: validReach ? reach.kind : 'unknown', localFact: reach.kind === 'local' ? localEvidence : null,
    usefulnessInterpretation: hasText(reach.usefulness) ? reach.usefulness.trim() : null};
}

function sourceReview(input, at) {
  const source = input.source ?? {}, checks = {}, reasons = [];
  for (const [key, values] of Object.entries(sourceValues)) {
    checks[key] = evidence(input, source[key], values);
    if (!checks[key]) reasons.push(`${key}_unverified`);
  }
  const role = evidence(input, source.role, roles);
  if (!role) reasons.push('source_role_unverified');
  let status = reasons.length ? 'candidate' : 'verified';
  const values = Object.fromEntries(Object.entries(checks).map(([k, v]) => [k, v?.value ?? 'unknown']));
  const reviewedAt = provenanceDate(source.reviewedAt, {instantOnly: true});
  const now = provenanceDate(at, {instantOnly: true});
  const age = (Date.parse(now.value) - Date.parse(reviewedAt.value)) / 86400000;
  if (!Number.isFinite(age) || age < 0 || age > limits.reviewDays) {
    status = 'needs_review'; reasons.push('source_review_missing_stale_or_future');
  }
  if (values.identity === 'conflicting' || values.rights === 'prohibited' || values.access === 'restricted') {
    status = 'ineligible'; reasons.push('identity_or_access_or_use_incompatible');
  } else if (['ambiguous'].includes(values.identity) || ['unclear'].includes(values.authority) ||
      ['snippet_only', 'unavailable'].includes(values.access) || values.rights === 'unclear' ||
      values.commercial === 'unclear' || values.conflicts === 'unresolved') {
    status = 'needs_review'; reasons.push('source_ambiguity_or_access_review');
  }
  if (['sponsored', 'affiliate'].includes(values.commercial) || values.conflicts === 'disclosed') reasons.push('commercial_context_must_remain_attributed');
  const authorities = {original_reporting: ['editorial'], first_party: ['first_party'], research: ['research'],
    commentary: ['editorial', 'first_party'], directory: ['curator'], syndication: ['editorial', 'curator']};
  if (role && checks.authority && !authorities[role.value].includes(values.authority) && status !== 'ineligible') {
    status = 'needs_review'; reasons.push('role_authority_mismatch');
  }
  if (!reasons.length) reasons.push('scoped_checks_complete_not_universal_trust');
  return {status, reasons, role: role?.value ?? 'unknown', checks: values, reviewedAt: reviewedAt.value,
    evidence: Object.fromEntries(Object.entries({...checks, role}).map(([key, value]) => [key, value])),
    verificationScope: 'Supplied assets and link/independent-summary use only; no story-accuracy endorsement'};
}

export function evaluateTechnologyCandidate(input, {at} = {}) {
  const held = reasons => ({rubricVersion, topic: unknown('needs_review', reasons), source: unknown('needs_review', reasons),
    story: unknown('needs_review', reasons), enrollment: 'not_authorized', publication: 'not_authorized'});
  if (!validBundle(input)) return held(['invalid_or_over_limit_evidence_bundle']);
  const topic = topicReview(input), source = sourceReview(input, at);
  const provenance = normalizeNewsProvenance(input.provenance);
  const storyAsset = input.assets.find(a => publicUrl(a.url) === provenance.sourceUrl);
  const claims = evidence(input, input.claims, ['supported_in_supplied_asset', 'attributed_only', 'unsupported', 'conflicting'], provenance.sourceUrl);
  const duplicate = evidence(input, input.duplicate, ['confirmed_copy', 'possible_copy', 'reviewed_distinct'], provenance.sourceUrl);
  let status = 'candidate';
  const reasons = [];
  if (topic.status === 'out_of_scope' || source.status === 'ineligible') {
    status = 'ineligible'; reasons.push(topic.status === 'out_of_scope' ? 'outside_technology_scope' : 'source_ineligible_for_this_use');
  } else {
    const hold = reason => {status = 'needs_review'; reasons.push(reason);};
    if (topic.status !== 'eligible') hold('topic_requires_review');
    if (source.status !== 'verified') hold('source_requires_review');
    if (provenance.provenanceScope !== 'story' || storyAsset?.scope !== 'story') hold('individual_story_not_established');
    if (!provenance.organization.value || provenance.checked.url !== provenance.sourceUrl || provenance.checked.scope !== 'story') hold('story_attribution_or_check_incomplete');
    const now = provenanceDate(at, {instantOnly: true});
    const after = date => date.value && now.value && (date.precision === 'date'
      ? date.value > now.value.slice(0, 10) : Date.parse(date.value) > Date.parse(now.value));
    if (after(provenance.checked.at) || after(provenance.sourcePublishedAt) || after(provenance.sourceUpdatedAt)) hold('story_timestamp_in_future');
    if (provenance.sourceUpdatedAt.precision === 'date' && provenance.checked.at.value &&
        provenance.sourceUpdatedAt.value > provenance.checked.at.value.slice(0, 10)) hold('story_updated_after_check_day');
    if (provenance.issues.some(i => i.startsWith('source_') || i === 'approval_precedes_source_publication')) hold('story_dates_require_review');
    if (['corrected', 'outdated', 'withdrawn'].includes(provenance.condition.state)) hold('story_condition_requires_review');
    if (!claims || ['unsupported', 'conflicting'].includes(claims.value)) hold('claim_support_requires_review');
    if (!duplicate || duplicate.value === 'possible_copy') hold('duplicate_relationship_requires_review');
    if (['directory', 'syndication'].includes(source.role)) hold('lead_or_syndication_requires_original_review');
    if (['sponsored', 'affiliate'].includes(source.checks.commercial) || source.checks.conflicts === 'disclosed') hold('commercial_story_requires_editorial_review');
    if (duplicate?.value === 'confirmed_copy') {
      if (!provenance.syndicationOriginal.url || provenance.syndicationOriginal.url === provenance.sourceUrl) hold('original_attribution_missing');
      else {status = 'ineligible'; reasons.push('duplicate_copy_keep_original_attribution');}
    }
  }
  if (!reasons.length) reasons.push('unpublished_candidate_with_attributed_evidence');
  return {rubricVersion, topic, source, story: {status, reasons, claimSupport: claims?.value ?? 'unknown',
    accuracy: 'not_independently_verified', sourceUrl: provenance.sourceUrl, provenanceScope: provenance.provenanceScope,
    originalUrl: provenance.syndicationOriginal.url},
    enrollment: 'not_authorized', publication: 'not_authorized'};
}

// Replay-only planning. Digests must cover normalized meaningful content plus
// provenance/rights/disclosures; a URL, title, ETag or timestamp is not a digest.
// Every outcome still requires separate activation authority; no I/O or paid path.
export function planReassessment(current, previous) {
  if (['pending', 'uncertain', 'saved_response'].includes(previous?.claimState)) return 'reconcile_saved_result';
  if (![200, 304].includes(current?.httpStatus)) return 'hold_http_failure_or_unknown';
  if (current?.duplicate === 'confirmed_copy') return 'hold_duplicate';
  if (current?.duplicate === 'possible_copy') return 'review_duplicate';
  const keyValid = value => value && publicUrl(value.url) && /^[a-f0-9]{64}$/.test(value.digest) &&
    hasText(value.policyVersion) && hasText(value.evidenceVersion) && ['story', 'page', 'syndicated_excerpt'].includes(value.scope);
  if (!keyValid(current)) return 'hold_missing_content_or_provenance';
  if (keyValid(previous) && publicUrl(current.url) === publicUrl(previous.url) && current.scope === previous.scope &&
      current.digest === previous.digest && current.policyVersion === previous.policyVersion &&
      current.evidenceVersion === previous.evidenceVersion && previous.claimState === 'complete') return 'reuse_existing_assessment';
  if (current.httpStatus === 304) return 'hold_304_without_matching_saved_content';
  return 'review_new_or_changed_material';
}

export function evaluateFixtureSet(fixtures, options) {
  if (!Array.isArray(fixtures) || fixtures.length > limits.items) throw Error('Fixture set exceeds bounded rubric input.');
  const ids = new Set();
  return fixtures.map(({id, input}) => {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(id) || ids.has(id)) throw Error('Fixture IDs must be unique public labels.');
    ids.add(id);
    return {id, ...evaluateTechnologyCandidate(input, options)};
  });
}
