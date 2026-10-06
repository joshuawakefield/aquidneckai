# AQ-023 — inference usage observation design

Date: 2026-10-06. Status: design complete; no producer, persistence, runtime wiring or deployment implemented. Actual dashboard usage remains unavailable. This proposal uses an observation already made by the authorized classifier; it never creates a provider request. D-026 remains the display policy; D-030 records this design recommendation.

## Evidence and source boundary

Inspected at development base `d65e18b1a74ebb86dd6feebc206210fc0e8f629c`:

| Existing path | What it establishes | Limit |
|---|---|---|
| [classify-new.mjs](../../scripts/classify-new.mjs), pending-work branch and `api('key')` | After recovery and the bounded pending RPC, a nonempty pending set triggers one existing key observation. Preflight checks positive limit at most $1, null reset, remaining at least $0.02. | No pending work exits before key access. No snapshot is persisted. A valid observation precedes later spending and model-price checks; it is not a post-cycle balance or proof the worker ran successfully. |
| Same classifier, `api('models')`, completion responses and trial patches | Price ceilings, per-response cost and durable claims/recovery evidence. | Model catalog is not usage. Trial costs omit other consumption, failures and historical use; summing them cannot establish lifetime key balance. |
| [recover-assessments.mjs](../../scripts/recover-assessments.mjs), [recovery-cache.mjs](../../scripts/recovery-cache.mjs) | Reconcile saved responses without another inference call. | Saved responses contain source/request material; do not repurpose or export this cache as account telemetry. |
| [preview-handler.mjs](../../scripts/preview-handler.mjs), latest [summary definition](../../supabase/migrations/20261005090000_aqai_source_expansion.sql) | Authenticated preview uses one cached summary RPC; current SQL has no provider usage. | Overview `fetchedAt` is not a provider-observation timestamp. Never make a missing balance zero. |
| [inference-budget.mjs](../../scripts/inference-budget.mjs), [InferenceSummary](../../src/components/InferenceSummary.tsx) | Allowlisted numeric display; $1 cap, 15-minute staleness, $0.10 warning and below-$0.02 stop indication. | Fixtures prove display states only. Current contract cannot carry a provider-attempt error independently of overview failure or validate key/cap identity. |
| [production-server.mjs](../../scripts/production-server.mjs), [cycle-runner.mjs](../../scripts/cycle-runner.mjs) | Web parent spawns a serial cycle and classifier child; inherited environment, local shared filesystem. | A module variable in the classifier cannot reach the web process. Container disk is disposable; no durable database guarantee. |

No live provider documentation or account response was queried. Field names `limit`, `limit_reset`, `limit_remaining` above come from repository code, not newly verified provider behavior. A later implementation must verify their semantics through official public documentation before mapping them; no authenticated provider probe is needed for design. No historical operating-report amounts become fixtures or current telemetry.

## Selected minimal source and persistence proposal

Capture a sanitized result immediately after the **existing** key response has been parsed and before the existing budget guard can throw. Thus a known low balance remains observable even when preflight stops. Observe a failure only if that existing attempt was actually made; recovery/pending failures and an empty queue must not fabricate a key attempt. Do not move, repeat or initiate the call for visibility. Price-check or inference failures must not be mislabeled as key-usage failures.

Recommend a disposable, server-private local singleton for the existing single-instance topology as the smallest future wiring. Use a dedicated fixed path outside `dist`, repository files and classification-response storage, maximum 4 KiB, one latest successful observation plus latest attempt metadata, no history log. Restrict directory/file access (0700/0600), reject symlinks and oversized/non-regular files, write a bounded temporary file then atomically rename, and clean temporary files. No database change or extra summary RPC is needed. Add the local projection only inside the authenticated preview handler; no reader/feed/health output or browser storage. Bound/coalesce local reads; never extend freshness by caching.

