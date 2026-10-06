# AQ-010 bounded release-readiness preparation

Task ID: AQ-010
Recorded: 2026-10-06T23:50Z
Starting commit: 5d818832d48226ce94dcafe1162cdcb7521c5372
Status: local preparation completed; release gates blocked/unverified

## Request

Assess code and proposed first release, public/admin access, content/assets, health, recovery and exact operation gates without live services, worker, SQL, deployment, DNS or outreach. Preserve both unmerged proposals. Parent owns successors and schedules; none created here. Supports G-001/G-002/G-003 by identifying what evidence is needed before readers can safely use the replacement.

## Changes

- Added [versioned readiness matrix](../reports/2026-10-06-release-readiness-v01.md), grounded in server/routes/feed/build and the PR1 v0.3 brief. Verdict: not public-release-ready. Local tests are not current staging or reader usefulness evidence.
- Extended existing production smoke with root/admin/static/status auth, liveness, health bypass semantics, anonymous unavailable feed, POST restriction, HEAD, cache/noindex and encoded traversal checks. The smoke now also applies the existing clean-environment/preflight guard on direct invocation so the new feed probe cannot inherit service credentials or load real .env files. No application/runtime/auth behavior changed; no concrete serious vulnerability found in this bounded review, not a comprehensive security certification.
- Updated state, AQ-010 backlog, visitor follow-through and staging rollback pointers. Existing D-011/D-012 cover the boundaries; no new decision/ID allocation needed. AQ-024/AQ-025/AQ-028 remain reserved in PR1; PR2's historical AQ-024/D-027 collision remains branch-qualified. No prototype touched, merged, closed or integrated.
- Clean saved checkout initially had a main-only fetch refspec; explicitly fetched development and both proposals before fast-forwarding to actual start. Shell GitHub GraphQL/REST returned Forbidden; existing connector read PR metadata and CI without reauthentication or expanded access. Both PRs open/draft/unmerged at matching refs. PR1 CI 37548195462 succeeded at 968cd3fb94992cadcd659034259902500d63a84a.
- Read AGENTS, docs index/state/charter/architecture/backlog/workflow/decisions, operating/access/handoff records, visitor tracker and PR1 brief. No repository/local SKILL.md was available; installed cloud skills do not apply to this repository-only assessment. No artifact-library or site workflow needed for repository documentation.

## Decisions and rationale

Keep preparation separate from release acceptance. The existing route guard is safe for private staging but does not implement the intended free public reader; changing that boundary is the next reviewable implementation rather than an incidental audit edit.

## Verification

Node 22.23.3 from the retained temporary toolchain, Python 3.12.14. Executed `node scripts/cloud-check.mjs`: TypeScript, 54 frontend / 65 backend / 39 Python, production build and expanded loopback smoke passed. Runner strips service configuration, blocks external test network, disables worker and live DB health checks. Successful public-feed behavior is fixture-level; loopback feed check proves honest 503 with no credentials, not current database access. Full `npm run lint`: 0 errors/8 unchanged warnings. All 16 `node --test scripts/test-project-memory.mjs` tests passed. Memory validation uses actual start SHA. Its first run rejected noncanonical journal heading names; corrected to the required template headings and reran. Final diff/allowlist and remote evidence are reported at closeout.

Reviewed upload allowlist:

- docs/reports/2026-10-06-release-readiness-v01.md
- docs/journal/2026-10-06-2350Z-release-readiness.md
- docs/PROJECT-STATE.md
- docs/BACKLOG.md
- docs/HYPERLIFT.md
- docs/VISITOR-EXPERIENCE-TRACKER.md
- scripts/test-production-server.mjs

Only public-safe prose and synthetic test assertions. No .env, credentials, cookies, private exports, customer data, account identifiers, generated builds or unrelated history uploaded. This is a bounded docs/existing-test update appropriate for authorized direct development push; the recommended future auth implementation should use a draft PR. No new application code or dependency change. Hosting auto-build-off remains historical configuration, with no deploy workflow added or invoked.

## Next steps

AQ-010 preparation done; release not ready: design acceptance/integration, public route policy, live schema/history comparison, recoverable backup/restore, current staging/TLS/host/mail evidence and actual readership remain unverified. AQ-003 real usage unavailable; AQ-023 design only. AQ-026 exceptional/report/quota evidence unchanged. Preserve Supabase Free, Gemini/OpenRouter caps, manual staging and legacy Netlify apex. Actual task model/quota unknown.

Parent should consider one local-only, default-private public-reader route-policy task with negative auth/API tests and draft PR; assign a fresh ID after ref reconciliation. No deployment or proposal integration implied. Follow the readiness matrix's separate grants before any live read, backup, restore, schema write, host restart/worker activity, publication, outreach or cutover. Final exact push SHA/CI verification goes in the task response, avoiding recursive status-only commits.
