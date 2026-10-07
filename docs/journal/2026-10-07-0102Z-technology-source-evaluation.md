# AQ-033 — offline technology scope and source candidates

Task ID: AQ-033
Started: 2026-10-07T01:02:00Z
Starting commit: 8fd123e9b03b59964ae7f73958a272100783b5ac
Status: completed locally; remote verification returned at closeout

## Request

Execute one bounded offline evaluation for the approved Island residents/SMBs technology hub: AI, robotics, automation and frontier technology; local first, wider when useful; consumer/art/luxury/home/business/workflow uses. No general nontech local news. Produce synthetic public-safe fixtures, explainable deterministic rules, measured results and a bounded discovery/selection proposal. No production policy integration or live operations. Parent owns successors and schedules.

The owner clarifies the existing $1 non-resetting cap is a **test budget** that repeated, possibly daily, checks should consume slowly. Roughly $0.10 is an owner estimate, not current verified usage. Incremental dollar-by-dollar funding is only a possible later decision after usefulness/usage evidence. Preserve the cap now; no refill/payment/cap raise. The user-named “OpenAI Decisions API” is a deferred migration idea, availability unverified; no research, router or migration in this task.

## Changes

Startup checkpoint at 2026-10-07 01:02 UTC. Restored clean stale b9e49bd on `work`; explicit development-ref fetch and non-destructive branch switch/fast-forward reached expected `8fd123e9b03b59964ae7f73958a272100783b5ac`. Initial create-branch attempt stopped because branch existed; no work overwritten. Exact remote ref matched. Node 22.23.3 retained at `/workspace/aqai-toolchain/node_modules/.bin`, Python 3.12.14; host default Node 24 is not used for checks.

Read AGENTS/index, state, charter, architecture, decisions, backlog, workflow, handoff, operating/environment record, visitor tracker, AQ-031 audit from PR1, AQ-032 contract/code and affected classifier/SQL/budget paths. No readable standalone saved Start SKILL.md or relevant repository skill exists; documented startup contract followed. Repository work does not use unrelated artifact/hosting/model skills.

Shell GitHub GraphQL returned Forbidden; existing HTTPS Git and connected read-only GitHub metadata succeeded without permissions changes. Open/draft/unmerged PR1 `031bb208068efbe74787eb20cef36950e85660de`, PR2 `c7f4805edb4cdf2dadf53d8d6b3d5a96c8d30b1f`, PR3 `f0097a5a3ba664f599148e971aa7bb6bbd4fa669` were fetched/read, not modified. Base plus open proposal IDs reconciled; AQ-033 current, AQ-034 done, D-033 available for this decision. Parent will allocate any successor ID.

Exact gaps: AI-focused excerpt selection and prompt, AI quote/result guards, AI-named response schema/UI and AI regex in editorial SQL. Narrow automatic official-calendar gate remains intentionally separate. No live source, provider, database, SQL, worker or deployment call. Fixtures will test reviewed evidence annotations, not claim automatic semantic classification or story truth.

## Decisions and rationale

D-033 records the isolated reviewed-annotation approach; D-010 now captures the owner's test-budget clarification. Exact quotes demonstrate traceability, never truth. The source/status/stage separation prevents verified identity becoming a verified article, and keeps directories/syndication as leads rather than original evidence. No production decision was silently amended. A wrong semantic label is deliberately shown to pass; review remains necessary. Current AI-only guard/extraction/SQL gaps are mapped in the report.

Thirty synthetic cases match all authored topic/source/story expectations: 25 eligible topics, 2 conservative deferrals, 3 outside scope; 22 fixture-verified sources, 1 candidate, 5 review, 2 ineligible; 10 unpublished story candidates, 14 review, 6 ineligible. Two in-scope authored intents are deferred, no spurious topic selections in this small set. The scripted existing-guard probe admits 19 relevant plus 2 irrelevant cases and rejects 8 relevant plus 1 irrelevant case. Five rejected relevant cases are fully specified story candidates. No production/model performance claim follows.

