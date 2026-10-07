// AQ-033: wholly synthetic, authored public-safe text; example.org is never fetched.
// Expected judgments are a small authored specification, not an independent gold dataset.
export const evaluationAt = '2026-10-07T01:00:00Z';
export const annotation = (value, evidenceUrl, quote) => ({value, evidenceUrl, quote});
const reviewText = 'Example Island Lab identifies its publisher and contact route. The editorial team describes its reporting method. Public access is available. The fictional review permits links and independent summaries only, not copied articles or images. A commercial-disclosure review found no disclosure on the inspected assets. No conflict was identified in this limited review.';

function fixture(id, text, family, application, reach = 'global', overrides = {}) {
  const url = `https://news.example.org/${id}`, about = `https://news.example.org/${id}/about`;
  const fact = (value, quote = text) => annotation(value, url, quote);
  const check = (value, quote) => annotation(value, about, quote);
  return {id, note: overrides.note ?? 'Fictional evidence supports a useful unpublished technology candidate.',
    goldRelevant: overrides.goldRelevant ?? true,
    expected: {topic: 'eligible', source: 'verified', story: 'candidate', ...overrides.expected},
    input: {
      assets: [{url, scope: 'story', text}, {url: about, scope: 'page', text: reviewText}],
      topic: {family: fact(family), connection: fact('substantive'), audiences: ['residents', 'smbs'], applications: [application]},
      reach: {kind: reach, fact: reach === 'global' ? null : fact(reach),
        usefulness: overrides.usefulness ?? `Island readers can understand the described ${application} application and its limits; no local adoption or savings is established.`},
      source: {
        role: check('original_reporting', 'The editorial team describes its reporting method.'),
        identity: check('matched', 'Example Island Lab identifies its publisher and contact route.'),
        authority: check('editorial', 'The editorial team describes its reporting method.'),
        access: check('public', 'Public access is available.'),
        rights: check('link_summary_reviewed', 'The fictional review permits links and independent summaries only, not copied articles or images.'),
        commercial: check('reviewed_no_disclosure_found', 'A commercial-disclosure review found no disclosure on the inspected assets.'),
        conflicts: check('reviewed_none_identified', 'No conflict was identified in this limited review.'),
        reviewedAt: '2026-10-06T12:00:00Z',
      },
      provenance: {sourceUrl: url, provenanceScope: 'story', evidenceKind: 'original_reporting',
        organization: {value: 'Example Island Lab', evidenceUrl: about},
        author: {value: 'Fictional Reporter', evidenceUrl: url},
        sourcePublishedAt: {value: '2026-10-05', evidenceUrl: url},
        checked: {url, scope: 'story', at: '2026-10-06T12:00:00Z'}, rights: {access: 'public'}},
      claims: fact('supported_in_supplied_asset'), duplicate: fact('reviewed_distinct'),
    }};
}

function sourceCheck(f, key, value, text) {
  const asset = f.input.assets[1];
  const oldQuote = f.input.source[key]?.quote;
  if (oldQuote && !Object.entries(f.input.source).some(([other, check]) => other !== key && check?.quote === oldQuote)) {
    asset.text = asset.text.replace(oldQuote, '').replace(/\s+/g, ' ').trim();
  }
  asset.text += ` ${text}`;
  f.input.source[key] = annotation(value, asset.url, text);
  return f;
}
function storyCheck(f, key, value) {
  f.input[key] = annotation(value, f.input.assets[0].url, f.input.assets[0].text);
  return f;
}

