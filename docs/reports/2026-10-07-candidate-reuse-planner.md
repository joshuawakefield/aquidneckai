# AQ-035 — bounded candidate manifest and unchanged-content planning

2026-10-07 UTC. Base `56d3e4095991f684093b18eb85749e9be0e2067b`. Implemented and locally tested; no runtime integration or activation. [Manifest](../../scripts/offline/candidate-manifest.json), [pure planner](../../scripts/offline/candidate-reuse.mjs), [replay](../../scripts/offline/replay-candidate-reuse.mjs), [tests](../../scripts/test-candidate-reuse.mjs).

## Finite useful-source shortlist

Six seeds map to six exact existing catalog endpoint candidates, not newly discovered articles. No link expansion, new source IDs, inferred feed endpoints or directory traversal. `canonicalUrl` denotes the selected catalog endpoint; it is explicitly **not** a verified publisher canonical declaration. Feed candidates have page/endpoint scope until a specific item and its supplied excerpt/story can be checked. Every record includes identity basis, role, access/rights evidence, expected topic/audience/local usefulness, verification reason, checked scope/date and proposed inactive weekly review cadence. Existing running cadences remain unchanged.

| Existing source ID | Expected usefulness, subject to actual story evidence | Current limitation |
| --- | --- | --- |
| `newport-buzz-home` | Local technology developments for residents/SMBs | Historical reporting/feed identity only; no current story checked |
| `newport-chamber-events-programs` | Local technology learning and business connections | Failed access attempt; programs, dates and participation unknown |
| `uri-rhody-today` | Nearby AI/robotics/frontier research and maturity limits | Failed feed access attempt; no item checked |
| `one-useful-thing` | AI at work, education and life; broader practical commentary | AQ-031 About-page identity evidence only; feed attempt failed |
| `there-is-an-ai-for-that-tools` | User-requested TAAFT tool leads, subject to maker evidence | Current identity/access unverified; no new request or bypass |
| `deeplearning-ai-the-batch` | Broader AI developments, traced to originals | Catalog digest/page lead only, not reviewed linked stories |

