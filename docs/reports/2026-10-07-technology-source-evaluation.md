# AQ-033 — offline technology scope and source-candidate evaluation

Date: 2026-10-07 UTC. Starting development commit: `8fd123e9b03b59964ae7f73958a272100783b5ac`. **Implemented and locally tested, isolated/offline only.** No production classifier, enrollment, database, source fetch, inference, worker, publication or deployment changed. All 30 cases are synthetic, authored for public sharing, using reserved example.org URLs; none describes verified real source behavior. Source HTTP requests: **0**; paid assessment calls: **0**; incremental API spend: **$0**. Development model/quota remain unknown.

The [evaluator](../../scripts/offline/technology-scope.mjs), [fixtures](../../scripts/offline/technology-scope-fixtures.mjs), [report runner](../../scripts/offline/evaluate-technology-scope.mjs) and [tests](../../scripts/test-technology-scope.mjs) make this a small executable rubric. It consumes **reviewed structured annotations with exact evidence pointers**, not unannotated prose. It cannot determine whether a human annotation is semantically correct, independently verify facts, or establish legal reuse rights. There is no model, keyword-derived truth score, universal source-trust score, learned classifier or new service.

## Approved scope and exact current gaps

AquidneckAI should be Island residents'/SMBs' go-to useful AI, robotics, automation and frontier-tech hub. Local first; useful regional/global developments also belong. Consumer, creative/art, luxury, home, SMB, workflow, civic, learning and research applications can qualify. Ordinary local news without a substantive technology relationship does not. Reader usefulness may be understanding, not an immediate purchase or exercise. A local fact must come from evidence; broader usefulness is separately labeled editorial interpretation.

