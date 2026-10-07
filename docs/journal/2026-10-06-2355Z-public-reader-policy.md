# AQ-029 default-private reader route proposal

Task ID: AQ-029
Started: 2026-10-06T23:55Z
Starting commit: 7cfda3354c46e92346d55f2b936781b331f03d75
Status: local implementation/verification complete; draft push/remote CI verification follows in closeout

## Request

Prepare one new draft PR targeting aqai-local-index for AQ-010's reader/assets authentication blocker. Keep private defaults, exact route and build-asset allowlists, existing private API/admin authentication, safe raw paths/methods/queries/cache/errors and minimized public output. Prove default and test-only opt-in behavior with offline fixtures/loopback and the full Node 22/Python 3 baseline. Update readiness/rollback and shared context, review an explicit public-safe file allowlist, verify remote head/CI. No merge, hosted flag, configuration, deployment, new access, accounts, provider/backend requests, SQL, worker, publication, source enrollment, DNS, spending, successor or schedule.

## Decisions and rationale

Restored clean work branch b9e49bd; ordinary fetch left origin stale because of the saved fetch refspec. Explicit development-ref fetch matched remote 7cfda335. Created proposal/aq029-public-reader-policy from that base. Read AGENTS, docs index/state/charter/architecture/decisions/backlog/workflow/operating mode/environment/handoff/readiness/tracker and actual server/auth/feed/build code. Workspace .agents/.codex are empty; no repository .agents or readable local SKILL.md. Used the documented startup fallback. Selected retained Node 22.23.3 and Python 3.12.14. Strong reasoning requested; exact task model/quota are not exposed.

Reconciled base and both remote draft branches/connector metadata. PR1 968cd3fb94992cadcd659034259902500d63a84a and PR2 c7f4805edb4cdf2dadf53d8d6b3d5a96c8d30b1f remain open/draft/unmerged and untouched. IDs AQ-024/025/028 and D-027–029 reserved; AQ-026/027 and D-030 on base; no AQ-029/D-031 found. AQ-010 preparation's follow-up is this proposal. Shell GraphQL is Forbidden; existing connector reads succeed, without new permission.

Expected outcome supports G-001/G-002/G-003 by preparing safe reader delivery while reducing launch uncertainty. Existing anonymous published feed/liveness/aggregate health are deliberately preserved, not described as newly private. Root/admin/static/private APIs keep authentication by default. URL normalization before routing and spread-based public feed mapping are relevant hardening findings, not evidence of a live breach.

## Changes

Added strict absent/false/true flag parsing, raw canonical request-path admission, build-manifest static dependency allowlisting excluding dynamic editorial chunks, regular-file checks without symlink aliases, no public SPA fallback, no-store/Vary headers and explicit feed output fields. Vite manifest generation alone changes no access. Enabled mode is used only in offline tests; separate approval is required before hosted configuration or deployment.

## Verification

Completed across 2026-10-06/07 UTC on Node 22.23.3/Python 3.12.14. Initial unchanged-base baseline passed TypeScript, 54 frontend / 65 backend / 39 Python tests, production build and auth smoke. Final `node scripts/cloud-check.mjs` passed TypeScript, 54 frontend / 66 backend unit + 21 policy/build/loopback (**87 backend total**) / 39 Python tests, build and the existing real-adapter secret-free auth smoke. `npm run lint` passed with 0 errors/8 unchanged warnings; `node --test scripts/test-project-memory.mjs` passed all 16 continuity tests. Added explicit field-projection coverage, including unknown private fields in current/archive output. No unrelated test expansion or dependencies added.

