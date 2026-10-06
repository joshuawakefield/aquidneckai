# October 1, 2026 bandwidth reduction

> Historical incident report, curated for public repository continuity on 2026-10-06. Baselines and tests are from October 1; later follow-up is explicitly noted below. This is not a current usage reading or authorization to rerun deployment. Read [PROJECT-STATE](../PROJECT-STATE.md) first.

The task was to remove inefficient reads, report other obvious inefficiencies, and keep Supabase on Free. No plan upgrade or data deletion occurred.

## Verified incident

- Organization usage: 6.668 GB against 5 GB, billing interval September 16–October 16. This is cumulative usage; applying fixes does not erase it.
- Database is small: 29.41 MB, with 508 observations and 509 classification trials at inspection. Zero Storage, cached egress, Realtime, and Edge Function usage shown. Anonymous reads do not appear as Auth MAU.
- Database-side serialized sizes: all observation rows approximately 1,381,483 bytes; classification report bodies approximately 1,051,849 bytes. These are JSON-size estimates, not compressed wire bytes or exact billing attribution.
- An idle cycle previously downloaded classification report history three times and observation history twice. Health probes and the private dashboard independently reread large records.

## Changes

| Inefficiency | Resolution |
| --- | --- |
| Classification downloads completed history to find pending work | Database selects at most 80 pending observations and only their required source context. Existing claims and paid-request safeguards remain. |
| Recovery downloads all reports and observations every cycle | Query only incomplete claims older than 15 minutes; no observation read when none exist. |
| Publisher rereads all reports and observations | Database returns only unpublished current candidates, in batches of 80 with a cursor. |
| Every health probe downloads enabled source definitions | Compact database summary, cached for 60 seconds with concurrent requests sharing one read. Overdue-work checks still age correctly. |
| Dashboard loads all reports and evidence, including when hidden | Overview summary only; five-minute visible-tab refresh; one request at a time. Review opens on demand with 25 records per page and submitted server-side search. |
| Evidence downloaded for articles never opened | One excerpt fetched on expansion and reused while mounted. |
| Public feed queries database on every request | 60-second server cache plus browser/shared-cache headers. Errors back off briefly and are not hidden as successful stale data. |
| Repeat static asset downloads | Hashed build assets receive private immutable browser caching. |
| A revised observation of an existing URL can fail publication with duplicate insert | Existing observation IDs and canonical URLs, including withdrawn entries, are excluded. Concurrent duplicate insert conflicts are tolerated. |
| Frontend packages copied into the runtime image | Runtime image contains compiled assets and standard-library backend code; build dependencies remain in the build stage. |

Manual assessment export was adjusted locally to use an explicit paginated history read, preserving offline export without restoring history downloads to the dashboard.

## Other finding deferred

RSS/calendar fetchers do not yet use ETag or Last-Modified validators. Conditional upstream requests could avoid downloading unchanged feeds when the publisher supports them. This primarily concerns source-site and hosting traffic, not the Supabase egress incident. Adding it requires adapter-specific handling of 304 responses and retained validator state; it is not part of this fix.

## Build maintenance finding

The hosted npm install reported 24 dependency advisories (2 low, 5 moderate, 16 high, 1 critical). This is the existing locked dependency set; exploitability and affected paths were not assessed in this bandwidth task. It warrants a separate dependency review. No blanket upgrade or audit-fix command was run. Runtime node_modules are now omitted, but frontend bundles still require dependency review.

## Verification

- 27 Node regression tests passed; six frontend tests passed; TypeScript and Vite production build passed. Targeted six bounded-read tests passed again after final ID-validation tightening.
- SQL fixtures passed in a rolled-back transaction: selection limits, claim exclusion, explicit reassessment, duplicate/withdrawn URL exclusion, pagination/search, evidence exclusion, source readiness, and service-only permissions.
- Only the new additive migration was applied and committed in the live database. Existing migration tracking is unreconciled; do not run all older migrations or blindly run db push.
- Live read checks: pending assessments `[]` (2 bytes), publication candidates `[]` (2 bytes), recovery claims 0, recovery observation reads 0; health summary 188 bytes; overview 51,366 bytes. Sizes are UTF-8 JSON serialization, not provider-billed transfer.
- Local updated HTTP server against the live DB, with worker disabled: 508 observations and 508 classified preserved; 17 require review; all-record page contains 25 of 508; evidence fetched separately; two published entries preserved; feed cache headers present.
- Production smoke tests passed for health, authentication, SPA, and blocking secret/source paths. Runtime imports were inspected: production worker and server use Node/Python standard libraries. Docker hosting build remains the final image validation.

## Deployment status

Completed on October 1 around 23:12 EDT (October 2 at 03:12Z). Database helpers applied; user-approved runtime commit [a4e1f5b](https://github.com/joshuawakefield/aquidneckai/commit/a4e1f5b7b45018aeb528074edfb560dea2f09877) fast-forwarded aqai-local-index. Manual Hyperlift Docker build and deployment passed. Automatic builds remain disabled. Do not force-push the divergent local Git history.

The approved upload at that time contained 11 runtime files. Tests, migration SQL and reports were excluded from that runtime-only publication; this historical scope explains why a later repository-context handoff was needed.

Live verification at 03:13Z: `/healthz` HTTP 200, `collectorVersion: bounded-reads-v1`, successful worker cycle at 03:12:40.923Z; 188 enabled, 19 eligible, 169 waiting sources. Public feed HTTP 200, two entries, `public, max-age=30, s-maxage=60`. Private preview/review/evidence routes all return 401 without credentials. The runtime image starts successfully without node_modules.

No Supabase upgrade, new subscription, DNS change, history deletion, source expansion, paid assessment retry, or publication-policy change was made. Main AquidneckAI.com remains on Netlify.

Actual ongoing billed egress needs later provider usage evidence. The 6.668 GB already used will remain on this cycle's counter; the displayed billing interval ends October 16. A single payload measurement cannot guarantee the free quota at arbitrary future traffic.

## October 2 follow-up

User requested addressing deferred findings. Conditional downloads, dependency advisories, CSS import order and browser-data warnings are implemented and tested; see [conditional downloads](2026-10-02-conditional-downloads.md). The cache persistence migration is applied. Two initial Spaceship image-registry timeouts were resolved on the user-requested retry; conditional-downloads-v1 deployed successfully at 05:27Z October 2 and passed live health/feed/auth checks.

