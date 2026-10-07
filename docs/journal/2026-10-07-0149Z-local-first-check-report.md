# AQ-036 script-first project check report

Task ID: AQ-036
Started: 2026-10-07T01:49:24Z
Starting commit: 584f3b839c2e641ff8c83cdd371210201fbdb3aa
Status: completed

## Request

The owner asked to shift repetitive work toward locally runnable deterministic scripts wherever they can avoid LLM use, inventory existing scripts, and use the least expensive reliable model only for remaining judgment. Bound this first pass to project check/report tooling and workflow records. Preserve the existing $1 inference test cap, Supabase Free, no live enrollment/SQL/worker/inference/deployment/DNS/purchase/permission/outreach/production changes.

## Changes

- Inspected the exact current branch and open draft PRs. Base `aqai-local-index` remained `584f3b839c2e641ff8c83cdd371210201fbdb3aa`; PRs #1–#3 were open/draft and untouched.
- Reused rather than duplicated `scripts/cloud-check.mjs`, `scripts/check-project-memory.mjs`, `scripts/test-project-memory.mjs`, and the existing AQ-032 provenance, AQ-033 technology-scope and AQ-035 reuse/replay code.
- Added `scripts/project-check-report.mjs`: cheap inventory mode by default, explicit `--run-checks`, required base commit, actual branch/head/diff and child-process status capture, stdout JSON/text, strict Node 22 for full checks, a 10-minute total budget, bounded/redacted diagnostics, retained PATH and documented Python override, and sanitized offline child environments. Timeout cleanup targets POSIX process groups or Windows process trees; cleanup outcome is reported.
- Added 12 focused regression tests for the wrapper, including descendant-process cleanup and Windows taskkill argument behavior; added `npm run check:local`.
- Added the script-first inventory/decision boundary, usage commands, deterministic-vs-semantic split and deferred next candidate to the charter, architecture, workflow, operating record, state, backlog and this journal; added D-034.
- GitHub connector created `proposal/aq036-local-script-first` from the exact base SHA and published only the 17-file reviewed allowlist. No snapshot placeholders were included.

## Decisions and rationale

D-034 records a development workflow, not a runtime/provider change: run a tested deterministic command before a model for checks, normalization, replay and report assembly; leave factual accuracy, source credibility, reader usefulness, local relevance and news priority to human review. Use the lowest-cost model demonstrated to meet the task quality bar only for residual semantic work. A future closeout/journal skeleton generator is deferred under AQ-037 unless recurring formatting overhead is shown.

The supplied source snapshot was accessed through GitHub connector reads at the exact development ref/SHA. The dot workspace had no repository checkout. A partial local test snapshot contained exact remote Markdown plus placeholders for non-Markdown tree paths solely to exercise link-existence validation; it is not a full checkout and must not be treated as one or uploaded.

## Verification

- `node --test scripts/test-project-check-report.mjs`: 12/12 passed on Node 24.19.0, including real child execution, environment redaction, preserved PATH/Python override, external-fetch blocking, actual Git base/diff, failure/timeout, descendant cleanup and Node-version handling.
- `node scripts/check-project-memory.mjs`: passed on 64 exact-snapshot Markdown files, but this was a partial materialization with non-Markdown path placeholders and is not full-repository verification.
- `node --test scripts/test-project-memory.mjs`: existing 16/16 continuity tests passed on Node 24.19.0.
- Full `scripts/cloud-check.mjs` was not run locally. No Node 22 binary, version manager or cached Node 22 package was available; the script correctly requires Node 22. The repo's egress allowlist did not include an official Node/npm download source, so no install or access expansion was attempted.
- [GitHub Actions run 37560441072](https://github.com/joshuawakefield/aquidneckai/actions/runs/37560441072) / run #36 for the PR passed on Node 22.23.3 and Python 3.12.14. The full report JSON had `status: passed`; all four command groups passed: wrapper regression suite (12 tests), `cloud-check` (TypeScript, frontend/backend/Python regressions, build and loopback authentication smoke), continuity suite (16 tests) and `check-project-memory --base` (66 Markdown files against exact base `584f3b839c2e641ff8c83cdd371210201fbdb3aa`). PR head is `f51043fafc2f33c2dfc074a6af599a4b40f04b36`; CI executed the GitHub merge ref `c02957da82737a5c8670fe34ac6a946e84de1f4b`. No LLM/API calls, live source requests, DB/service operations or production actions occurred.

## Next steps

PR #4 remains draft and unmerged for review. The task's implementation and CI acceptance criteria are complete on that branch; nothing was deployed. AQ-037 remains deferred until recurring closeout-formatting overhead is observed, and the parent owns any successor. Preserve the existing live/cost/deployment boundaries.
