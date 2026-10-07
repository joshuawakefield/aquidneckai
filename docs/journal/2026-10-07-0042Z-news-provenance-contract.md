# AQ-032 offline news provenance contract

Task ID: AQ-032
Started: 2026-10-07T00:42:54Z
Starting commit: 1782b42766ee5a7afad58b0c32b2c461ad142230
Status: completed locally; remote closeout supplied in task response

## Request

Complete the bounded source-to-reader provenance contract and fixtures under the continuous-development mandate. Preserve central useful-news intent for residents/SMBs and current AI relevance gates. The initially pending subject-scope answer arrived during the task and is recorded below. No live operations; parent owns successors. Acceptance: explicit per-story source/organization/byline/date/check/approval provenance, rights/access limits, separate factual local evidence and editorial interpretation, unknown handling, corrected/old/page/syndicated cases and public allowlist; compatible practical implementation path.

## Changes

Implemented the pure [offline normalizer](../../scripts/offline/news-provenance.mjs), fictional examples and 13 regression groups; registered tests in the existing offline runner. The [contract report](../reports/2026-10-07-news-provenance-contract.md) records semantics, known source gaps and follow-up path. No runtime/API/DB/provider/UI wiring. A small current-card “Published → Added to AquidneckAI” correction is proposed separately with evidence and regression requirements, not implemented here.

Owner answer relayed during closeout resolves scope to AI/robotics/automation/frontier technology, local first and regional/global when useful, including consumer/art/luxury/home/SMB/workflow uses. Ordinary local news without this relationship stays outside scope. Automatic source discovery/collection/verification/judgment is an explicit desired goal; live-operation/enrollment/inference limits remain. Replaced pending statements in canonical context. D-005/D-032 preserve the changed desired direction and distinct candidate/evaluation/enrollment/publication stages. Added AQ-033 bounded offline evaluation design after fresh ref/reservation checks; no successor launched.

Paired fixtures use the existing deterministic assessment: local/broader AI and the wider application examples become unpublished candidates; ordinary local opening-hours news is rejected. Robotics/automation/frontier examples within confirmed owner scope still fail the current AI-word gate; tests document those implementation gaps without changing it. Visitor findings stay separated from staging/public verification.

## Decisions and rationale

Updated D-032 with the unresolved scope and offline provenance refinement; no reserved ID reused. Exact source/byline evidence, check URL/scope and five independent date meanings prevent false freshness and attribution. Page watches suppress per-story byline/source dates; evidence pointers do not prove truth. Canonical/syndication hints suggest review, never merge or rewrite. Recursive projection excludes private keys but still requires public-safe reviewed prose/URLs.

Milestone: initial 13 fixture groups passed, then additional scope/date/reader-label assertions passed. Inspected the PR1 source audit at parent-verified `031bb208068efbe74787eb20cef36950e85660de`; no new source fetch, source identity, rights or current health claim. One Useful Thing About evidence remains limited; TAAFT identity/access remains unresolved. No relevant repository skill files were available; followed AGENTS, docs index, canonical guidance and saved cloud-start contract. No artifact/website/plugin skill applies to this repository-only task.

Startup lesson repeated: default fetch did not update the development ref. Explicitly fetched `refs/heads/aqai-local-index:refs/remotes/origin/aqai-local-index`, switched clean stale `work`/b9e49bd to development and fast-forwarded to the exact starting commit. Selected retained Node 22.23.3 and Python 3.12.14. Parent reports prior writers finished. PR heads 1/2/3 matched the supplied state; no draft was edited.

## Verification

- `node --test scripts/test-news-provenance.mjs`: 13/13 passed before full verification, after final display refinements, and again after owner-scope fixture additions. Full baseline below preceded those final display/selection refinements; the affected suite passed on the final code.
- `node scripts/cloud-check.mjs`: Node 22.23.3/Python 3.12.14; TypeScript, 54 frontend / 78 backend (65 prior + 13 provenance) / 39 Python tests, production build and loopback authentication smoke all passed. External network guard active; worker disabled and service environment excluded.
- `npm run lint`: exit 0, 0 errors/8 existing warnings. `node --test scripts/test-project-memory.mjs`: 16/16 passed. `node scripts/check-project-memory.mjs --base 1782b42766ee5a7afad58b0c32b2c461ad142230`: passed, 59 Markdown documents. `git diff --check`: passed.
- GitHub read-only metadata confirmed all three PRs open/draft/unmerged: PR1 `031bb208068efbe74787eb20cef36950e85660de`, PR2 `c7f4805edb4cdf2dadf53d8d6b3d5a96c8d30b1f`, PR3 `f0097a5a3ba664f599148e971aa7bb6bbd4fa669`. No PR mutation.
- Explicit public-safe allowlist: `scripts/offline/news-provenance.mjs`, `scripts/offline/news-provenance-fixtures.mjs`, `scripts/test-news-provenance.mjs`, `scripts/cloud-check.mjs`, `docs/reports/2026-10-07-news-provenance-contract.md`, this journal, `docs/PROJECT-CHARTER.md`, `docs/DECISIONS.md`, `docs/BACKLOG.md`, `docs/PROJECT-STATE.md`, `docs/VISITOR-EXPERIENCE-TRACKER.md`.
- Only fictional example.org content and public repository evidence. No private export, real customer data, service credentials, environment/account identifiers or raw source corpus. No migrations/schema/runtime fields changed.
- Remote ref reconciliation and exact SHA/CI verification occur after reviewed commit/push; final evidence is returned to the parent without a recursive status-only commit.

## Next steps

Parent should first assign the standalone truthful news-date label correction, then AQ-033 offline source/technology-scope evaluation or AQ-007 bounded saved-page individual-story extraction when suitable source evidence exists. Owner scope is resolved; runtime alignment and automatic discovery remain future work. API enrichment, real source metadata/access/rights, manual staging and user benefit remain unverified. PR1/PR2/PR3 stay untouched/draft/unmerged. No successor or schedule launched here. Supabase Free, inference caps, manual staging and legacy apex preserved; exact model/quota unknown.
