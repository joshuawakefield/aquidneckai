// AQ-032 fixture contract only. No runtime imports, I/O, inference or publication gate.
const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const text = (value, limit = 1000) => typeof value === 'string' && value.trim().length <= limit ? value.trim() || null : null;
const choice = (value, values) => values.includes(value) ? value : 'unknown';
const unknownDate = reason => ({value: null, precision: 'unknown', reason});

// Preserve query order, fragments, path casing, trailing slash, www and protocol.
// No tracking-parameter removal or canonical/redirect guesses; this never fetches.
export function publicUrl(value) {
  const raw = text(value, 2048);
  if (!raw || /[\s\\]/.test(raw) || !/^https?:\/\//i.test(raw)) return null;
  try {
    const url = new URL(raw);
    return url.username || url.password ? null : url.href;
  } catch { return null; }
}

export function provenanceDate(value, {instantOnly = false} = {}) {
  const raw = text(value, 64);
  if (!raw) return unknownDate(value == null || value === '' ? 'missing' : 'invalid');
  const date = raw.match(/^(\d{4})-(\d{2})-(\d{2})(.*)$/);
  if (!date) return unknownDate('ambiguous_or_invalid');
  const day = raw.slice(0, 10);
  const midnight = Date.parse(day + 'T00:00:00Z');
  if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== day) return unknownDate('invalid');
  if (!date[4]) return instantOnly ? unknownDate('time_and_zone_required') : {value: day, precision: 'date', reason: null};
  const time = date[4].match(/^T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/);
  if (!time) return unknownDate('ambiguous_or_invalid');
  if (+time[1] > 23 || +time[2] > 59 || +time[3] > 59 || +time[7] > 14 || +time[8] > 59 || (+time[7] === 14 && +time[8] !== 0)) return unknownDate('invalid');
  if (time[5] === '-00:00') return unknownDate('zone_unknown');
  const stamp = Date.parse(raw);
  return Number.isFinite(stamp) ? {value: new Date(stamp).toISOString(), precision: 'instant', reason: null} : unknownDate('invalid');
}

// Evidence pointers establish provenance, not truth. Input text must already be
// reviewed for public use; an allowlist cannot detect private data inside prose.
function claim(input) {
  const item = record(input), evidenceUrl = publicUrl(item.evidenceUrl), value = text(item.value);
  return value && evidenceUrl ? {value, evidenceUrl} : {value: null, evidenceUrl: null};
}
function sourceDate(input) {
  const item = record(input), evidenceUrl = publicUrl(item.evidenceUrl);
  return {...(evidenceUrl ? provenanceDate(item.value) : unknownDate('unevidenced')), evidenceUrl};
}
function observation(input) {
  const item = record(input), url = publicUrl(item.url);
  const scope = choice(item.scope, ['story', 'syndicated_excerpt', 'page', 'metadata']);
  const at = provenanceDate(item.at, {instantOnly: true});
  return url && scope !== 'unknown' && at.precision === 'instant' ? {url, scope, at} :
    {url: null, scope: 'unknown', at: unknownDate('incomplete_observation')};
}
function linkedClaim(input) {
  const item = record(input), url = publicUrl(item.url), evidenceUrl = publicUrl(item.evidenceUrl);
  return url && evidenceUrl ? {url, evidenceUrl} : {url: null, evidenceUrl: null};
}