The replay-only helper reuses matching unchanged 200/304 completed assessments, holds missing-cache 304 and failed HTTP, preserves URL/scope/version distinctions, and reconciles uncertain/pending/saved outputs. It does not implement a cache, fetch, persistent reservation, payment path or worker. The report proposes one bounded mock-only manifest/planner task and separately gated possible public/paid activation. Changed classifier behavior remains isolated under scripts/offline; only the local baseline imports its tests.

## Verification

- Node 22.23.3 / Python 3.12.14; no dependency installation/change.
- `node scripts/offline/evaluate-technology-scope.mjs`: 30/30 authored expectations; prints per-case rationale/discrepancies and scripted guard comparison. Zero source HTTP/model calls; $0 incremental API spend.
- `node --test scripts/test-technology-scope.mjs`: 14 groups pass. Covers scope, source/story distinctions, access/rights/conflicts, exact asset evidence, duplicate/original attribution, malformed/bounded inputs, future/stale/date-only checks, private extra-field exclusion, semantic-label counterexample, replay/recovery and runtime-import isolation.
- `node scripts/cloud-check.mjs`: TypeScript, 65 frontend / 92 backend / 39 Python tests, production build and loopback authentication pass with secret-free environment and external network guards. Final replay check after date/HTTP/metadata review included in the final baseline.
- `npm run lint`: exit 0, zero errors/eight unchanged warnings (one hook dependency, seven mixed-export Fast Refresh). No rules suppressed.
- `node --test scripts/test-project-memory.mjs`: 16 pass. Initial memory run correctly caught noncanonical journal headings; headings corrected, no rules changed.
- `node scripts/check-project-memory.mjs --base 8fd123e9b03b59964ae7f73958a272100783b5ac`: passed, 62 Markdown files. Final baseline, lint and continuity commands all exited 0.
- `git diff --check`, explicit 13-file allowlist and public-safety scan; review confirms no runtime application/prompt/classifier/SQL/catalog/provider/dependency/workflow change. Only offline test registration changes an existing script. No secrets, real env/cookies, raw private exports, account/chat identifiers or generated dist/logs uploaded. Synthetic malformed-credential URL and private sentinel are test values, not credentials/data.

Reviewed allowlist:

1. docs/BACKLOG.md
2. docs/DECISIONS.md
3. docs/PROJECT-CHARTER.md
4. docs/PROJECT-STATE.md
5. docs/VISITOR-EXPERIENCE-TRACKER.md
6. docs/reports/2026-10-06-operating-costs.md
7. docs/reports/2026-10-07-technology-source-evaluation.md
8. docs/journal/2026-10-07-0102Z-technology-source-evaluation.md
9. scripts/cloud-check.mjs
10. scripts/offline/technology-scope.mjs
11. scripts/offline/technology-scope-fixtures.mjs
12. scripts/offline/evaluate-technology-scope.mjs
13. scripts/test-technology-scope.mjs

Fresh precommit fetch and connector metadata confirmed the base still at 8fd123e and all three PR heads/statuses unchanged. Exact remote SHA/CI is returned after scoped commit/push; parent independently reconciles it. No self-referential follow-up commit. PR1/2/3 remain open/draft/unmerged and untouched. No live source, production database/SQL, inference, worker, enrollment, content publication, deployment, DNS, payment, permissions, outreach or scheduling. Supabase Free/current Gemini/OpenRouter caps/manual staging/legacy apex remain unchanged. The shell API limitation was handled with existing read-only GitHub connector access, not expanded permissions.

## Next steps

AQ-033 offline scope is complete. Parent can allocate a fresh ID for the report's offline candidate manifest and change/reuse planner: at most six saved/synthetic seeds, twelve candidates, mocked HTTP/terms/disclosure/duplicate/uncertain-outcome replays, no network/paid calls. Parent owns selection, successors and schedules. Actual public-source verification, semantic accuracy, reader usefulness and production activation remain separate gates; no current blocker prevents delivery of this offline result. Deferred “OpenAI Decisions API” availability is unverified, no migration/router/provider research now. Actual task model/quota remain unknown.