const fixtures = [
  fixture('local-ai', 'Newport library describes an AI workshop for residents, including manual checks of generated answers.', 'ai', 'learning', 'local'),
  fixture('local-robotics', 'A Newport marine robotics demonstration explains how a remotely operated inspection vehicle works.', 'robotics', 'research', 'local'),
  fixture('local-automation', 'Portsmouth documents an automated permit status notification workflow, including opt-out instructions.', 'automation', 'civic', 'local'),
  fixture('regional-frontier', 'A Providence laboratory reports an experimental quantum computing error-correction result, with no consumer product yet.', 'frontier', 'research', 'regional', {usefulness: 'Residents can understand a nearby research direction and its experimental limits; no commercial benefit or local deployment is claimed.'}),
  fixture('global-home', 'A maker documents household automation controls, device compatibility and manual override for lighting.', 'automation', 'home'),
  fixture('global-art', 'An artist describes an AI image experiment and explains consent and provenance limits for the resulting artwork.', 'ai', 'art'),
  fixture('global-luxury', 'A luxury design studio describes AI personalization and states which choices still require a designer.', 'ai', 'luxury'),
  fixture('global-consumer', 'A review describes a robotic floor cleaner, maintenance limitations and obstacles it cannot handle.', 'robotics', 'consumer'),
  fixture('global-smb', 'A small business describes an AI scheduling workflow and the manual checks needed before sending appointments.', 'ai', 'workflow'),
  fixture('global-commentary', 'A writer explains an AI planning experiment; it is a personal observation, not a controlled savings study.', 'ai', 'workflow'),
  fixture('local-nontech', 'Newport library extends its opening hours for the summer.', 'none', 'civic', 'local', {
    goldRelevant: false, expected: {topic: 'out_of_scope', story: 'ineligible'}, note: 'Local usefulness alone does not establish technology relevance.'}),
  fixture('ai-menu-only', 'AI | News | Contact. Newport announces a routine road resurfacing schedule.', 'ai', 'civic', 'local', {
    goldRelevant: false, expected: {topic: 'out_of_scope', story: 'ineligible'}, note: 'An AI navigation label is not the subject of the road notice.'}),
  fixture('speculative-ai-angle', 'Newport reports restaurant hours. An AI assistant might someday help plan a visit, but this notice describes no technology.', 'ai', 'consumer', 'local', {
    goldRelevant: false, expected: {topic: 'out_of_scope', story: 'ineligible'}, note: 'A speculative AI angle cannot turn ordinary local news into technology coverage.'}),
  fixture('hype-advertorial', 'Paid placement: our AI workflow guarantees every small business ten times the revenue. No study is provided.', 'ai', 'workflow', 'global', {
    expected: {story: 'needs_review'}, note: 'Verified commercial identity does not validate an unsupported financial guarantee.'}),
  fixture('unsupported-maker', 'Our AI home device never fails and eliminates all household energy costs. No tests or conditions are supplied.', 'ai', 'home', 'global', {
    expected: {story: 'needs_review'}, note: 'First-party product authority cannot establish claimed outcomes.'}),
  fixture('syndicated-copy', 'Republished from the fictional local-ai story: Newport library describes an AI workshop for residents.', 'ai', 'learning', 'local', {
    expected: {story: 'ineligible'}, note: 'Confirmed syndication is a duplicate selection, not independent corroboration; keep original attribution.'}),
  fixture('source-page', 'Index: Newport AI workshop; marine robotics demo; community meetings. Follow the individual links for details.', 'ai', 'learning', 'local', {
    expected: {story: 'needs_review'}, note: 'Source-page verification cannot promote a linked story or combine headlines into a story.'}),
  fixture('ambiguous-directory', 'Directory: smart assistants and automated tools. Submit a paid featured listing; operator identity is unclear.', 'automation', 'consumer', 'global', {
    expected: {source: 'needs_review', story: 'needs_review'}, note: 'Ambiguous tools directory remains a lead; ranking and identity require review.'}),
  fixture('reviewed-directory', 'Directory of AI tools. Listings link to maker pages; directory inclusion is not testing or endorsement.', 'ai', 'consumer', 'global', {
    expected: {story: 'needs_review'}, note: 'An identified curator remains a discovery lead, not an independently reviewed tool story.'}),
  fixture('identity-conflict', 'An AI home guide claims to represent Example Island Lab, but its stated operator conflicts with the supplied identity record.', 'ai', 'home', 'global', {
    expected: {source: 'ineligible', story: 'ineligible'}, note: 'A conflicting identity blocks this source/use; do not infer a universal fraud verdict.'}),
  fixture('unavailable-source', 'Saved headline: an AI household guide may explain manual controls; current content is unavailable.', 'ai', 'home', 'global', {
    expected: {source: 'needs_review', story: 'needs_review'}, note: 'An unavailable response is not proof of withdrawal or permission to bypass access.'}),
  fixture('rights-prohibited', 'An AI research article describes evaluation limitations, but the intended automated reuse is explicitly prohibited in this fixture.', 'ai', 'research', 'global', {
    expected: {source: 'ineligible', story: 'ineligible'}, note: 'Public readability does not override a recorded prohibition for the intended use.'}),
  fixture('rights-unknown', 'An AI planning guide explains a household workflow; reuse and automation terms have not been reviewed.', 'ai', 'home', 'global', {
    expected: {source: 'candidate', story: 'needs_review'}, note: 'A discovered source with incomplete checks is a candidate, not verified.'}),
  fixture('snippet-only', 'An AI scheduling guide begins with an introduction. Only this excerpt is available without subscription.', 'ai', 'workflow', 'global', {
    expected: {source: 'needs_review', story: 'needs_review'}, note: 'An excerpt cannot establish review of the full story; no subscription or bypass.'}),
  fixture('ambiguous-frontier', 'A laboratory announces a new computational substrate; the supplied short description does not explain its mechanism.', 'frontier', 'research', 'global', {
    expected: {topic: 'needs_review', story: 'needs_review'}, note: 'Authored gold intent is relevant, but evidence is intentionally insufficient; conservative deferral is an observable miss.'}),
  fixture('audience-gap', 'A quantum computing experiment describes a technical benchmark without any supplied explanation for nonspecialist readers.', 'frontier', 'research', 'global', {
    expected: {topic: 'needs_review', story: 'needs_review'}, note: 'Relevant technology can still lack an articulated reader application; review before selection.'}),
  fixture('stale-source-review', 'An AI art guide describes attribution practices. The saved source review is over thirty days old.', 'ai', 'art', 'global', {
    expected: {source: 'needs_review', story: 'needs_review'}, note: 'A stale identity/access review needs renewal; elapsed time does not prove the story false.'}),
  fixture('conflicting-story', 'An AI household guide claims offline operation, but its own compatibility note requires a network connection.', 'ai', 'home', 'global', {
    expected: {story: 'needs_review'}, note: 'Verified source status must not hide contradictory story evidence.'}),
  fixture('canonical-hint', 'An AI workflow article declares another site as canonical, but the original relationship has not been reviewed.', 'ai', 'workflow', 'global', {
    expected: {story: 'needs_review'}, note: 'A canonical hint alone cannot merge records or create independent corroboration.'}),
  fixture('unresolved-conflict', 'An AI product commentary discusses a maker without resolving a reviewer financial relationship.', 'ai', 'consumer', 'global', {
    expected: {source: 'needs_review', story: 'needs_review'}, note: 'Unresolved sponsorship/conflict evidence stays visible and requires judgment.'}),
];
const byId = id => fixtures.find(f => f.id === id);
for (const [id, audience, usefulness] of [
  ['local-ai', 'residents', 'Residents can learn how to check generated answers through a locally described workshop; dates and availability still require review.'],
  ['local-robotics', 'smbs', 'Island marine businesses can understand remotely operated inspection methods and ask informed questions; no cost saving or service availability is established.'],
  ['local-automation', 'residents', 'Permit applicants can understand status notifications and their opt-out controls in a local workflow.'],
  ['global-home', 'residents', 'Households can examine lighting-device compatibility and manual overrides before considering automation; the maker has not established local results.'],
  ['global-art', 'residents', 'Artists can understand consent and provenance questions in an image workflow; this is not permission to reuse another artist’s work.'],
  ['global-luxury', 'residents', 'Residents interested in design can distinguish the maker’s personalization feature from choices still requiring a designer; no purchase recommendation.'],
  ['global-consumer', 'residents', 'Households can understand robot maintenance and obstacle limits when considering whether this class of device is useful.'],
  ['global-smb', 'smbs', 'Local owners can inspect the described scheduling workflow and manual appointment checks; no time saving is established.'],
]) {
  byId(id).input.topic.audiences = [audience];
  byId(id).input.reach.usefulness = usefulness;
}
for (const id of ['local-nontech', 'ai-menu-only', 'speculative-ai-angle']) {
  const f = byId(id);
  f.input.topic.connection.value = id === 'local-nontech' ? 'none' : 'incidental';
}
for (const id of ['global-home', 'global-luxury', 'unsupported-maker']) {
  const f = byId(id);
  sourceCheck(f, 'role', 'first_party', 'The maker describes its own product and limitations.');
  sourceCheck(f, 'authority', 'first_party', 'This source can describe its own announcement, not establish independent performance.');
  storyCheck(f, 'claims', id === 'unsupported-maker' ? 'unsupported' : 'attributed_only');
  f.input.provenance.evidenceKind = 'first_party';
}
byId('regional-frontier').input.provenance.evidenceKind = 'research';
sourceCheck(byId('regional-frontier'), 'role', 'research', 'The authors describe an experimental research result.');
sourceCheck(byId('regional-frontier'), 'authority', 'research', 'Research methods and limitations are described, not commercial maturity.');
byId('global-commentary').input.provenance.evidenceKind = 'commentary';
sourceCheck(byId('global-commentary'), 'role', 'commentary', 'The writer describes personal observations and interpretation.');
storyCheck(byId('global-commentary'), 'claims', 'attributed_only');
sourceCheck(byId('hype-advertorial'), 'commercial', 'sponsored', 'Paid placement is disclosed.');
storyCheck(byId('hype-advertorial'), 'claims', 'unsupported');
byId('syndicated-copy').input.provenance.evidenceKind = 'syndication';
sourceCheck(byId('syndicated-copy'), 'role', 'syndication', 'The publisher identifies the original and the republished copy.');
storyCheck(byId('syndicated-copy'), 'duplicate', 'confirmed_copy');
byId('syndicated-copy').input.provenance.syndicationOriginal = {
  url: byId('local-ai').input.provenance.sourceUrl, evidenceUrl: byId('syndicated-copy').input.provenance.sourceUrl};