export function normalizeNewsProvenance(input) {
  const item = record(input), rights = record(item.rights), condition = record(item.condition);
  const sourceUrl = publicUrl(item.sourceUrl);
  const provenanceScope = sourceUrl ? choice(item.provenanceScope, ['story', 'syndicated_excerpt', 'page']) : 'unknown';
  const storyIdentified = ['story', 'syndicated_excerpt'].includes(provenanceScope);
  const storyDate = value => storyIdentified ? sourceDate(value) : {...unknownDate('story_not_identified'), evidenceUrl: null};
  const sourcePublishedAt = storyDate(item.sourcePublishedAt), sourceUpdatedAt = storyDate(item.sourceUpdatedAt);
  const fetched = observation(item.fetched), checked = observation(item.checked);
  const approvedAt = provenanceDate(item.approvedAt, {instantOnly: true});
  const issues = [];
  if (provenanceScope !== 'story') issues.push('individual_story_not_established');
  if (checked.scope === 'unknown') issues.push('check_unknown');
  if (checked.scope !== 'unknown' && (checked.scope !== 'story' || checked.url !== sourceUrl)) issues.push('check_does_not_cover_this_story');
  if (sourceUpdatedAt.precision === 'instant' && checked.at.precision === 'instant' && sourceUpdatedAt.value > checked.at.value) issues.push('source_updated_after_check');
  if (sourceUpdatedAt.precision === 'instant' && sourcePublishedAt.precision === 'instant' && sourceUpdatedAt.value < sourcePublishedAt.value) issues.push('source_update_precedes_publication');
  if (approvedAt.precision === 'instant' && sourcePublishedAt.precision === 'instant' && approvedAt.value < sourcePublishedAt.value) issues.push('approval_precedes_source_publication');
  const conditionEvidence = publicUrl(condition.evidenceUrl);
  // Every level is constructed explicitly. Never spread an input object here.
  return {
    contractVersion: 1, sourceUrl, provenanceScope,
    organization: claim(item.organization), author: claim(storyIdentified ? item.author : null),
    evidenceKind: choice(item.evidenceKind, ['original_reporting', 'first_party', 'commentary', 'research', 'directory_lead', 'syndication']),
    sourcePublishedAt, sourceUpdatedAt, fetched, checked, approvedAt,
    canonicalClaim: linkedClaim(item.canonicalClaim), syndicationOriginal: linkedClaim(item.syndicationOriginal),
    rights: {
      access: choice(rights.access, ['public', 'snippet_only', 'restricted', 'unavailable']),
      reuse: claim(rights.reuse), commercialDisclosure: claim(rights.commercialDisclosure),
    },
    condition: {
      state: conditionEvidence ? choice(condition.state, ['corrected', 'outdated', 'withdrawn']) : 'unknown',
      evidenceUrl: conditionEvidence, at: sourceDate(condition.at),
    },
    localFact: claim(item.localFact), editorialInterpretation: text(item.editorialInterpretation),
    issues,
  };
}

// Potential duplicates require review; this helper never merges or prefers a copy.
export function compareProvenanceLinks(left, right) {
  const a = normalizeNewsProvenance(left), b = normalizeNewsProvenance(right);
  if (!a.sourceUrl || !b.sourceUrl) return 'unknown';
  if (a.sourceUrl === b.sourceUrl) return 'same_url_not_same_revision';
  const targets = item => [item.sourceUrl, item.canonicalClaim.url, item.syndicationOriginal.url].filter(Boolean);
  return targets(a).some(url => targets(b).includes(url)) ? 'possible_duplicate_review' : 'distinct_links_or_unknown';
}

// Plain-text preview labels, not HTML or a public API. Nothing implies verified
// accuracy, permission to republish, or eligibility for the current reader feed.
export function provenanceDisplay(input) {
  const item = normalizeNewsProvenance(input);
  const date = value => value.value === null ? 'Unknown' : value.precision === 'date' ? `${value.value} (date only)` : value.value;
  const labels = {story: 'Individual story', syndicated_excerpt: 'Syndicated excerpt only', page: 'Page only; linked stories not checked', metadata: 'Metadata only', unknown: 'Unknown scope'};
  return [
    ['Source', item.organization.value ?? 'Unknown'], ['Author', item.author.value ?? 'Unknown'],
    ['Source URL', item.sourceUrl ?? 'Unknown'], ['Provenance scope', labels[item.provenanceScope]],
    ['Source published', date(item.sourcePublishedAt)], ['Source updated', date(item.sourceUpdatedAt)],
    ['Fetched', `${date(item.fetched.at)} · ${labels[item.fetched.scope]} · ${item.fetched.url ?? 'Unknown URL'}`],
    ['Checked', `${date(item.checked.at)} · ${labels[item.checked.scope]} · ${item.checked.url ?? 'Unknown URL'}`],
    ['Story review', item.checked.scope === 'story' && item.checked.url === item.sourceUrl && item.provenanceScope === 'story' ? 'Story reviewed; claims not independently verified' : 'Individual-story review not established'],
    ['Review freshness', item.issues.includes('source_updated_after_check') ? 'Source updated after this check; review needed' : 'Unknown; no freshness guarantee'],
    ['Approved by AquidneckAI', date(item.approvedAt)],
    ['Source status', item.condition.state], ['Access', item.rights.access],
    ['Reuse permission', item.rights.reuse.value ?? 'Unknown; do not infer permission to republish'],
    ['Commercial disclosure', item.rights.commercialDisclosure.value ?? 'Unknown'],
    ['Reported original', item.syndicationOriginal.url ?? 'Unknown'],
    ['Local fact from source', item.localFact.value ?? 'Unknown'],
    ['AquidneckAI interpretation', item.editorialInterpretation ?? 'Unknown'],
  ].map(([label, value]) => ({label, value}));
}
