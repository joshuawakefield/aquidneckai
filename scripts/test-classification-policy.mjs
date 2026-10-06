import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routeCandidate, enforceEvidence } from './classification-policy.mjs';
const now=Date.parse('2026-09-16T00:00:00Z');
const candidate={decision:'candidate'};
test('unsupported AI guesses cannot appear as candidates',()=>{
 const r=enforceEvidence({text:'Police jobs available'},{decision:'candidate',ai_quote:'Police jobs available'});
 assert.equal(r.decision,'needs_review');assert.equal(routeCandidate({sourceDate:'2026-09-15'},r,now).destination,'evidence_review');
});
test('evidence requires an exact quote and an explicit AI term',()=>{
 assert.equal(enforceEvidence({text:'ChatGPT workshop'},{decision:'candidate',ai_quote:'ChatGPT workshop'}).decision,'candidate');
 assert.equal(enforceEvidence({text:'Chair repair'},{decision:'candidate',ai_quote:'Chair repair'}).decision,'needs_review');
 assert.equal(enforceEvidence({text:'Police jobs'},{decision:'candidate',ai_quote:'AI police jobs'}).decision,'needs_review');
});
test('old AI resource goes to archive, never current news',()=>{
  const r=routeCandidate({sourceDate:'Wed, 19 Jul 2023 07:20:57 PDT'},candidate,now);
  assert.equal(r.destination,'archive_review'); assert.equal(r.publication_status,'unpublished');
});
test('unknown or future dates require review',()=>{
  for(const date of [null,'invalid','2027-01-01']) assert.equal(routeCandidate({sourceDate:date},candidate,now).destination,'date_review');
});
test('upcoming calendar event is current',()=>{
 const r=routeCandidate({sourceDate:'2026-09-22T10:00:00-04:00',sourceKind:'calendar'},candidate,now);
 assert.equal(r.destination,'current_review');assert.equal(r.publication_status,'unpublished');
});
test('recent relevance still cannot authorize publication',()=>{
  const r=routeCandidate({sourceDate:'2026-09-15'},candidate,now);
  assert.equal(r.destination,'current_review');assert.equal(r.publication_status,'unpublished');
});
test('rejected content stays excluded regardless of date',()=>{
  assert.equal(routeCandidate({sourceDate:null},{decision:'reject'},now).destination,'excluded');
});
