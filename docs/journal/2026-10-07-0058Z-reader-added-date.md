# AQ-034 — truthful reader addition-date label

Date: 2026-10-07 00:58 UTC. Starting commit: `e1c99b778cac0bc051e63d6a776a87ad981b5d02` on `aqai-local-index`.

## Request

Execute one bounded reader-trust correction under the existing development mandate: change the misleading news date prefix to Added to AquidneckAI where `published_at` represents application addition/approval, with regressions and responsive/accessibility verification. Small tested commit/push is authorized; parent owns successors. Preserve event/source dates, payload/schema fields, ordering/selection, caps and manual deployment. No runtime provenance integration, live services, inference, SQL/migrations, worker, source enrollment, publication, deployment, DNS, purchases, permissions, outreach or scheduling.

## Startup and evidence

Restored clean `work` at b9e49bd; explicitly fetched `refs/heads/aqai-local-index:refs/remotes/origin/aqai-local-index`, switched the existing development branch and fast-forwarded. Verified exact starting SHA against `git ls-remote`. A branch-only fetch had populated FETCH_HEAD without refreshing the main-only tracking ref; explicit refspec resolved this before edits. Read AGENTS/index/current state/charter/decisions/backlog/workflow, operating/environment guidance, architecture, cloud handoff, visitor tracker and AQ-032 contract/journal. Inspected available skill catalogs and workspace skill locations: no relevant repository/Start skill is available; artifact/Sites workflows do not apply to this existing repository change. Used retained Node 22.23.3 and Python 3.12.14, platform default model; actual model/quota unknown.

Checked IDs in development and freshly fetched PR1/2/3 heads. AQ-034 was unused; AQ-033 remains discovery evaluation. Connected GitHub read confirms all three proposals open/draft; heads are `031bb208068efbe74787eb20cef36950e85660de`, `c7f4805edb4cdf2dadf53d8d6b3d5a96c8d30b1f`, `f0097a5a3ba664f599148e971aa7bb6bbd4fa669`. Shell GitHub API is Forbidden as previously documented; native Git and connected read tools work without access expansion.

## Decisions and rationale

Evidence: editorial approval SQL inserts `now()` and overwrites `published_at` on reapproval; automatic calendar publisher uses application publication time. Neither establishes original source publication or first-ever addition. AQ-032 recommends this concise label, with latest-approval semantics if a future detail view needs them.

## Changes

News cards now say **Added to AquidneckAI** and take their displayed date only from existing `published_at`. Missing/invalid values say **Date unknown**; they cannot borrow `starts_at` or fixture source publication. Event/past-event rendering retains its existing start-date and fallback behavior. No genuine source-publication label exists on these cards. Existing publication-status loading/error/empty wording remains accurate and does not label a date. No separate date tooltip or screen-reader override existed; normal visible text is exposed accessibly.

Added card `min-width:0` and `overflow-wrap:anywhere` so text can wrap without grid overflow. No fixed height, truncation or nowrap added. Eleven new regression cases cover distinct application/source/event dates, Rhode Island timezone boundary, absent/empty/malformed/impossible news dates, and preserved event date-only/instant/invalid/missing behavior. Existing past-event regression remains intact. No API type, source metadata, date utility, runtime normalizer import, sorting/window, selection rule or schema change.

Milestone: 24 focused UI/date tests passed, then full offline baseline and fixture browser measurements passed. Desktop/mobile/enlarged-text screenshots were inspected before closeout.

## Verification

- Focused: `node node_modules/vitest/vitest.mjs run src/pages/ReaderHome.test.tsx src/lib/date-format.test.ts src/lib/event-time.test.ts` — 24/24 passed.
- `node scripts/cloud-check.mjs` — TypeScript; 65 frontend / 78 backend / 39 Python tests; production build; loopback authentication/path smoke all passed. Network guard active; no service credentials or worker used.
- Full ESLint via `node node_modules/eslint/bin/eslint.js .` — exit 0, zero errors/eight unchanged warnings. `node --test scripts/test-project-memory.mjs` — 16/16 passed.
- Local Chromium/Playwright, synthetic intercepted feed only: 1280/768/390/320px, full news/unknown/event accessible text, keyboard link focus and no page overflow/metadata clipping. At 320px, metadata enlarged from 12px to 24px wraps to two lines without clipping. External fonts blocked. This is accessibility-tree/keyboard inspection, not a hardware screen-reader audit or full WCAG certification.
- Private temporary evidence: `/tmp/aq034-browser.cjs`, `/tmp/aq034-browser.json`, `/tmp/aq034-{1280,768,390,320}.png`, `/tmp/aq034-320-large-text.png`; check logs `/tmp/aq034-{cloud-check,lint,continuity}.log`. These local fixture files are not public Git artifacts or delivered owner-preview files.
- Final memory check uses actual starting SHA: `node scripts/check-project-memory.mjs --base e1c99b778cac0bc051e63d6a776a87ad981b5d02`; passed after aligning journal headings with the required template (60 Markdown documents). `git diff --check` passed; seven-file allowlist reviewed before commit. Remote SHA/CI supplied to parent after push, without a recursive status-only commit.

## Reviewed changed-file allowlist

- `src/pages/ReaderHome.tsx`
- `src/pages/ReaderHome.test.tsx`
- `src/pages/reader-home.css`
- `docs/PROJECT-STATE.md`
- `docs/BACKLOG.md`
- `docs/VISITOR-EXPERIENCE-TRACKER.md`
- `docs/journal/2026-10-07-0058Z-reader-added-date.md`

Only scoped source/tests and public-safe project context. Fixture story/URL/date values are explicitly fictional. No secrets, environment files, cookies, customer data, account identifiers, raw exports or screenshots staged. Fresh development-ref reconciliation required before commit/push; no force/reset or draft merge.

## Next steps

Implementation and local validation complete; staging/public release and real-reader benefit remain unverified. Recommend parent launch AQ-033 bounded offline technology-scope/source-candidate evaluation using synthetic examples and explicit access/rights/unknown states, deduplication and request/text/cadence/cost ceilings. Discovery, source verification, recurring enrollment and publication stay separate. No live discovery or runtime selection-policy change follows from this label fix. PR1/2/3 remain draft/unmerged; no successor/schedule launched. Supabase Free, current caps, manual staging and legacy apex preserved.
