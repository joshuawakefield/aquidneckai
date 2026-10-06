# Conditional downloads and dependency maintenance — October 2, 2026

> Historical report, curated for public repository continuity on 2026-10-06. This records October 2 implementation and verification. The original 24-hour full-fetch interval was changed to seven days on October 5 so daily sources could benefit from conditional requests. Read [PROJECT-STATE](../PROJECT-STATE.md) for current state; archived deployment details are not new permission.

The task addressed the deferred findings from the [October 1 audit](2026-10-01-egress-reduction.md).

## Implemented

- Approved RSS feeds and the existing Salve calendar adapter use ETag and Last-Modified validators. HTTP 304 responses skip body downloads, parsing, and observation reinsertion.
- Cache metadata is persisted in the existing source record only after successful parsing and atomic collection completion. It survives container restarts; no additional database table or paid service is needed.
- A successful unchanged check preserves the last parsed item count, records zero new observations, renews the normal schedule, and keeps source health eligible. Failures remain failures and retain the last good cache. Replayed finish requests remain idempotent.
- Changed responses replace validators instead of retaining obsolete ones. Endpoint or adapter changes invalidate cache use. Redirects strip conditional headers; redirected feeds currently use full downloads conservatively.
- A full download occurs once cached full-fetch metadata is at least 24 hours old, at the next scheduled check. Feeds without usable validators continue normal bounded downloads. Existing one-retry handling for temporary network/server failures is preserved.
- Fixed the stylesheet import-order warning and refreshed stale browser compatibility data through the dependency lockfile update.

HTTP behavior follows [RFC 9110 conditional requests](https://www.rfc-editor.org/rfc/rfc9110.html#name-if-none-match). Benefits depend on each source supplying and honoring validators; no claim that every source will return 304.

## Dependency findings resolved

Initial npm audit: 24 advisories (2 low, 5 moderate, 16 high, 1 critical).
Final npm audit: **0 reported advisories**, including the development dependency tree.

Compatible security updates were applied first. Remaining vulnerable release lines were upgraded to Vite 6.4.3, Vitest 4.1.11, and React Router DOM 7.18.4. React remains on 18. System npm 10's dependency resolver crashed; a temporary project-local npm 11 resolved the lockfile. A subsequent npm 10 clean install passed, verifying compatibility with the existing Docker builder. Temporary package tooling and audit reports were excluded from GitHub and Docker build inputs.

Zero reported advisories is a point-in-time registry result, not a guarantee against unknown vulnerabilities. Package deprecation notices are not all eliminated; replacing unrelated libraries is outside this maintenance change.

## Verification

- 10 conditional-download Python tests and 7 existing feed/parser tests passed.
- 28 Node tests passed, including unchanged-result normalization and the prior bandwidth regressions.
- 9 frontend tests passed, including root, preview, and unknown-route checks following the router upgrade.
- TypeScript, Vite production build, and server authentication/path-isolation smoke tests passed.
- SQL tests passed inside a rolled-back transaction: initial cache capture, populated-feed 304 without duplicate observations, preserved item count, failure/cache recovery, changed response clearing, replay, uncached 304 rejection, and private function permissions.
- Live read-only check of the already-approved Innovate Newport feed returned parsed with validators, then not_modified on the second request. No database writes or inference were performed by that check.
- Applied only `20261002090000_aqai_conditional_downloads.sql`. It replaces the existing finish function while retaining the source/lease/history model and service-only access. Older migration history remains unreconciled; do not run every old migration.

## Deployment

Completed October 2 at approximately 01:27 EDT (05:27Z). Runtime-only commit [6ecf750e](https://github.com/joshuawakefield/aquidneckai/commit/6ecf750e313b9bc5b739b6cbf0c35d084b7c2dea) was deployed to Hyperlift staging. Later commits supersede it.

The first two builds failed before compilation because Spaceship's image-registry token endpoint timed out. At the user's request, a later manual retry succeeded after provider connectivity recovered. Hosted npm installation reported zero vulnerabilities and the production image built and uploaded successfully.

Live verification: health HTTP 200, collectorVersion conditional-downloads-v1, successful worker cycle 2026-10-02T05:27:19.550Z; 188 enabled sources, 19 eligible and 169 awaiting adapters. Public feed HTTP 200 with two entries and public max-age=30/s-maxage=60. Private preview, review and evidence endpoints all return 401 without credentials.

Immediately after deployment no sources had populated the new persistent cache metadata yet; this will occur through normal scheduled fetches. No forced source checks or inference tests were run during deployment. The earlier live two-request feed check and transactional database tests verified conditional-response handling.

Nine runtime/config files were uploaded; private reports, SQL fixtures/migration files, test files and temporary npm tooling remained local. Automatic deployments remain off. Supabase remains Free. Existing source coverage, publication policy, inference budget safeguards, main Netlify site and DNS are preserved.