The policy suite uses literal route/method expectations, raw Node HTTP requests (avoiding fetch's path normalization), synthetic records and temporary runtime copies with a fixture adapter. Successful feed tests verify only the explicit public fields and published records, bounded reads/cache and query non-interference; failure tests verify generic no-store 503 and empty HEAD. Workers remain false; ephemeral listeners bind 127.0.0.1 and inherited offline fetch/TCP guards reject external destinations. The ordinary smoke exercises the actual adapter with no credentials and a truthful 503. These are not live authorization/SQL/provider tests.

Cases: absent/false defaults; malformed/padded flags; minimum staging credential; strict GET/HEAD reader and assets; private routes, both admin aliases and their JS/CSS; invalid authorization; queries; alternate POST/PUT/PATCH/DELETE/OPTIONS/TRACE; protected editorial POST and same-origin rejection; API/static/SPA separation; raw and multiply encoded traversal, dot/backslash/slash/absolute-target ambiguity; missing maps/assets; removed files; inside/outside symlinks; invalid/missing manifest; private dynamic dependencies; generic upstream failure; no-store/Vary/auth responses; no secret-marker/fixture-canary public bytes; same-artifact opt-in-to-private rollback. Actual built HTML dependencies are admitted, while separate editorial JS/CSS are denied anonymously and available with the existing fixture credential.

An initial memory check found the checkpoint journal used descriptive rather than required exact headings. Corrected it to the repository template and reran; no runtime change was needed. `node scripts/check-project-memory.mjs --base 7cfda3354c46e92346d55f2b936781b331f03d75` passed across 55 Markdown files; `git diff --check` passed. Final explicit fetch/remote comparison still matched the original development base and both untouched design heads. Local full-run logs remain outside Git; reproducible tests and this outcome are the public evidence, not raw records.

## Reviewed upload allowlist

- scripts/public-reader-policy.mjs
- scripts/production-server.mjs
- scripts/published-feed.mjs
- scripts/test-public-reader-policy.mjs
- scripts/test-published-feed.mjs
- scripts/cloud-check.mjs
- vite.config.ts
- docs/ARCHITECTURE.md
- docs/BACKLOG.md
- docs/DECISIONS.md
- docs/PROJECT-STATE.md
- docs/VISITOR-EXPERIENCE-TRACKER.md
- docs/reports/2026-10-06-release-readiness-v01.md
- docs/journal/2026-10-06-2355Z-public-reader-policy.md

No env files/values, credentials, cookies, account identifiers, private customer data, exports, logs, build output or unrelated history are included. Fixture strings are deliberately synthetic. The public artifact's source/import graph and served HTML/JS/CSS/favicon were inspected; known-marker assertions are a regression guard, not a universal secret scanner. No changes to package dependencies, Docker/host configuration, workflows, auth providers, runtime caps, database/migrations or the unmerged designs. Current sole workflow is read-only Project memory, triggered by development pushes/PRs, with no deploy step; feature push does not target deployment/main. Existing manual-build hosting policy remains in force; no host inspection/change requested.

## Next steps

Push only proposal/aq029-public-reader-policy; open a NEW draft targeting aqai-local-index, keep auto-merge disabled, reconcile the development ref without force/reset, verify exact remote head and completed CI. Final commit/PR/CI identities are returned after that operation, without a self-referential status commit. No merge, actual flag enablement, deployment or broader permission.

AQ-010 remains blocked: proposal review/disposition, real artifact/edge/auth/content verification under separate approval, design acceptance, AQ-002 live comparison/restore and reader evidence. Detailed release/config rollback gates and limitations are in the readiness amendment; downloaded bytes cannot be revoked, feed remains historically anonymous, edge normalization/caches are unverified and mutable artifacts are unsupported. Supabase Free, current Gemini/OpenRouter caps, manual staging and legacy apex/DNS are unchanged.

Next independent recommendation: prepare a neutral evaluation script/evidence template for PR1's Understand/Use/Connect journey, with task-success, misunderstanding and unverified-claim criteria, without recruiting, outreach, telemetry or publication. Parent should assign a fresh ID after ref/backlog reconciliation; this task launches no successor/schedule. Exact model/quota/reset are not exposed; no continuity or quota recovery guarantee is asserted.
