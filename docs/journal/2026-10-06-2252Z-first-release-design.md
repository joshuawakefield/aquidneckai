# First-release product design and ownership

Task ID: AQ-024
Started: 2026-10-06T22:47Z (minute precision)
Starting commit: 15362f57f8972eb30960b876bd436e024fa1b972
Status: design/specification and isolated prototype implemented; draft PR/verification pending

## Request

Owner explicitly adopted product/engineering ownership: maintain coherent first-release design; choose work by reader benefit, owner effort, evidence and dependencies; research/prototype/implement/test/share complete changes autonomously; revise the queue when evidence warrants; one active child with reconciled successors; escalate consequential uncertainty and actions outside current authority. Existing production, budget, deployment, credentials, outreach and no-auto-merge limits remain.

## Changes

Fresh explicit development-ref fetch recovered AQ-021 successor work and AQ-003's new implementation commit. Main checkout was clean; created an isolated worktree/branch without resetting or overwriting existing work. AQ-023 was already allocated to usage-snapshot design, so assigned AQ-024 to the first-release design. Separate cloud-task status tools are unavailable in this chat; no additional child or direct shared-development writer is launched. An isolated draft PR preserves the existing coordinator's integration point.

Added FIRST-RELEASE-DESIGN version 0.1 with product thesis, first-reader evidence, Understand/Use/Connect journeys, page anatomy, source/content requirements, visual tokens, current implementation gaps, prototype review paths and software/content/usefulness/readiness gates. Reordered selection guidance with reasons; existing IDs and deferred dependencies preserved. Recorded the exact owner mandate, D-027/D-028, read-order/workflow and current startup direction to prevent replay of completed AQ-001/AQ-021.

Built a dependency-free HTML/CSS/JavaScript prototype outside the app/public tree. Four navigable views, an AQ-021-derived fictional exercise and copy/manual fallback, example story evidence anatomy, fictional connection filtering/detail and empty/loading/unavailable states. No live claims, inference, storage, forms, sending, customer data, external assets or API. No production application, schema, package, workflow or deployment files changed.

## Decisions and rationale

The owner approved autonomous outcome-led progress; agent-selected visual design remains a hypothesis. AQ-021 was a tangible first example, not a final design or validated savings. Define the whole release before accumulating unrelated features; preserve practical first-reader focus and wider charter scope. Real connection evidence remains AQ-022; prototype samples count as zero verified connections/stories. A proposed five-reader formative study and four-of-five task-discovery iteration trigger are design proposals, not actual sessions or population claims; outreach is unrun.

The main branch is legacy and is not a target. Substantial design work uses a draft PR to aqai-local-index with no automatic merge. Current task/model/remaining quota and separate coordinator status are not exposed; platform default, no paid routing, no claim of exclusive background execution. Independent design proceeds safely on the isolated branch; integration/successors require coordinator reconciliation.

## Verification

Research: directly retrieved the W3C WCAG 2.2 quick reference and Page Structure Tutorial on October 6; linked the primary sources in the release specification. Used them for semantic/focus/reflow checklist, not a full conformance claim.

PASS: temporary Playwright/Chromium harness served the prototype on loopback and checked 1280px, 390px and 320px. Home → guide → story → connections navigation, route heading focus, skip link, hash reload/back/unknown-route recovery, prompt copy and forced manual-copy fallback, checked-example disclosure, search match/no-match/reset, empty/loading/error/retry states and no horizontal overflow passed. All browser requests were document-only loopback; no page errors and empty local/session storage at each width. JavaScript-disabled fallback exposed all four readable concept pages with anchor navigation. Server/browser closed in finally; no persistent daemon. Screenshots for home/guide/connect at all three widths stayed in temporary task artifacts. Desktop/mobile home inspected; additional screenshot review follows.

No full application baseline rerun is needed for this isolated documentation/prototype change; it cannot exercise production routes. Continuity/document checks against the starting SHA and final changed-file review will follow. Application regression evidence belongs to AQ-003's own journal, not this task.

UNRUN: production build/runtime behavior changes, live sources/DB/inference, SQL, migrations, deployment, DNS, real reader sessions, recruitment/outreach, quota/billing inspection, separate cloud-task status and report delivery. Existing app/node dependencies remain untouched.

## Next steps

Review prototype and scoped changed-file allowlist; run meaningful browser/document checks. Freshly fetch before publishing, reconcile safe upstream changes without overwriting another task. Share aqai-first-release-design and a draft PR targeted to aqai-local-index; verify exact remote head and Project memory PR CI. Leave AQ-024 integration status explicit. Coordinator reads this design and AQ-003 terminal outcome before selecting AQ-022/one bounded reader implementation; no fixed unrelated feature march or invented successor execution.

### Local verification checkpoint — 2026-10-06 22:55 UTC

Final browser checks passed after replacing the missing-font diagonal arrow with a portable right arrow and increasing disclosure target height. Visually inspected desktop/mobile home, mobile guide and desktop connection screenshots. Final browser report: all three widths passed, document-only loopback requests, zero page errors, empty browser storage, no-JavaScript and denied-clipboard fallbacks passed. Prototype was also saved to Library for the owner; no private Library identity is included in Git.

All 16 continuity-rule tests passed. Project-memory validation passed for 47 Markdown files against starting commit 15362f57f8972eb30960b876bd436e024fa1b972; git diff --check passed. Fresh upstream fetch still matched that starting commit. Reviewed allowlist: docs/AGENT-WORKFLOW.md, docs/BACKLOG.md, docs/DECISIONS.md, docs/DOT-START.md, docs/OPERATING-MODE.md, docs/PROJECT-STATE.md, docs/README.md, docs/VISITOR-EXPERIENCE-TRACKER.md, docs/FIRST-RELEASE-DESIGN.md, docs/prototypes/first-release/index.html and this journal. No application/dependency/schema/workflow/private-data changes. Publish only this isolated branch and draft PR, preserving shared development.
