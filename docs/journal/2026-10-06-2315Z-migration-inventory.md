# AQ-002 offline migration inventory

Task ID: AQ-002
Started: 2026-10-06T23:15Z (inventory checkpoint, after environment restoration)
Starting commit: 6836574088189c40de6ef22bf353eb210db01afa
Status: offline portion completed; live comparison blocked/unverified

## Request

One bounded offline inventory/reconciliation preparation before source-management/schema work. Continuous serial engineering authority permits scoped tested repository commit/push, not SQL execution, live database access, migration generation/apply/reset/push, workers, inference, source enrollment, publication, deployment/DNS, spending, expanded permissions or outreach. Parent owns successors and reports no competing writer. It verified prior AQ-022 commit 6836574 and CI 37545214838. Default model used; exact model/quota unknown.

## Changes

Five documentation files only: new dated inventory report and this journal, plus PROJECT-STATE, BACKLOG AQ-002 and D-012 evidence update. Report covers 13 migrations/796 lines, seven SQL fixtures, exact byte hashes, 10 tables/12 function signatures/22 definitions, eight replacement chains, dependencies, replay hazards, application contracts and historical evidence. It prepares private read-only catalog/history queries with limits and expected outputs, baseline choices and recovery prerequisites. SQL examples are proposals only. No migration content or app code changed; no permanent helper/dependency needed for 13 files.

## Decisions and rationale

The environment restored clean at b9e49bd on work. A first fetch naming the branch refreshed FETCH_HEAD but left the main-only remote-tracking configuration stale; ls-remote exposed the difference. Explicit `git fetch origin refs/heads/aqai-local-index:refs/remotes/origin/aqai-local-index`, switch to aqai-local-index and ff-only merge recovered actual base 6836574 before edits. One worktree, no competing local changes. Read current AGENTS/index, state, charter, architecture, decisions, backlog, workflow, cloud handoff, operating mode and environment register; reviewed all migration SQL plus relevant fixtures/application consumers/history. No readable local SKILL.md was found; documented Start contract followed. Available external artifact/website skills do not apply to repository documentation maintenance.

GitHub open-PR metadata confirmed PR1/5292dc1 and PR2/c7f4805 open/draft/unmerged; neither integrated. Reserved AQ-024/AQ-025/D-027–D-029 untouched. Sole tracked Actions workflow is Project memory; historical hosting evidence says automatic builds disabled. No deployment trigger changed.

D-012 remains in force. The calendar file requires a separately populated registry row and resets runtime/leases; chronological blank replay is incomplete. The original collector fixture assumes seven pilot claims and disabled runtime, unlike current definitions. Neither is evidence of a live defect. Historical manual/individual application claims are clearly separated from present catalog proof. No baseline or repair selected. Pure filesystem hashing plus readable report commands avoid an unnecessary SQL parser/helper.

## Verification

Executed on Node 22.23.3 / Python 3.12.14:

- `node --test scripts/test-project-memory.mjs`: 16/16 passed.
- `node scripts/check-project-memory.mjs --base 6836574088189c40de6ef22bf353eb210db01afa`: passed, 49 Markdown files.
- Report’s Python filesystem reproducer: 13 valid timestamped files, zero duplicate versions/hashes; all 20 tracked SQL paths/hashes matched report tables. Additional offline assertions checked 796 migration lines, 10 tables, 22 definitions/12 functions/eight repeated names, 10 transaction wrappers and seven explicit indexes. No SQL evaluated. The first surrounding ad hoc verifier shadowed its datetime import after all assertions and failed only an unnecessary timestamp print; rerun with isolated snippet namespace passed in full.
- `git diff --check`: passed. Reviewed proposed queries statically only; SQL parsing and execution remain untested. Checked function identities against source and restricted catalog filters; no claim of live command validation.
- Explicit final allowlist: `docs/BACKLOG.md`, `docs/DECISIONS.md`, `docs/PROJECT-STATE.md`, `docs/journal/2026-10-06-2315Z-migration-inventory.md`, `docs/reports/2026-10-06-migration-reconciliation-offline.md`. No SQL/app/workflow/package files changed. Public-safe review permits only repository paths, checksums, generic catalog commands and project-relevant context; no credential values, connection identifiers or private data.
- Final fresh fetch, scoped commit/push, exact remote SHA and Project memory CI will be verified at closeout and supplied in the task response; no recursive status-only commit is required. No SQL/database/app tests or live checks executed; app unchanged. Only GitHub transport/metadata and official PostgreSQL/Supabase documentation reads used the network. Official references are linked beside the proposed command/semantic claims. No credentials, service environment files, private exports, customer/source records or account identifiers were copied.

## Next steps

AQ-002 remains blocked for separately authorized live metadata/history comparison and private recovery evidence. Latest user steering prioritizes AQ-020 recovery proof after this result. Durable coordinator checkpoint: verify this exact remote commit/CI, confirm no active writer, exercise supported wake-up recovery, record actual evidence/limits, then resume one bounded authorized successor. Do not mark recovery tested in advance. AQ-023 safe usage-snapshot design remains an independent candidate after that reconciliation. This child launches no successor/schedule. Supabase Free, Gemini/OpenRouter caps/recovery, manual staging and legacy Netlify apex/DNS unchanged. Parent reports hourly recovery enabled and daily reporting around 19:00 Eastern; interruption recovery/report delivery not tested here.
