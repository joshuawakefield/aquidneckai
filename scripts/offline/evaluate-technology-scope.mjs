// Standalone offline report; no file writes, network, provider, database or worker.
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {assessResponse} from '../assessment-result.mjs';
import {AI_TERM} from '../assessment-text.mjs';
import {evaluateFixtureSet, rubricVersion} from './technology-scope.mjs';
import {evaluationAt, technologyFixtures} from './technology-scope-fixtures.mjs';

const count = values => Object.fromEntries([...new Set(values)].sort().map(key => [key, values.filter(v => v === key).length]));
const confusion = (rows, selected) => ({
  selectedRelevant: rows.filter(r => r.goldRelevant && selected(r)).length,
  selectedIrrelevant: rows.filter(r => !r.goldRelevant && selected(r)).length,
  relevantNotSelected: rows.filter(r => r.goldRelevant && !selected(r)).length,
  irrelevantNotSelected: rows.filter(r => !r.goldRelevant && !selected(r)).length,
});

export function buildEvaluationReport() {
  const results = evaluateFixtureSet(technologyFixtures, {at: evaluationAt});
  const rows = results.map((result, i) => {
    const fixture = technologyFixtures[i], input = fixture.input;
    const text = input.assets[0].text;
    // Deliberately permissive scripted candidate, NOT a recorded model response.
    // Measures deterministic guard coverage only; it cannot estimate model quality.
    const quote = AI_TERM.test(text) ? text : '';
    const response = {choices: [{message: {content: JSON.stringify({items: [{id: fixture.id, decision: 'candidate',
      ai_quote: quote, local_basis: input.reach.usefulness || 'Reader usefulness needs review.', reason: 'Offline scripted guard probe.'}]})}}]};
    const legacy = assessResponse({id: fixture.id, text, sourceKind: input.provenance.provenanceScope === 'page' ? 'public_page' : 'rss'},
      {source_id: 'fictional-source', url: input.provenance.sourceUrl, source_published_at: '2026-10-05T00:00:00Z'}, response, Date.parse(evaluationAt));
    const observed = {topic: result.topic.status, source: result.source.status, story: result.story.status};
    return {id: fixture.id, goldRelevant: fixture.goldRelevant, expected: fixture.expected, observed,
      matches: Object.keys(fixture.expected).every(key => fixture.expected[key] === observed[key]),
      legacyScriptedGuard: legacy.result.decision, note: fixture.note,
      reasons: {topic: result.topic.reasons, source: result.source.reasons, story: result.story.reasons}};
  });
  return {rubricVersion, evaluationAt, evidenceOrigin: '30 wholly synthetic authored cases; no public-site checks',
    scope: 'Reviewed-annotation rubric and scripted existing-guard probe, not NLP accuracy or live performance',
    calls: {sourceHttp: 0, paidAssessment: 0, spendUsd: 0}, fixtureCount: rows.length,
    expectedMatches: rows.filter(r => r.matches).length,
    topics: count(rows.map(r => r.observed.topic)), sources: count(rows.map(r => r.observed.source)), stories: count(rows.map(r => r.observed.story)),
    topicSelection: confusion(rows, r => r.observed.topic === 'eligible'),
    legacyScriptedGuardSelection: confusion(rows, r => r.legacyScriptedGuard === 'candidate'),
    conservativeMisses: rows.filter(r => r.goldRelevant && r.observed.topic !== 'eligible').map(r => r.id),
    spuriousTopicSelections: rows.filter(r => !r.goldRelevant && r.observed.topic === 'eligible').map(r => r.id),
    legacyGuardMisses: rows.filter(r => r.goldRelevant && r.legacyScriptedGuard !== 'candidate').map(r => r.id),
    legacyGuardSpurious: rows.filter(r => !r.goldRelevant && r.legacyScriptedGuard === 'candidate').map(r => r.id), rows};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) throw Error('Usage: node scripts/offline/evaluate-technology-scope.mjs');
  const report = buildEvaluationReport();
  console.log(JSON.stringify(report, null, 2));
  if (report.expectedMatches !== report.fixtureCount) process.exitCode = 1;
}
