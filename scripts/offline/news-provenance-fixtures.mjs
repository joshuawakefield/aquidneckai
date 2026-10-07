// Entirely fictional. example.org URLs are never requested. No real bylines,
// publisher dates, licensed excerpts, private exports or account identifiers.
const sourceUrl = 'https://local.example.org/news/ai-clinic';
const evidence = value => ({value, evidenceUrl: sourceUrl});
export const localStory = {
  sourceUrl, provenanceScope: 'story',
  organization: evidence('Example Island Bulletin'), author: evidence('Example Writer'),
  evidenceKind: 'original_reporting',
  sourcePublishedAt: evidence('2026-10-01T09:30:00-04:00'),
  sourceUpdatedAt: evidence('2026-10-02'),
  fetched: {url: sourceUrl, scope: 'story', at: '2026-10-03T12:00:00Z'},
  checked: {url: sourceUrl, scope: 'story', at: '2026-10-04T12:00:00Z'},
  approvedAt: '2026-10-06T12:00:00Z',
  rights: {access: 'public'},
  localFact: evidence('The fictional clinic is in Newport.'),
  editorialInterpretation: 'This may help a local owner understand an AI tool; no business result is established.',
};
export const pageWatch = {
  sourceUrl: 'https://directory.example.org/', provenanceScope: 'page', evidenceKind: 'directory_lead',
  fetched: {url: 'https://directory.example.org/', scope: 'page', at: '2026-10-03T12:00:00Z'},
  checked: {url: 'https://directory.example.org/', scope: 'page', at: '2026-10-04T12:00:00Z'},
  rights: {access: 'unavailable'},
};
export const broaderIdea = {
  sourceUrl: 'https://ideas.example.org/post/ai-experiment', provenanceScope: 'syndicated_excerpt', evidenceKind: 'commentary',
  fetched: {url: 'https://ideas.example.org/feed', scope: 'syndicated_excerpt', at: '2026-10-03T12:00:00Z'},
  rights: {access: 'snippet_only'},
  editorialInterpretation: 'A local owner could consider this general AI experiment; no local adoption is evidenced.',
};
export const selectionAlternatives = [
  {id: 'local-ai', text: 'Newport library announces an AI workshop.', aiQuote: 'AI workshop', localBasis: 'Newport library', expected: 'candidate'},
  {id: 'broader-ai', text: 'A research team describes an AI tool.', aiQuote: 'AI tool', localBasis: 'Could inform local owners; no local deployment established.', expected: 'candidate'},
  {id: 'local-nontech', text: 'Newport library extends its opening hours.', aiQuote: '', localBasis: 'Newport library opening hours may help residents.', expected: 'reject', ownerScope: 'out_of_scope'},
  {id: 'consumer-home-ai', text: 'An AI home assistant offers a new household planning feature.', aiQuote: 'AI home assistant', localBasis: 'Consumer/home use; no local trial established.', expected: 'candidate', ownerScope: 'in_scope'},
  {id: 'art-ai', text: 'An artist describes an AI image experiment.', aiQuote: 'AI image experiment', localBasis: 'Potential creative use for Island residents.', expected: 'candidate', ownerScope: 'in_scope'},
  {id: 'luxury-ai', text: 'A luxury product maker announces AI personalization.', aiQuote: 'AI personalization', localBasis: 'Consumer interest; maker claims are not independently tested.', expected: 'candidate', ownerScope: 'in_scope'},
  {id: 'smb-workflow-ai', text: 'A small business describes an AI scheduling workflow.', aiQuote: 'AI scheduling workflow', localBasis: 'Possible local SMB use; no savings established.', expected: 'candidate', ownerScope: 'in_scope'},
  {id: 'local-robotics-gap', text: 'Newport hosts a marine robotics demonstration.', aiQuote: '', localBasis: 'Local robotics development.', expected: 'reject', ownerScope: 'in_scope', policyGap: true},
  {id: 'automation-gap', text: 'A maker documents household automation controls.', aiQuote: '', localBasis: 'Home automation use; no local adoption established.', expected: 'reject', ownerScope: 'in_scope', policyGap: true},
  {id: 'frontier-gap', text: 'A regional laboratory reports quantum computing research.', aiQuote: '', localBasis: 'Regional frontier technology research, not a proven household product.', expected: 'reject', ownerScope: 'in_scope', policyGap: true},
];