One Useful Thing/TAAFT are requested interests, not trusted-by-default sources. All six stay `needs_review`, rights unknown, AQ-033 annotations absent. The real manifest therefore produces six `hold_no_response` results when replayed without supplied evidence. It makes no claim of verified articles or useful current news yield. Historical identity/source roles come from the [AQ-031 audit](https://github.com/joshuawakefield/aquidneckai/blob/031bb208068efbe74787eb20cef36950e85660de/docs/reports/2026-10-07-useful-news-source-audit.md) and current catalog; exact per-story bylines are unknown.

## Bounded public inspection — actual counts

At 01:19:21 UTC, one public GET attempt each to URI's configured feed, One Useful Thing's configured feed, and Chamber's configured events/programs page failed at the environment proxy tunnel with 403 before origin content. **3 attempts, 0 origin responses, 0 article/body bytes retained, 0 redirects followed, 0 retries**. The intended per-request ceiling was 256 KiB plus one overflow sentinel, ten-second timeout, no redirect following; the task ceiling was eight requests/two per host. Stopped after the common access failure. This is not a measured origin-side denial or proof of broken RSS. No alternative transport, login, challenge/paywall bypass or TAAFT retry. No copyrighted article text stored. Model/paid API calls **0**, incremental API spend **$0**; no claim about ChatGPT subscription usage or remaining quota.

## Reuse of existing mechanisms

The planner calls AQ-033 `evaluateTechnologyCandidate` and `planReassessment`; it does not implement a new semantic classifier, registry, downloader or persistent cache. It consumes reviewed evidence annotations and cannot establish their semantic truth. Runtime `collector-policy.mjs` already hashes normalized title/description/source date and deduplicates; `conditional_download.py` already binds validators to exact endpoints/adapter version with seven-day full-refresh expiry. Neither runtime behavior is changed. The offline digest adds explicit reviewed evidence/provenance/rights context to the planning comparison; it is not a replacement observation hash or a migration of existing content.

Digest inputs: supplied meaningful body, title and AQ-033 evidence/annotations. Original/update dates, attribution, scope, rights, commercial disclosures, source condition and supporting asset text remain substantive. Only explicitly separate fetch/approval/check clocks are omitted; no regex strips dates/numbers from prose. Source review freshness is independently evaluated. Raw page metadata extraction remains future source-specific work: a clock embedded in body text still changes the digest conservatively.

Completed unchanged 200/304 evidence reuses existing assessment, keyed by exact URL, stable source ID, scope, policy/extraction version and meaningful digest. A 304 additionally needs matching saved material, the sent saved validator, exact final/endpoint URL and fresh `conditional-v1` full-fetch time; it never advances the full-story fetch date. Expiry/version changes cause offline review, not a paid refresh. A completed claim without recoverable material is held. Pending/uncertain/unknown claim states remain reconciliation-only even after body changes, access failures or expiry. Saved responses are routed to existing recovery validation; malformed results require review, never another inference call. A mocked `loadRecoveryResponses` plus real pure `assessResponse` test recovers a valid unpublished synthetic candidate with one saved-file read and zero network calls.

Duplicate exact URLs suppress repeated work without inheriting trust, but cannot hide a pending paid claim. Explicit confirmed copies are held; hints require review. URL query/path/fragment distinctions are retained using AQ-032's URL contract. Access 403 stops; transient 429/502/503/504 and future/invalid retry dates hold, without timers. Any redirect stops rather than widening scope. HTTP errors never become unchanged-success evidence.

Limits are fail-closed: six seeds, twelve candidates, eight traced request attempts including failures/retries/redirects, two per host, 256 KiB/response and 1 MiB aggregate. The ledger is supplied evidence, not independently measured network telemetry; callers must include every attempt. This pure helper cannot enforce a live service's behavior or validate DNS/private-address destinations. Its URL checks are evidence syntax checks, not permission to fetch.

## Measured deterministic replay

Run `node scripts/offline/replay-candidate-reuse.mjs` under Node 22. Twelve alternative synthetic states (one fictional seed/URL per replay), **12/12 expected actions matched**. These are not twelve real source candidates or live requests.

| Scenario | Predicted action / cost category |
| --- | --- |
| 200 unchanged; valid 304; volatile transport metadata | Reuse existing assessment / reuse without assessment (3) |
| Substantive body change, supplied fresh fictional usage | Review changed material / potential paid work requiring separate authorization (1) |
| Confirmed copy; 429/backoff; 403; uncertain paid outcome; missing usage; expiry; 304 without baseline | Hold/reconcile/review / offline review (7) |
| Saved paid response | Reuse saved response for validation / saved-response recovery (1) |

All actions have `paidCalls: 0`, no enrollment/publication permission. No avoided-dollar calculation, token estimate, price assumption or real-world accuracy claim. Missing/stale/invalid usage stops new/changed material before paid assessment; unchanged work needs no provider request. Even the fresh-usage branch still lacks activation, price checking and shared reservations and therefore cannot spend. The fictional remaining balance in tests is not an account observation.

Thirteen new regression groups cover these outcomes plus substantive rights/disclosure/date changes, canonical key ordering, identity/scope/version/validator mismatches, stale reviews, unknown claim states, malformed recovery, duplicate/uncertain precedence, redirect/backoff, request/byte/seed/candidate caps, immutable inputs, catalog identity preservation and absent runtime imports. Full secret-free baseline: **65 frontend / 105 backend / 39 Python**, TypeScript/build/loopback auth pass; lint **0 errors / 8 known warnings**, **16 continuity tests** pass. [Journal](../journal/2026-10-07-0123Z-candidate-reuse-planner.md) records allowlist and handoff.

## Stop here; next useful outcome and activation prerequisites

This bounded planner proves the requested offline no-repeat behavior. Do not add another generic harness or ontology. Recommend a **small reviewable news edition**: at most three real recent items from already configured sources, including a local technology development and a broader practical idea, with source/date/scope, attributed evidence, reader usefulness and honest unknowns. This is a recommendation for the parent, not a launched successor or publication request. Existing saved observation read access would avoid re-downloading; otherwise a separately bounded public inspection through an available approved reader is needed. This environment's proxy blocks the three attempted reads, so actual current evidence is the immediate blocker. No broader permission request or service access was attempted here.

Before live collection or integration: resolve endpoint identity/access/rights; inspect actual per-story provenance and independent semantic annotations; choose source-specific meaningful extraction; review a draft runtime PR that reuses durable observation claims/recovery and includes destination/redirect/byte/time/cadence enforcement. Before any paid assessment: separately authorize scope, obtain current authoritative usage/prices and shared atomic reservations including pending/uncertain amounts under the existing $1 non-resetting test cap. TTL expiry is never spend authorization. Source enrollment, editorial publication, AQ-002 migration/history gates and AQ-010 release/isolation/rollback remain separate. Keep current Gemini/OpenRouter, Supabase Free, manual staging and legacy apex/DNS. The future Decisions API idea stays expressly deferred. PR1/2/3 remain draft/unmerged; no worker, live SQL, deployment, outreach, purchase, successor or schedule.
