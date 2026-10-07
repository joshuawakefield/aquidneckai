# AQ-030 owner visual review and private candidate — v0.1

7 October 2026. **Packet complete; private staging approval remains blocked on hosted evidence.** This is a narrow companion to the [AQ-010 matrix](2026-10-06-release-readiness-v01.md), not a replacement public-launch checklist. No deployment or PR merge occurred.

## Candidate and difference from staging

| Item | Reviewable identity / status |
|---|---|
| Proposed application candidate | `7cfda3354c46e92346d55f2b936781b331f03d75`, fetched integrated `aqai-local-index`; clean before packet edits. |
| Historical staging | `b34b14e11e2fb7403afddef1fc4004a078620449`, October 6 ~20:27 UTC observation; current hosted SHA UNKNOWN. |
| Build | Node 22.23.3 / Python 3.12.14 / Vite 6.4.3; production dist built locally. Asset identities and SHA-256 values in [manifest](2026-10-07-owner-preview-v01-manifest.json). No hosted image/build ID exists for this candidate in this task. |
| Intended private target | Existing Hyperlift Small app, `staging.aquidneckai.com`, root Dockerfile/port 8080, manual builds per [operations](../HYPERLIFT.md). Target configuration has not been freshly inspected. |
| Proposed configuration delta | **NONE.** Retain global staging authentication, manual builds, existing caps, Supabase Free and legacy Netlify apex/DNS. This proposal does not certify the safety of the current worker configuration. |
| Data isolation | **UNKNOWN** on host. “Staging” is a hostname, not evidence of a disposable database. Local screenshots use intercepted synthetic responses only. |
| Rollback artifact | **UNKNOWN**: historical commit is not a retained, rebuildable, compatible hosting artifact. Configuration pairing and recovery proof unverified. |

The base adds AQ-021's fictional carpentry follow-up, AQ-003's private budget/exception summary and server-side budget projection, and AQ-027's behavior-preserving lint fixes. It also contains curated project memory, regression tests, thirteen recorded migration files and an operator-only saved-candidate reconciliation script absent from the historical Git commit. Those historical support files are not instructions to execute SQL or repairs. No automatic migration occurs at startup. AQ-023 remains design-only: real usage is unavailable, not zero. Existing homepage/resource layout is retained; it is not a new whole-site design.

**Private review does not require public-reader mode or design integration.** Keep three open draft PRs separate: PR1 `968cd3fb94992cadcd659034259902500d63a84a` is the canonical isolated HTML design v0.3; PR2 `c7f4805edb4cdf2dadf53d8d6b3d5a96c8d30b1f` is the preserved alternative; PR3 `f0097a5a3ba664f599148e971aa7bb6bbd4fa669` is the off-by-default route-policy proposal. Their open/draft heads were checked via GitHub read API. Independent PR3 review is parent-supplied evidence, not a base integration. No PR merge is a prerequisite for this private candidate.

## What Joshua can review visually

Twelve inspected PNGs cover 1280×900 desktop and 390×900 mobile: `reader-home`, `resources`, `follow-up`, `dashboard-unknown`, `exception-review`, and `dashboard-unavailable`. The compact HTML gallery pairs desktop/mobile views and labels fixtures. It contains the screenshots, not a replacement application or an interactive redesign. Hashes are in the manifest; binaries stay outside the public repository.

| Try task (on a later approved preview; inspect matching screenshots now) | What it tests / does not prove |
|---|---|
| Find “Put AI to work” from home on desktop and phone. | Navigation/discovery and responsive hierarchy; does not measure actual reader success. |
| Search resources for Newport, try an unmatched term, then reset. | Matching and honest empty/reset behavior; static resource availability is not freshly verified. |
| Open the first “Try this approach” using the keyboard; identify the missing gate detail and prohibited invented promises. | Complete fictional prompt, visible focus and manual-review boundary; no AI output, customer submission or sending occurs. |
| In the private dashboard, explain “Usage unavailable,” the non-resetting cap, and unresolved versus pending work. | Unknown stays unknown; synthetic counts are one unresolved and two pending, not live counts or spending authority. |
| Open assessment review and choose “Needs human review.” | A clearly fictional invalid-evidence record retains no-automatic-retry guidance; opening does not publish. Additional failed-refresh captures show unknown counts after reload. |

