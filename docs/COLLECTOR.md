# Collector operations

Current reference: [architecture](ARCHITECTURE.md), [recurring sources](reports/2026-10-05-recurring-sources.md), [state](PROJECT-STATE.md).

The hosted Node worker invokes bounded Python collectors, assessment, calendar reconciliation and publication serially. Source due times, leases and backoff live in Supabase. Runtime monitoring is already active; old pilot commands are historical and must not be replayed as setup tests.

## Invariants

- Explicit source registry with supported adapters and verification status; configured, scheduled and healthy are separate states.
- Up to 16 due sources per cycle, four fetches concurrently. Check only due sources.
- Retain normalized URL, source identity, content hash, dates and evidence. Unchanged content creates no duplicate observation.
- Conditional fetch metadata reduces downloads; scheduled full refresh prevents indefinite reliance on validators. See code/report for current interval.
- Per-response/text limits and approved endpoint/redirect rules constrain fetching.
- Expired leases and source failures remain visible; endpoint errors are not a reason to silently remove coverage.
- Assessment has durable claims and bounded batches. Recover saved results before considering any explicitly authorized paid retry.
- Collection and classification do not imply publication. Page watches are discovery evidence and cannot be approved as individual articles.

## Credentials and testing

Server credentials stay in approved secret storage. Public-source child processes must not receive database/inference keys. Do not use production credentials in fixture checks.

Run `node scripts/cloud-check.mjs` from a clean checkout for the repository's offline baseline. Live collection, activation, recovery and SQL application are operational actions with separate evidence and authority; they are never environment install steps. See [migration record](MIGRATIONS.md) before any schema work.

