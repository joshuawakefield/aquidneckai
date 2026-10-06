# AQ-023 usage design and AQ-020 recovery evidence

Task ID: AQ-023; related evidence AQ-020, remaining checks AQ-026.
Started: 2026-10-06T23:26Z (first recorded task inspection timestamp; launch occurred earlier, exact launch time not inferred).
Starting commit: d65e18b1a74ebb86dd6feebc206210fc0e8f629c
Status: design completed locally; verification and remote closeout recorded below/returned to parent.

## Request

One bounded design task under the approved continuous serial mandate: inspect current observation paths, specify safe usage snapshot semantics without new provider requests, and persist truthful scheduled recovery evidence. Parent owns successors and supplied the seven-task idle/wake chronology. No child delegation, successor, router or schedule. Preserve all production/cost/access boundaries; do not modify/merge either design PR.

## Changes

[Design report](../reports/2026-10-06-inference-usage-snapshot-design.md) specifies source, allowlist, consumed-cap meaning, timestamp freshness/retention, error/stale/unknown behavior, cap/key generation handling, process boundary, alternatives, implementation gates and future fixture cases. No helper/runtime/schema change; real dashboard usage remains unavailable.

Canonical state/backlog/decisions plus operating/environment/architecture records distinguish normal proven continuation from untested exceptional behavior. AQ-020 normal-operation scope is done; original crash/quota/report criteria are explicitly retained as deferred AQ-026. D-030 is design-only; reserved AQ-024/AQ-025 and D-027–D-029 remain untouched.

## Decisions and rationale

Existing classifier reads key metadata only after nonempty pending work and before price/inference operations. Capture that observation before a low-balance guard can throw; do not poll, derive account lifetime use from trial costs, or refresh timestamps on dashboard reads. A disposable private local singleton avoids database changes but needs cross-process/boot/key isolation; persistence is not implemented. Smaller cap values accepted by current preflight cannot be mislabeled as the UI's $1 cap. Failure metadata requires future contract/UI work, not just a stored JSON file.

Recovery evidence is attributed in the [matrix](../OPERATING-MODE.md#aq-020-evidence-matrix--2026-10-06). Parent supplied deliberate idle at 23:22, delayed scheduled arrival 23:23:31 for payload 23:05:34, all-seven-completed recheck at 23:24 and this single launch. The scheduled payload predates idle; it proves a delayed arrival resumed clean-idle work, not a new hourly tick after idle. Prior manual immediate test denied; none succeeded. No crash/exhaustion simulated; no reset or report delivery proven. Useful task execution is direct child evidence; final remote result must still be verified by parent.

## Verification

Restored clean work branch at b9e49bd; initial plain fetch left tracking ref stale. Explicit `git fetch origin refs/heads/aqai-local-index:refs/remotes/origin/aqai-local-index`, switch to existing development branch and fast-forward reached d65e18b; exact `ls-remote` matched. Read current AGENTS/index/state/charter/architecture/decisions/backlog/workflow/handoff/operating/environment/start context and relevant code. No other AGENTS/SKILL file found in the workspace search. Node 22.23.3 selected from retained toolchain, Python 3.12.14; host Node 24 not used for checks.

Connected GitHub metadata independently confirms base d65e18b's Project memory CI37546074449 success. Both PRs inspected open/draft/unmerged at unchanged 5292dc1/c7f4805; no writes. Shell GraphQL was Forbidden, so used existing connector read access. The commit-workflow wrapper filters to PR events and returned empty for this push; direct supported Actions-run GET supplied the correct result. Empty wrapper output is not evidence of missing CI.

PASS on Node 22.23.3/Python 3.12.14: existing `cloud-check.mjs` preflight and `runCommand`/`cleanEnvironment` harness ran `node --test scripts/test-bounded-reads.mjs` (8/8), `node node_modules/vitest/vitest.mjs run src/pages/IndexPreview.test.tsx` (16/16), and `node --test scripts/test-project-memory.mjs` (16/16). Service environment removed, worker disabled and external network blocked by the harness. `node scripts/check-project-memory.mjs --base d65e18b1a74ebb86dd6feebc206210fc0e8f629c` passed (51 Markdown files); `git diff --check` passed. No new persistence-contract tests claimed; report cases are future acceptance requirements. Full app build, browser, live SQL/provider, production workers and deployment are outside this documentation-only change.

## Next steps

Intended exact allowlist: docs/ARCHITECTURE.md, docs/BACKLOG.md, docs/DECISIONS.md, docs/ENVIRONMENT-REGISTER.md, docs/OPERATING-MODE.md, docs/PROJECT-STATE.md, this journal, docs/reports/2026-10-06-inference-usage-snapshot-design.md. Review diff/public safety; fresh-fetch and reconcile before scoped commit/push. Return exact SHA and CI to parent without recursive status-only commits. Supabase Free, current caps, manual staging and Netlify apex/DNS unchanged; no credential/customer/account data included.

Recommend parent select a fresh-ID isolated connection-card preview using AQ-022's verified claims: direct G-003 reader value, low owner effort, reusable evidence, no live dependency; test unknown/expired states and keyboard/mobile behavior without publishing or integrating a production route. Alternative: pure usage validator/reducer contract using this design's synthetic cases, no runtime imports. AQ-026 waits for supported real observations and does not block useful work. Parent must read/verify this result and current remote before selecting/launching one successor; this child launches none.

Final precommit review: fresh explicit development-ref fetch and exact remote ref still match d65e18b; no concurrent edits to reconcile. All eight changed paths match the stated allowlist. Added-text credential-pattern scan and manual scope/public-safety review passed; no private raw values or artifacts included. Sole tracked workflow is Project memory, with no deployment workflow; manual hosting boundary unchanged. Final 51-document validation and diff whitespace checks passed after record edits. Remote SHA/CI verification follows in the task response; no further status-only commit planned.