This is persistence across serial classifier child exits only. On web-process/container restart, missing disk or cache corruption, return unknown; do not recover a prior boot's balance. Future server startup must establish a new random boot generation **before** accepting preview requests or spawning children. Parent passes that generation to its children; reader accepts only its active generation. Use a fixed singleton path and prevent old-generation writers from overwriting current state through lifecycle ownership/locking; reject mismatched generations even if a late write occurs. Stop/reconcile an old writer before starting a replacement. No daemon, new worker or schedule.

Retain successful values for at most 24 hours from their observation timestamp, then erase numeric values and the success timestamp at next access/write; no cleanup timer or provider refresh. Retain only one bounded latest-attempt status for at most 24 hours as well. Restart invalidates immediately, regardless of age. Idle operation may therefore show stale then unknown indefinitely; that is expected and does not justify polling. Persistence failure must leave inference safeguards/claims unchanged, emit only a fixed sanitized warning and make visibility unavailable. Storage permission/atomicity, invalidation and cross-process propagation require fixtures before wiring; this document does not prove them.

## Allowlist and cap identity

Proposed stored record (construct explicitly; never spread provider JSON):

| Field | Allowed value and meaning |
|---|---|
| `version` | Literal 1. Unknown version invalidates record. |
| `generation` | Private random boot token used only for local matching; never API, log or Git output. It is not a provider account/key identifier or a hash of one. |
| `observedAt` | UTC ISO timestamp assigned server-side when the existing successful key response is received/validated, or null. Never file mtime, UI fetch time, provider reset time or a later write time. |
| `capUsd`, `reset` | Observed cap exactly 1 and observed reset explicitly null, projected as `never`. These are validated, not silently replaced with policy. |
| `usedUsd`, `remainingUsd` | Finite JSON numbers in [0,1], or both null. For this exact cap only, `remainingUsd = limit_remaining`; `usedUsd = 1 - remainingUsd` means consumed key allowance, not monthly/account invoice. Reject strings, nulls, negatives, non-finite or over-cap amounts. Do not substitute trial totals. |
| `attemptedAt`, `attemptStatus` | Latest existing key attempt time; closed enum `ok`, `request_failed`, `invalid_response`, `policy_mismatch`. No arbitrary error text, URL, body or HTTP headers. Absent attempt remains null/unknown. |

Future API projection contains only `checkedAt` (mapped from `observedAt`), `usedUsd`, `remainingUsd`, existing policy constants, plus proposed `lastAttemptAt` and `observationStatus` enum. Internal generation, raw cap/reset response and any unrecognized properties never leave the server. A separate record validator must verify identity/policy/status before invoking the current numeric display helper. Future client types and stale/error text must consume the new metadata; the existing helper strips it, so merely saving JSON cannot complete integration.

**Cap identity is not numeric similarity.** Two keys can have the same $1 cap and different usage. Bind one fixed inherited provider credential to a boot generation; no hot key switching. Any credential rotation, cap-policy/configuration change or process restart invalidates the generation and clears displayed amounts before serving. Compare credentials only in private process memory if configuration can change; persist neither key, suffix, hash/fingerprint, label, account ID nor provider request ID. If this invariant cannot be demonstrated for the hosting topology, keep usage unknown and defer local wiring. A late child from an old generation cannot make data valid for a new one.

The existing classifier allows positive caps below $1; the existing UI assumes exactly $1. An observed cap of $0.50, reset policy other than explicit null, or missing cap metadata is **policy mismatch**, not permission to normalize to $1 or change the classifier. Clear amounts and explain that policy must be reconciled by an authorized operator. An external provider-side cap/key change is unknowable until the next existing observation; the prior snapshot remains explicitly historical and never authorizes spending. Same-key balance increases may reflect an authorized adjustment, but do not infer a reset or new allowance. No status authorizes spending, raises limits, clears claims or retries paid work.

## Freshness, error and display semantics

Reject malformed/future timestamps and nonmonotonic updates within a generation. `attemptedAt >= observedAt` when both exist; later successful observations replace older values, while duplicate/out-of-order writes cannot refresh timestamps. Fail closed on clock reversal. Keep exact numbers for thresholds, rounding for display only.