The [AQ-031 audit](https://github.com/joshuawakefield/aquidneckai/blob/031bb208068efbe74787eb20cef36950e85660de/docs/reports/2026-10-07-useful-news-source-audit.md) and [AQ-032 provenance contract](2026-10-07-news-provenance-contract.md) are the prior evidence. AQ-034 already fixed the reader approval-date label; this task does not repeat it. AQ-031's suggestion of general useful local news is narrowed by the later owner clarification: nontech stays outside scope.

| Existing path | Exact gap or boundary | Future implication; no change here |
| --- | --- | --- |
| [assessment-text](../../scripts/assessment-text.mjs), `AI_TERM` and `assessmentExcerpt` | Text over 6,000 characters preserves an opening span plus AI-term windows. Non-AI robotics/automation evidence deeper in a page may disappear before assessment. | Evaluate evidence-preserving extraction before broadening decisions; simply adding more keywords is insufficient. |
| [assessment-prompt](../../scripts/assessment-prompt.mjs) | Explicit AI evidence/quote required, even for useful technology without AI wording. | Needs reviewed technology-family/context instruction and ambiguous-case examples. |
| [assessment-result](../../scripts/assessment-result.mjs) and [classification-policy](../../scripts/classification-policy.mjs) | A valid result on text without `AI_TERM` is forced to reject; a candidate also needs an exact quote containing an AI term and nonempty local/wider basis. | Current deterministic guards miss non-AI technology. They cannot themselves recognize an incidental AI menu label or unsupported guarantee. |
| [assessment-batches](../../scripts/assessment-batches.mjs), [editorial handler](../../scripts/editorial-handler.mjs), [EditorialReview](../../src/components/EditorialReview.tsx) | Schema/API/UI use `ai_quote`, `aiQuote`, `ai_evidence` and AI-specific copy. | Any later amendment needs explicit compatibility/mapping and tests; do not silently reinterpret stored evidence. |
| [editorial SQL](../../supabase/migrations/20261005110000_aqai_editorial_review.sql), lines 67–74 | Human approval also requires exact AI-regex evidence. Page-watch approval remains blocked. | A prompt-only change cannot make robotics approvable. Schema/history reconciliation and separate policy review are prerequisites; no SQL executed or edited. |
| [automatic publisher](../../scripts/publish-qualified.mjs) | Narrow verified official AI-calendar/source/town/date gate. | Intentionally separate. Broadening source discovery or general editorial scope does not broaden automatic publication. |

One Useful Thing's AQ-031 About-page identity/scope observation remains dated and limited; no story, current feed health, rights or blanket accuracy is newly verified. TAAFT current identity/access remain unresolved. These real names are not attached to fictional bylines, timestamps or fixture verdicts.

## Rubric v1 and status meanings

Each input holds at most eight supplied assets, with URL/scope/text, and at most 12,000 total characters. A set has at most 40 unique public fixture IDs; evidence quotes are capped at 500 characters. The current set has 30 cases. These are **local evaluator input limits**, not a crawler configuration. Invalid/oversized bundles defer without evaluation. The clock is explicit and reproducible (`2026-10-07T01:00:00Z`), never implicitly current.

1. **Technology and usefulness:** a reviewed family (`ai`, `robotics`, `automation`, `frontier`, `none`) and substantive/incidental/unclear relationship must each cite an exact quote in the identified asset. Require a resident/SMB audience, concrete application category and written usefulness rationale. A local/regional relationship needs its own asset-bound evidence. A global item needs useful interpretation, not invented local adoption. Missing/unknown annotations defer. A positively reviewed nontech/incidental relationship is out of scope.
2. **Source verification:** separately review source role, publisher/operator identity, authority for the specific claim type, provenance, public/snippet/restricted/unavailable access, the intended link/independent-summary use, sponsorship/affiliate context and conflicts. Each check has a traceable exact quote; unknown checks cannot become verified. Reporter, maker, researcher and curator roles have different authority. A reviewed source is not necessarily a worthwhile story.
3. **Story selection:** require a separately checked individual story and organization attribution, supported-in-asset or explicitly attributed claim status, distinctness review and no unresolved dates/conditions. Maker/commentary evidence supports attribution, not independent outcome verification. Page/excerpt scope, directory roles, unsupported/conflicting claims, commercial stories, ambiguous duplicates and changed/withdrawn evidence defer. Confirmed copies with original attribution are ineligible as separate selections, preserving observed and original URLs.
4. **No activation:** all outputs say enrollment and publication are `not_authorized`. A story can only be an unpublished `candidate`, `needs_review`, or `ineligible`; it can never be “verified accurate.” Source results and story results are independent.

| Source status | Meaning within this supplied evidence/use scope |
| --- | --- |
| `candidate` | Discovered lead, one or more checks missing; verify before selecting its story or proposing enrollment. |
| `verified` | Required reviewed checks supplied, consistent and within the chosen 30-day review window. This is a fixture-scoped checklist result, not real-world verification or universal trust. |
| `needs_review` | Identity/authority/rights/conflict ambiguity, access problems, stale/future review, or role mismatch. Missing date also defers. |
| `ineligible` | Supplied evidence establishes an identity conflict, restricted access or prohibited intended use. Applies to this source/use, not a universal fraud/quality verdict. |

“Reviewed no disclosure found” never means independent or free of undisclosed conflicts. Public access does not mean permission to copy articles/images. A 30-day source review interval is an agent-selected prototype ceiling, not a promise of freshness; changes in terms/ownership/access immediately invalidate review. Original/source-update/story-check/approval semantics reuse AQ-032. Missing author/date remain unknown and are not invented; candidate status never means reader-ready provenance. Same-day date-only ordering remains ambiguous. No `approvedAt` is invented.

## Measured fixture results

Run from the repository with Node 22:

```sh
node scripts/offline/evaluate-technology-scope.mjs
node --test scripts/test-technology-scope.mjs
```

The runner prints deterministic JSON with all per-case expected/observed statuses, reason codes, notes, discrepancy lists and separate existing-guard probes. It writes no files and performs no network calls. **30/30 cases match the authored specification on topic/source/story dimensions.** This is specification coverage, not an accuracy percentage or a blinded validation set. Expected labels and fixture evidence were authored in this same task; there is no held-out corpus, real-reader usefulness measurement or measured production precision/recall.

| Dimension | Actual counts |
| --- | --- |
| Topic | 25 eligible; 2 needs review; 3 out of scope |
| Source | 22 verified within fixture scope; 1 candidate; 5 needs review; 2 ineligible |
| Story | 10 unpublished candidates; 14 needs review; 6 ineligible |
| Topic vs authored relevant intent (27 relevant / 3 irrelevant) | 25 relevant selected; 0 irrelevant selected; 2 relevant deferred; 3 irrelevant excluded |
| Existing guards under a deliberately scripted candidate response | 19 relevant admitted; 2 irrelevant admitted; 8 relevant rejected; 1 irrelevant rejected |

The existing-guard probe calls the real pure `assessResponse` with a fabricated, permissive candidate response and an exact AI quote when present. It tests deterministic guard coverage **only**. It does not call, simulate the reasoning of, or estimate error rates for Gemini or any other model. The real prompt may reject hype/incidental terms earlier. Existing-guard candidacy also never means publication; downstream page/calendar/editorial gates still apply.

Per-case actual outcomes (`E` eligible, `O` out of scope, `R` needs review; source `V` verified, `C` candidate, `I` ineligible; story `C` candidate, `R` needs review, `I` ineligible):

| Fixture | Topic / source / story | Review rationale |
| --- | --- | --- |
| local-ai | E / V / C | Local learning, exact technology and reader use |
| local-robotics | E / V / C | Local inspection robotics without AI wording |
| local-automation | E / V / C | Local permit notification workflow |
| regional-frontier | E / V / C | Nearby experimental quantum research, maturity limits |
| global-home | E / V / C | Household automation; maker claims attributed |
| global-art | E / V / C | Creative use with provenance/consent limitations |
| global-luxury | E / V / C | Luxury design application; no invented consumer benefit |
| global-consumer | E / V / C | Consumer robotics maintenance/limitations |
| global-smb | E / V / C | SMB scheduling with manual verification |
| global-commentary | E / V / C | Personal interpretation, not a savings study |
| local-nontech | O / V / I | Library hours alone outside technology scope |
| ai-menu-only | O / V / I | Navigation label does not make a road notice relevant |
| speculative-ai-angle | O / V / I | Hypothetical AI angle on ordinary restaurant hours |
| hype-advertorial | E / V / R | Disclosed ad and unsupported revenue guarantee |
| unsupported-maker | E / V / R | Identified maker, unsupported performance claim |
| syndicated-copy | E / V / I | Original retained; copy not independent corroboration |
| source-page | E / V / R | Index check cannot verify linked stories |
| ambiguous-directory | E / R / R | Unclear identity, paid listings; curator role only |
| reviewed-directory | E / V / R | Verified directory still only a lead |
| identity-conflict | E / I / I | Conflicting claimed publisher/operator |
| unavailable-source | E / R / R | Saved text cannot establish current access |
| rights-prohibited | E / I / I | Intended use explicitly prohibited in fiction |
| rights-unknown | E / C / R | Missing rights review remains candidate |
| snippet-only | E / R / R | Excerpt scope does not establish full-story review |
| ambiguous-frontier | R / V / R | Relevant authored intent, insufficient mechanism evidence |
| audience-gap | R / V / R | Relevant topic lacks supplied reader application |
| stale-source-review | E / R / R | Review renewal required; story not declared false |
| conflicting-story | E / V / R | Contradictory claims despite source verification |
| canonical-hint | E / V / R | Hint requires original/duplicate review |
| unresolved-conflict | E / R / R | Financial relationship unresolved |

### Missed, spurious and unresolved cases

The two observed topic misses are **deferrals**, `ambiguous-frontier` and `audience-gap`, not hard false rejections. Supply mechanism evidence and a useful explanation before reconsidering them. No irrelevant fixture is selected by the rubric. Three explicit irrelevant fixtures are a small negative sample, not proof against future false positives.

The existing AI guard rejects eight relevant-intent cases: local robotics, local automation, regional frontier, global home, global consumer, ambiguous directory, ambiguous frontier and audience gap. Five are fully specified useful story candidates under this rubric; the remaining three still need source/semantic/usefulness review. Its two spurious admissions are the scripted AI-menu and speculative-angle responses. They demonstrate what the guard cannot catch independently, not model mistakes observed in production.

A deliberate mutation regression relabels the nontech library-hours quote as substantive automation: the rubric admits it. **Exact quotation does not validate a semantic label.** This known vulnerability prevents use as an automatic classifier and is a separate adversarial case, not hidden inside the 30/30 specification count. Similarly, a plausible but invented usefulness rationale can pass structural validation. Require review of those annotations and an independently labeled small real/public sample before any integration proposal. No model evaluation performance is claimed.

Fourteen regression groups also cover quote/asset mismatch, role/authority mismatch, missing fields, scope/check mismatch, future/stale/date-only timestamps, withdrawn content, confirmed versus hinted syndication, invalid URLs/input bounds, no private-field spreading, no runtime imports, malicious prose treated as data, and unchanged-content/uncertain-result replay. Allowed prose still requires public-safety review; this is not a PII detector or network/SSRF validator.

## Test budget and repeated-check economics

The owner clarified on October 7 that the **$1 non-resetting cap is a test budget**, meant to burn slowly across repeated, perhaps daily, checks. Roughly **$0.10 is an owner estimate**, not current verified spend or balance. The October 6 $0.143272701 lifetime / $0.103097016 month snapshot is separate historical evidence and is not refreshed here. Do not derive spendable balance, remaining days, daily cost or API credit from either statement. The owner may later fund dollar-by-dollar after actual usefulness/usage is acceptable; that is not a refill, purchase, cap increase or standing spending authorization now.

HTTP collection and paid assessment are different costs. A conditional HTTP request can avoid a response body, but is still a request and may consume hosting/bandwidth/database resources; it does not itself justify another paid assessment. A successful 200 with unchanged meaningful content should also reuse prior work. Conversely, 304 without matching saved content cannot establish a story check.

The pure `planReassessment` replay helper demonstrates unchanged 200/304 reuse, missing-baseline holds, policy/evidence/content/scope/URL changes requiring review, copy holds, and reconciliation of pending/uncertain/saved-response claims before any retry. Inputs are supplied hashes, not computed fetch results; it is **not a persistent cache or spending controller**. A normalized-content digest must include material facts, provenance, rights and disclosures; never hash just a title/URL or strip meaningful changes. AQ-032 URL semantics preserve query order/values, fragments and path distinctions. Confirmed syndication preserves each observed copy and the reviewed original; canonical hints alone do not merge.

## Next bounded implementation proposal — parent selection required

Recommend one **offline candidate manifest and change/reuse planner**, with a fresh ID allocated by the parent after ref/PR reconciliation. Inputs: at most six synthetic or already-reviewed public seed records spanning local institutions/reporting, regional research, useful global consumer/creative/home sources, and directories used only as leads. Output: at most twelve source-candidate records with discovery origin, source role, evidence/check date, intended use, unresolved rights/access/conflicts, local/wider application, duplicate group and review reason. Keep the existing catalog/registry untouched. Use supplied saved pages and injected mock HTTP responses; no real network or paid assessment. Do not turn all directory entries into sources.

Acceptance: replay at least two logical checks of the same manifest; demonstrate zero new assessment proposals for unchanged 200 or 304 content, a missing-cache 304 hold, one materially changed story, a terms/disclosure change, duplicate original/copy, a blocked source and an uncertain paid outcome. A simulated crash/resume must reconcile saved state before retry, without launching a real worker or spending. Record unique useful candidates per reviewed source and review burden as fixture counts, not estimated live yield. Keep technology/utility ambiguity in a review queue; no aggregate score should overrule an access/rights conflict. This task must remain offline; AQ-007 individual-story extraction remains a complementary later step.

If a later separately authorized public read-only pilot is proposed, these are **draft ceilings**, not activated settings:

| Resource | Proposed bounded control |
| --- | --- |
| Discovery | Six approved seeds; twelve newly discovered URLs total/run; one hop; no recursive queue growth or enrollment. Stop at cap, keep overflow count. |
| HTTP | Eight requests/run total including redirects, retries and conditional requests; at most two per host; concurrency one; one redirect maximum, every destination revalidated. Public HTTP(S), reviewed allowed hosts only; block private/reserved addresses, credentials, unsupported MIME and access challenges. |
| Downloads/text | 256 KiB maximum response; 1 MiB aggregate/run; 6,000 characters/story, 12,000 per evidence bundle, 48,000/run. Ten-second timeout/request; no automatic immediate retry. These limits override any desire to fill the queue. |
| Cadence | Start discovery weekly; move a named high-yield seed to daily only after evidence. Use existing HTTP validators and full-refresh rules; stagger due checks; failure backoff, no repeated access-challenge attempts. Thirty-day maximum source checklist review, immediately invalidated on ownership/terms/conflict changes. Existing running source cadences unchanged. |
| Reuse | Key by observed URL + meaningful-content digest + provenance scope + rubric/extraction version + source-evidence version. Reuse unchanged completed outcomes; failures and unknowns remain visible. TTL expiry or code-version change is not permission to reassess all material. |
| Paid work | **Zero for the next offline task and initial read-only discovery pilot.** A later paid trial needs separate authority. Proposed upper ceiling if approved: one bounded batch of at most four genuinely new reviewed items/run, incremental maximum $0.01/run and $0.05/rolling seven days, always within the existing remaining $1 lifetime cap. These are suggested ceilings, not measured costs or permission to spend. |
| Shared accounting | Before any paid activation, use fresh authoritative cap/usage/price observations from the existing authorized preflight, plus durable atomic reservations shared with other runtime work. Unknown/stale budget or unknown price means stop. Reserve worst-case request cost, include pending/uncertain calls and the existing $0.02 stop guard; settle actual reported usage without refunding uncertain results. Never reset/reload the cap. |
| Outcomes | Retain attributed candidate/review reasons, unique-content yield, duplication/unchanged rates, requests/bytes and actual paid usage separately. Small private operational records, not public raw exports. No implied reader benefit from more sources/calls. |

No daily cost or monthly run length is predicted: current usage, prices, concurrency and marginal usefulness are unverified. Existing Gemini/OpenRouter, Supabase Free, recovery safeguards and manual hosting boundaries stay intact.

## Activation gates and deferred direction

- **Offline successor:** parent selects the one task and reconciles current refs/IDs; fixtures and mock-only boundaries remain explicit. No new access needed for this proposal.
- **Real public discovery:** separately authorize exact seeds, purpose, requests/bytes/cadence and rights-compatible use; implement/test destination validation, bounded redirects, backoff and audit. Resolve identity/rights/access unknowns without bypass. No automatic enrollment or paid call follows.
- **Classifier integration:** independently review a balanced public/synthetic held-out sample, semantic labels, false positives/negatives and abstentions; decide acceptable useful yield/review burden before changing policy. Prepare a draft PR across extraction, prompt, validators, compatibility and human approval. Keep the official-calendar publication gate unchanged; any schema work depends on AQ-002's migration/history gates. No draft behavior integration was created here.
- **Paid assessment:** explicit bounded authorization, fresh account/price evidence and tested shared reservations/recovery; no provider switch or budget mutation. Stop safely on unknown outcomes and reuse saved results.
- **Enrollment/publication/release:** source approval and endpoint-specific cadence/rights are separate from a story's accuracy and editorial approval. Runtime integration, deployment, data/rollback readiness and publication require their own reviewed authority. PR1/2/3 remain untouched and unmerged.

The user-named **“OpenAI Decisions API”** is recorded only as a deferred migration idea under AQ-013. Product availability, naming, features, prices and suitability are **unverified**. No research, custom router, provider switch, migration, credential/permission change or paid evaluation is part of AQ-033.

## Verification and handoff

Node 22.23.3 / Python 3.12.14: 14 new regression groups; full secret-free baseline **65 frontend / 92 backend / 39 Python**, TypeScript, production build and loopback authentication pass. Full lint **0 errors / 8 known warnings**; all **16 continuity tests** pass. Final memory/diff/allowlist and exact remote SHA/CI are recorded in the [journal](../journal/2026-10-07-0102Z-technology-source-evaluation.md) and task closeout. Local results establish no source health, hosted behavior, usage balance, production precision or reader benefit. No paid/live task remains necessary to complete AQ-033's offline scope.