for (const id of ['source-page', 'ambiguous-directory', 'reviewed-directory']) {
  const f = byId(id);
  f.input.assets[0].scope = 'page'; f.input.provenance.provenanceScope = 'page'; f.input.provenance.checked.scope = 'page';
}
for (const id of ['ambiguous-directory', 'reviewed-directory']) {
  byId(id).input.provenance.evidenceKind = 'directory_lead';
  sourceCheck(byId(id), 'role', 'directory', 'This directory curates submitted links, not original testing.');
  sourceCheck(byId(id), 'authority', 'curator', 'The operator curates links only.');
}
sourceCheck(byId('ambiguous-directory'), 'identity', 'ambiguous', 'Current operator identity is unresolved.');
sourceCheck(byId('ambiguous-directory'), 'commercial', 'affiliate', 'Paid featured placements and affiliate links are disclosed.');
sourceCheck(byId('identity-conflict'), 'identity', 'conflicting', 'The claimed publisher and actual operator records conflict.');
sourceCheck(byId('unavailable-source'), 'access', 'unavailable', 'The current asset could not be accessed; saved text only.');
sourceCheck(byId('rights-prohibited'), 'rights', 'prohibited', 'The intended automated collection and reuse are prohibited in this fictional review.');
delete byId('rights-unknown').input.source.rights;
sourceCheck(byId('snippet-only'), 'access', 'snippet_only', 'Only an excerpt is public.');
byId('snippet-only').input.assets[0].scope = 'syndicated_excerpt';
byId('snippet-only').input.provenance.provenanceScope = 'syndicated_excerpt';
byId('snippet-only').input.provenance.checked.scope = 'syndicated_excerpt';
byId('ambiguous-frontier').input.topic.connection.value = 'unclear';
byId('audience-gap').input.topic.audiences = [];
byId('audience-gap').input.reach.usefulness = '';
byId('stale-source-review').input.source.reviewedAt = '2026-08-01T00:00:00Z';
storyCheck(byId('conflicting-story'), 'claims', 'conflicting');
storyCheck(byId('canonical-hint'), 'duplicate', 'possible_copy');
sourceCheck(byId('unresolved-conflict'), 'conflicts', 'unresolved', 'A financial relationship is unresolved.');
export const technologyFixtures = fixtures;