| Condition | Proposed display | Numeric handling |
|---|---|---|
| No observation, wrong generation, malformed file, unsupported version or identity/policy mismatch | Usage unavailable; concise reason when safe | null, never zero; do not keep a prior key's amounts |
| Valid observation, age at most 15 minutes, latest attempt successful | Within budget / near limit at <= $0.10 / below preflight threshold at < $0.02, all **at last check** | Show recorded amounts/timestamp; not current spendable balance or proof worker is stopped/running |
| Age greater than 15 minutes, but no greater than 24 hours | Usage stale | Show last-known amounts/time with warning |
| Existing key attempt fails or is invalid after a valid same-generation observation | Latest usage check failed; last-known snapshot stale immediately | Preserve earlier success time and amounts only until retention expires; never advance success time |
| Attempt fails with no valid success | Usage unavailable; latest check failed | null; attempt time is not a successful usage time |
| Overview refresh fails | Existing UI stale/count warning plus any known observation failure | Cache can retain old display, never make it fresh |
| No pending work / recovery-only cycle | No new usage observation | Age existing snapshot normally; never infer zero use or provider health |
| Observation older than 24 hours | Usage unavailable; observation expired | Drop numeric amounts/time, no automatic provider request |

Rename the current numeric fixture label “Stopped at budget preflight” to “Below preflight threshold at last check” in a future integration: a snapshot alone does not establish worker execution. Cap and model-price guards remain authoritative. An observation captured before this cycle's inference can overstate remaining allowance even inside the freshness window. State this beside the time; never estimate deductions from trial costs.

## Alternatives and gates

| Option | Disposition and reason |
|---|---|
| Continue unknown | Safe fallback now and whenever identity/storage cannot be validated; least work, less operational visibility. |
| In-process variable only | Insufficient across current classifier/web process boundary. IPC could avoid disk but adds plumbing and restart semantics; reconsider if topology changes. |
| Disposable local singleton | Recommended minimum future integration for one instance; bounded, no DB/schema or provider traffic. Not a durable ledger; multi-instance support is explicitly excluded. |
| Service-only durable singleton in Supabase | Potential later choice for multiple instances/restart retention; needs reviewed schema, writer ordering, private identity design, access tests, Free-plan cost bounds and AQ-002 reconciliation. Do not hide telemetry in trial reports or source definitions. |
| Dashboard key polling, periodic refresh, billing export, trial-cost sum | Reject here: extra access/requests, private data or false lifetime balance. No new credentials, API, polling or paid work. |

Minimal future sequence: (1) pure fixture-only validator/reducer/projection and explicit contract tests, no imports into runtime; (2) separately reviewed local writer/reader/boot-generation and auth integration with filesystem/process fixtures and denied network; (3) review cap-field semantics, single-instance/key lifecycle and disposable-directory guarantees; (4) separately authorized manual staging plus rollback to unknown output. No database, production read or provider call is required for step 1. If the source semantics or lifecycle are unresolved, stop before wiring rather than broadening access. Durable storage requires AQ-002 prerequisites first.

Acceptance fixtures for future implementation: valid consumed-cap values; exact $0.02/$0.10 and 15-minute/24-hour boundaries; missing/null/string/negative/NaN values; smaller/changed cap and absent/reset policy; future/reversed clocks; failed attempt retaining an older success; empty pending set and recovery-only run with zero key requests; late/duplicate/out-of-order write; rotated key with identical cap; old-generation writer after restart; truncated/oversized/symlink file; atomic-write failure; unauthorized preview and no public/health leakage; extra provider fields/identifiers stripped; one existing provider key request versus zero when idle; unchanged durable claim/retry logic. These are requirements, not newly passing implementation tests.

Existing AQ-003 fixtures can be rerun now to confirm the compatibility baseline (unknown default, allowlist, bounded reads, aging and failed overview). They cannot prove future persistence or provider-error handling. No new helper is needed merely to restate this design; a focused future contract implementation has its own acceptance value.
