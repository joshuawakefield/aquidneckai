# AQ-003 — private inference budget and exceptions

Task ID: AQ-003
Starting commit: d14987afe51b69b9782cf50db1276f399974813d
Status: implemented and locally verified; remote closeout follows in task response.

## Request

Execute one bounded AQ-003 task under the approved serial mandate: fixture-only private dashboard budget/exception visibility, tested repository commit/push, no deployment or new provider requests. Parent verified AQ-021 final d14987afe51b69b9782cf50db1276f399974813d and CI 37541747551 and owns successors/reporting. No other writer reported; no successor or schedule launched here. Actual task model and quota unknown; platform default used.

## Decisions and rationale

Restored private environment checkout was clean on work at b9e49bd52a712e3d49bbdaa342293caab9c592ee. Explicit development-ref fetch and fast-forward of the existing aqai-local-index branch reached the actual starting SHA d14987afe51b69b9782cf50db1276f399974813d; ls-remote matched. An initial branch-create attempt found the existing branch and made no change; it was inspected and safely fast-forwarded. No readable repository/workspace .agents skill files were exposed. Read AGENTS, index, canonical state/charter/architecture/decisions/backlog/workflow, operating/environment/start/handoff and visitor tracker; documented Start contract supplied the fallback. Retained temporary Node 22.23.3 and Python 3.12.14 used instead of host Node 24.

Classifier inspection confirms the $1 non-resetting cap and below-$0.02 stop, with existing price ceilings and durable paid-attempt claims. Preview currently makes one cached summary RPC; its deployed schema supplies review/pending counts but **no provider usage snapshot**. Trial allocated costs are incomplete lifetime usage and cannot substitute. No private account values were copied into code or this journal.

## Changes

- Add a display-only budget contract to the existing private preview response. Missing/malformed usage stays null. Only timestamp and consistent numeric used/remaining amounts pass through; unknown account fields are discarded. Policy remains $1, never reset, stop below $0.02. No database/provider request, migration, classifier behavior or permission change.
- Private UI displays last usage check in UTC, fresh/near-limit/stopped/stale/unavailable states, last-known amounts, unknown counts, and actionable human-review/reconciliation guidance. Near-limit ($0.10) and stale (15 minutes) are display warnings, not changes to the classifier. A local timer ages snapshots without requests; failed refresh marks retained data stale. Future timestamps fail closed.
- Explain invalid evidence/uncertain assessments and separate pending work; direct operators to the existing lazy review/filter. Preserve claims/history; reconcile saved responses before considering separately authorized retries. No retry, cap-change, publication or spending control added.
- Actual deployed-contract behavior will be **usage unavailable** until a separately reviewed snapshot source exists. Fresh/balance states are fixture-tested only. No current balance, provider health, running-worker state or staging verification is claimed.

## Verification

PASS (final): `node scripts/cloud-check.mjs` on Node 22.23.3/Python 3.12.14: TypeScript, **53 frontend tests** (including **16 dashboard tests**), **65 backend tests** (including **8 bounded-read tests**), **39 Python tests** (7 + 13 + 10 + 9), production build and loopback authentication/path/framing smoke. External Node/Python connections blocked by the existing harness; worker disabled. Earlier baseline before the browser correction passed 52/65/39. Final scoped ESLint passed on InferenceSummary.tsx, IndexPreview.tsx and IndexPreview.test.tsx. `git diff --check` passed.

PASS: local Chromium fixture checks at **1280px and 390px** via the built production server with synthetic authentication, disabled worker/DB health checks and cleanEnvironment. Playwright from the installed runtime, `/usr/bin/chromium`; temporary harness `/tmp/aq003-browser.mjs`, final log `/tmp/aq003-browser-final.log`. Five budget states per width, review anchor/keyboard expansion, needs-review filter, repeated open/close/refresh, interrupted overview/reload recovery and reader navigation passed. Both widths had no horizontal overflow and empty local/session storage. Per-width network evidence: seven existing preview GETs across five states plus interruption/recovery; four explicitly requested review GETs; one reader published-feed GET. No other API calls; all external browser requests, including fonts, blocked. Desktop unavailable/mobile near-limit screenshots were visually inspected; fixtures and screenshots stay outside Git.

CORRECTED: first browser run timed out waiting for a fresh state. The received snapshot could postdate component mount by milliseconds; freshness used mount time until the next timer tick. Evaluate current time at render as well as the local timer. Added regression covering delayed response and stale aging while hidden with **one** fetch, then reran full baseline and browser checks successfully.

PASS: `node --test scripts/test-project-memory.mjs` (**16 tests**) and `node scripts/check-project-memory.mjs --base d14987afe51b69b9782cf50db1276f399974813d` (45 Markdown files). Earlier memory checks failed first for missing state/journal edits, then for noncanonical journal headings; both corrected and rerun. No test failures remain in changed behavior.

KNOWN BASELINE FAILURE: full `npm run lint` returns **3 errors and 8 warnings**. Errors: empty interfaces in unchanged src/components/ui/command.tsx:24 and textarea.tsx:5; forbidden require in unchanged tailwind.config.ts:109. Git diff against the actual starting SHA confirms those files untouched. Warnings are existing hook/fast-refresh findings in untouched components. No lint-rule relaxation or unrelated repair included.

UNRUN by scope: live DB/SQL, provider usage/inference, workers, migration fixtures/application, staging/public deployment, external fonts, real user validation. Only fixture amounts used. Supabase Free, manual staging, legacy Netlify apex/DNS, environment visibility and existing cap untouched.

## Next steps

Reviewed intended allowlist: scripts/inference-budget.mjs, scripts/preview-handler.mjs, scripts/test-bounded-reads.mjs, src/components/InferenceSummary.tsx, src/pages/IndexPreview.tsx, src/pages/IndexPreview.test.tsx, docs/PROJECT-STATE.md, docs/BACKLOG.md, docs/DECISIONS.md, docs/VISITOR-EXPERIENCE-TRACKER.md, this journal. No dependencies, secrets, exports, raw screenshots, workflows or unrelated files included. Only repository workflow is Project memory on development pushes/PRs; no deployment workflow. Current canonical hosting record says automatic builds off and manual deployment only; no hosting action performed.

Recommended next bounded task: AQ-002 offline migration inventory and reconciliation plan, explicitly leaving live comparison unverified. A separate AQ-023 design can identify an approved safe timestamped usage source without adding a provider call. Parent owns selection/launch. AQ-020 reporting delivery and limit-resume evidence remain unproven.


Final review: all 11 intended files match the allowlist; no package/lockfile, migration, workflow, private data or deployment changes. Remote Actions metadata confirms the starting SHA's Project memory success. Workflow-collection lookup was unsupported by the connector; checked the sole tracked workflow directly instead, and the supported Actions-runs lookup works for final CI proof. Final exact remote SHA and CI outcome will be supplied in the task response without a recursive status-only documentation commit.
