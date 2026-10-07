# Source-backed connections in the existing proposal

Task ID: AQ-028
Started: 2026-10-06T23:39:00Z
Starting commit: 5292dc108e60e2899cf7125c95b118f2e7564ee4 (actual PR1 edit base)
Status: completed locally; scoped remote closeout verified in the task response

## Request

One bounded G-003 reader-benefit slice: reuse the canonical isolated PR1 prototype, apply AQ-022 verified public evidence, make date/freshness/access uncertainty honest, preserve Understand/Use/Connect and proposal status. Authorized scoped commit/push to existing draft PR1 only. Parent owns successors; no schedule or successor created.

## Changes

- Same `docs/prototypes/first-release/index.html`: two leads from one Chamber organization replace three fictional connection formats. Story and practical exercise remain explicitly illustrative. Public source/registration/inquiry links only; no form, service/API, booking, storage, sending or inference.
- `scripts/test-first-release-prototype.mjs`: deterministic pure state fixtures plus existing jsdom interaction checks. `scripts/check-first-release-browser.mjs`: optional locally supplied Playwright/axe browser harness; no package or application build change.
- Canonical proposed design v0.3, backlog, tracker F09 and state updated. F09 remains open for production and real reader benefit.
- Explicitly fetched base and PR1 refs and checked clean tree/remote refs. The restored main-only refspec left remote-tracking state stale until explicit destination refspecs were used. PR1 start 5292dc1 and base 5d81883 matched the delegation; PR2 c7f4805 is untouched. All remote branches' AQ/D reservations inspected: AQ-028 free, D-030 already assigned; no new D-ID needed. Workspace `.agents`/`.codex` were empty and no repository skills existed; followed documented startup contract.
- Merged current base **into PR1 only**, preserving all base additions and lint repairs. Additive conflicts in decisions, operating mode and state retained both histories; current state timestamp refreshed. No force/reset, PR merge into base or PR2 modification. Runtime paths match base byte-for-byte; inherited base changes are not AQ-028 implementation.

## Decisions and rationale

Rechecked AQ-022 S1/S2 through public web retrieval October 6 around 23:40 UTC: [event source](https://business.newportchamber.com/events/Details/business-during-hours-october-1898297?sourceTypeId=Website) and [program source](https://www.newportchamber.com/chamber-connections/). Claims/check scope and unknown source-update dates remain visible in each card. No participant list retained or attendance/benefit claim made. PPL/FabNewport stay provisional/excluded as in AQ-022; no search expansion or enrollment.

S1's EDT and GMT-05:00 labels conflict. The calendar download was unsupported by the web tool and a single shell read returned 403; no bypass/retry. Display interpretation uses advertised Newport local clock with America/New_York seasonal rules, ignoring the inconsistent fixed offset. [NIST](https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst) explicitly places October 15 within 2026 daylight time; Intl yields 13:00 local at 17:00Z. The card discloses the discrepancy and asks readers to confirm before plans; this is not organizer confirmation. Exact end is exclusive: at 13:00 local the listing is past, without asserting it occurred. Date-only entries may already have ended on their stated day; missing/invalid dates stay unknown. Evidence becomes stale at seven Newport calendar days, a display policy rather than a claim of reliable availability. Future/invalid checks stay unknown. Device clock dependence and no live refresh are explicit.

## Verification

Node 22.23.3: 11 prototype tests plus 16 continuity-rule tests passed. Fixtures cover future, start/end boundary, past, missing/invalid dates, date-only local midnight, summer/winter offsets, stale threshold and unknown/future check dates. jsdom covers repeated search/reset and loading/empty/error/retry, public HTTPS links, no form/remote script/storage and preserved fictional review.

Browser results and final continuity/allowlist checks recorded at closeout below. The first browser harness used a hash URL that naturally focused its target instead of the skip link; changed the test to initial root navigation. It also attempted a hidden review select and raced hash-route focus; corrected the harness to open the disclosure and wait for heading focus first. These were test setup failures, not falsely reported passes. Axe installed only in `/tmp` for review, with writable temporary npm cache after the default cache failed; no application dependency/service added.

Inherited application evidence (not rerun/claimed as new AQ-028 tests): base AQ-027 recorded TypeScript, 54 frontend / 65 backend / 39 Python tests, build/auth smoke and lint 0 errors/8 warnings. Base paths `src`, runtime scripts, configuration, package files and workflows are unchanged by this task relative to 5d81883. Prototype is outside Vite entry/public paths. The sole repository workflow is Project memory, with no deployment job. No live application validation or deployment occurred.

## Next steps

Parent: AQ-010 first-release content/staging/rollback readiness checklist grounded in this proposal and actual feed contract; distinguish gaps and separately authorized release operations. No successor launched. AQ-020 normal and scheduled clean-idle continuity stays demonstrated; AQ-026 crash/quota/report delivery untested; actual model quota unknown. Supabase Free, caps, manual staging and legacy apex remain preserved.

Library target is the existing identity, version 1, privately resolved; writeback attempted after validation, never create a duplicate. Final response supplies exact Git path/head if Library fails. Public repository excludes Library/account identifiers, raw source dumps, secrets, screenshots and temporary review dependencies.

### Final scoped evidence and allowlist

- Chromium passed at 320/390/1280px in a Tokyo viewer timezone with an injected clock: keyboard skip/nav/disclosures, three repeated search/reset cycles, error retry, browser back/reload, preserved review/copy-denial fallback, exact Newport end transition while open, no-JavaScript readable fallback, zero page errors, external requests or browser storage. Nine axe 4.10.3 WCAG A/AA tagged scans reported zero violations (not full accessibility conformance). Desktop, both mobile widths and past/stale mobile screenshots were inspected in private temporary output. Visual review caught and corrected the inherited v0.2/all-illustrative banner to v0.3 with sourced connections; final browser run repeated after that correction.
- `node --test scripts/test-first-release-prototype.mjs scripts/test-project-memory.mjs`: 27/27 passed on retained Node 22.23.3. `node scripts/check-project-memory.mjs --base 5292dc108e60e2899cf7125c95b118f2e7564ee4`: passed, 56 Markdown files. Both new harnesses passed Node syntax checks. `git diff --check`: passed.
- Browser reproduction: set `PLAYWRIGHT_MODULE` to an installed Playwright module and optional `AXE_PATH` to axe.min.js, then run `node scripts/check-first-release-browser.mjs`. `CHROMIUM_PATH` and `REVIEW_OUTPUT` are optional; no repository dependency installation needed.
- Scope allowlist relative to current base: pre-existing PR1 proposal context and historical journals, plus this task's prototype, `scripts/test-first-release-prototype.mjs`, `scripts/check-first-release-browser.mjs`, `docs/FIRST-RELEASE-DESIGN.md`, `docs/BACKLOG.md`, `docs/PROJECT-STATE.md`, `docs/VISITOR-EXPERIENCE-TRACKER.md` and this journal. Conflict reconciliation retains `docs/DECISIONS.md` and `docs/OPERATING-MODE.md`; base-only files are preserved, not rewritten. No application/runtime/package/workflow diff against base, and no new secrets, account IDs, raw data or service enrollment in the public allowlist.
- Library same-identity replacement succeeded; the final banner correction is saved with version guarding. Version metadata applied locally through the Library skill helper. No new Library artifact created. Final exact version and Git/CI evidence are reported after publication; no recursive status-only commit.