Actual built React application and production HTTP server were used, with disposable random Basic authentication. API GETs were intercepted; worker and health database checks disabled; external requests/fonts blocked; fallback fonts rendered. Static resource text is repository content, feed is empty fixture data, and dashboard/review data are synthetic. No credential or private source/customer record appears. All twelve final captures were inspected: readable wrapping, keyboard focus and no horizontal overflow; exercise and budget guidance require vertical mobile scrolling. This is not a screen-reader audit, hosted edge check or proof of benefit.

**Delivery limitation:** the current Library prepared-upload helper failed before creating any file: `hosted apps tools/list request failed: network`. No screenshot/gallery Library ID was returned; no transfer was finalized. The PNGs, gallery, request and failure evidence are retained in the private execution workspace for supported transfer by the parent; local paths are not an owner delivery link. Do not substitute signed/private download URLs or overwrite the design prototype. Re-run only after supported hosted-app transport becomes available; no ambiguous completed write was reported.

The existing **interactive design prototype**, separately verified by Library read, remains `libfile_a86cace2b2b48191b3c61c097b55ecd0`, version `3`, filename `index.html`. It is the first-release v0.3 proposal, not the screenshots or deployed app. Canonical [design brief](https://github.com/joshuawakefield/aquidneckai/blob/968cd3fb94992cadcd659034259902500d63a84a/docs/FIRST-RELEASE-DESIGN.md) and [draft PR1](https://github.com/joshuawakefield/aquidneckai/pull/1) remain unchanged.

## Evidence and smallest remaining staging gates

Current full `cloud-check`: TypeScript, **54 frontend / 65 backend / 39 Python tests**, production build and loopback authentication smoke passed. Full lint: **0 errors / 8 existing warnings** (one effect dependency, seven Fast Refresh export warnings). All **16 continuity tests** passed. The reproducible [browser fixture flow](../../scripts/test-owner-preview.mjs) passed both widths: auth rejection, reader search/reset, keyboard disclosure, unknown budget, exception filter, failed reload, no overflow/storage/API writes/page errors. Browser automation uses an externally installed Playwright module via `AQAI_PLAYWRIGHT_MODULE`, Chromium via `AQAI_CHROMIUM_PATH`, and output via `AQAI_SCREENSHOT_DIR`; no dependency/runtime change was added. Project-memory validation uses exact starting base `7cfda3354c46e92346d55f2b936781b331f03d75`.

Reuse AQ-010's route/data, build, health and backup rows with this narrower private scope:

1. **Minimum read-only hosted evidence:** current deployed commit/image/build ID and time; manual-build/source-ref settings; auth presence/route behavior and HTTPS edge; worker flag and restart/startup behavior; whether staging DB binding shares production (report classification only, never values); current schema/API compatibility; retained previous image/config identity and supported rollback capability. No host binding or hosted administration tool is available in this task; these remain UNKNOWN. Do not request credentials in chat.
2. **Worker gate:** source inspection proves `AQAI_WORKER_ENABLED=true` immediately starts a cycle on process boot. A manual UI deployment can therefore cause collection, paid assessment and narrow automatic publication. “No configuration change” does not mean “no live side effects.” Owner must settle the exact restart plan after read-only inspection; disabling/changing worker configuration is a separate proposed change requiring approval, not silently included here.
3. **Isolation/recovery gate:** verify one staging destination and disposable test fixtures isolated from live records. Do not test editorial writes against an unknown/shared DB. Establish the compatible rollback artifact/config and bounded verification plan. Reuse AQ-002 for any separately authorized schema/backup/restore work; no migration is required by the UI packet itself, and SQL fixtures are not production smoke tests.
4. **Later approval:** only after these observations, request one explicit manual private staging deployment of the exact candidate and reviewed config/worker plan, with identified rollback target and scope of read-only verification. A disposable-write test, backup/restore, migration/repair, worker activation, content publication, PR merge, public-reader enablement and DNS/public launch each remain outside that approval unless expressly included and reviewed. No staging-ready claim until applicable gates pass.

**Recommended next useful task:** parent obtains narrow read-only hosting metadata through an already authorized session, resolving build/worker/isolation/rollback facts into this candidate packet. Then present the exact private deployment decision. Library transport repair is an independent delivery follow-up. Parent owns approvals and successors.
