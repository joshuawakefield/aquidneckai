# Staging operations

Verified October 6, 2026. Use the [current state](PROJECT-STATE.md), [architecture](ARCHITECTURE.md) and [cost report](reports/2026-10-06-operating-costs.md) for dated status.

The existing Hyperlift Small application builds the `aqai-local-index` branch using the root Dockerfile on port 8080. Builds are manual; automatic builds remain off. The replacement hostname is staging.aquidneckai.com. The existing apex remains on Netlify.

## Server configuration

Server-only secrets are SUPABASE_URL, SUPABASE_SECRET_KEY, OPENROUTER_API_KEY and AQAI_STAGING_PASSWORD. They belong in approved hosting secret settings, never GitHub or frontend VITE variables. AQAI_WORKER_ENABLED controls the hosted worker. No migrations run at build or startup.

Root/admin retain staging authentication. Public published API exposes only published reader entries. /livez checks process liveness; /healthz reports degraded when dependencies/sources fail. A health 503 alone does not mean the container is down.

## Deployment procedure

1. Confirm the reviewed commit, task authority and rollback target; run local fixture/build checks.
2. Manually build the existing staging app. Do not buy a plan, toggle automatic builds or alter DNS.
3. Verify the actual deployed commit/timestamp, liveness, private API 401s, bounded public feed and relevant authenticated UI behavior.
4. Inspect a naturally occurring worker cycle and source failures without forcing unnecessary paid work.
5. Record staging verification in PROJECT-STATE and the task journal. Public cutover is separate.

The worker is already active; do not replay historical pilot/activation commands. Standard articles wait for editorial approval; strict qualified official-calendar entries have a separate automatic path. Paid request claims/results are durable in Supabase; transient container caches are not a backup. Follow recovery procedures before considering a paid retry.


## Release and rollback gates

Use [AQ-010 readiness v0.1](reports/2026-10-06-release-readiness-v01.md) before proposing a first public release. Root and all static assets currently remain authenticated; public-reader mode needs an explicit server policy. Current local tests do not establish current staging readiness. A manual container restart can immediately start an enabled worker, so deployment authorization must settle worker behavior separately from UI changes.

Retain a verified compatible artifact and configuration for code rollback; reverting Git does not roll back hosting or committed data. Backup/isolated restore, schema compatibility and paid-claim recovery are separate [AQ-002 prerequisites](reports/2026-10-06-migration-reconciliation-offline.md#backuprestore-prerequisites-and-rollback-caveats). Historical transaction rollback fixtures are not a restore rehearsal. No rollback or deployment is authorized by these instructions alone.
