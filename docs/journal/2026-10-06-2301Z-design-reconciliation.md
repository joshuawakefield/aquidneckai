# Reconcile the competing first-release proposals

Task ID: AQ-025
Started: 2026-10-06T23:01Z (checkpoint, minute precision)
Starting commit: eb5390d1f0f31040d8f0dbaaac25be67cb8350a6
Status: completed locally — selected proposal and checks passed; remote/CI closeout supplied in task result

## Request

One bounded reconciliation of the two completed AQ-024 draft proposals. Owner delegates product judgment and authorizes scoped tested branch commits/pushes and draft metadata updates, never merge/closure/live changes. Parent reports no other active writer and owns all successors; no successor or schedule is launched. Existing cost, private-environment/public-repository and production boundaries remain.

## Changes

Explicit fetch verified development 15362f57f8972eb30960b876bd436e024fa1b972 and both supplied heads: PR1 eb5390d1f0f31040d8f0dbaaac25be67cb8350a6, PR2 c7f4805edb4cdf2dadf53d8d6b3d5a96c8d30b1f. GitHub connector confirmed both open/draft/unmerged, same base. Shell gh GraphQL returned Forbidden; use the successful connected GitHub route instead. Restored checkout was clean at b9e49bd on work. Initial tracking-branch switch failed with main-only fetch configuration after updating index/worktree; a no-tracking switch completed safely to the exact PR1 head with a clean tree, without reset or overwrite. Read AGENTS/index/canonical context, both briefs/journals/prototype implementations and PR2 tests.

Maintain one FIRST-RELEASE-DESIGN v0.2 on PR1. Add a handwritten deliberately incorrect Friday visit promise and native reveal-review disclosure to its existing guide; distinguish source publication/update and actual check scope/date in the story anatomy. Update state, backlog, decision collision mapping and visitor tracker. No PR2 implementation or duplicate canonical document is copied; all original commits and journals remain recoverable.

## Decisions and rationale

D-029 selects PR1 for its comprehensive release specification, portable dependency-free preview, no-JavaScript reading, native controls and explicit empty/loading/unavailable states. PR2 improves the learning task by making readers reject an invented claim and improves evidence dates; adapt those ideas into the selected implementation rather than combining two UX stacks. PR2's public FabNewport route is a useful AQ-022 lead, not evidence of suitable participation; retain fictional connection formats here.

Both drafts independently allocated AQ-024 and D-027 from the same base. Preserve historical branch-qualified identities; AQ-025 is this new task, PR1 D-027 is the owner mandate, D-028 the design hypothesis, and D-029 this resolution. Recommend PR2 supersession when the owner chooses PR disposition; keep both draft PRs open and unmerged. No shared-base checkpoint is necessary for this bounded proposal-only change; parent receives exact links and must reconcile before later work.

## Verification

Inherited PR1 journal: desktop/390/320px navigation, keyboard/focus, copy/fallback, filter/content states, no requests/storage/errors and no-JavaScript checks; 16 continuity tests, Project memory CI 37543677137 reported passed by parent. Inherited PR2 journal: 53 existing frontend + 3 prototype tests, 65 backend/39 Python, TypeScript, app/standalone builds, auth smoke, scoped lint, 16 continuity, desktop/390/320px flows and eight axe scans. Full lint retained 3 existing errors/8 warnings. These results were inspected, not represented as rerun on this HTML.

Current tests and final reviewed allowlist will be recorded below. Node 22.23.3/Python 3.12.14, temporary loopback Chromium/Playwright/axe tooling outside Git. Application code and dependencies are unchanged, so no new application baseline is claimed or required.

Existing Library preview identity was resolved at version 0; supported materialization returned a transfer, but its required helper failed with `library file transfer failed: download failed`. No replacement, duplicate upload or renewed helper-discovery retry was attempted. Prior Library preview remains v0 and must not be presented as the consolidated preview. Local screenshots and canonical Git HTML are the current artifacts until supported Library delivery works; keep all Library identifiers out of this public repository.

## Next steps

Complete local checks, fetch all three explicit refs again, review the seven-file allowlist, push only aqai-first-release-design and update both open draft descriptions. Verify exact final remote commit and CI; record those results in the returned closeout. Parent next selects AQ-022 independent connection verification. No integration, final design approval, deployment, live DB/inference/worker, source enrollment, customer contact or schedule occurred.


### Final local checkpoint — 2026-10-06

PASS on Node 22.23.3/Python 3.12.14: temporary Playwright harness served only the selected HTML on loopback. At 1280/390/320px, four route views, heading/skip-link focus, keyboard and repeated disclosure, invented-promise review/corrected example, copy success/forced denial with selected-text fallback, connection search/no-match/reset, empty/loading/unavailable/retry, reload/back/unknown route and no horizontal overflow passed. All recorded requests were loopback documents only, with zero page errors and empty local/session storage. JavaScript-disabled reading of all four pages and the new review disclosure passed. Eight axe scans (four views at 1280/390, including expanded practice) reported zero WCAG 2 A/AA, 2.1 AA and 2.2 AA tagged violations. Desktop home/connections and mobile guide/story captures were visually inspected. This is automated/local evidence, not full conformance, screen-reader/mobile-hardware or real reader validation.

All 16 continuity regression tests passed. `node scripts/check-project-memory.mjs --base eb5390d1f0f31040d8f0dbaaac25be67cb8350a6` passed for 48 Markdown files; `git diff --check` passed. Final documentation edits are checked again before commit; no further prototype edits follow these browser results.

Reviewed explicit seven-file allowlist: docs/BACKLOG.md, docs/DECISIONS.md, docs/FIRST-RELEASE-DESIGN.md, docs/PROJECT-STATE.md, docs/VISITOR-EXPERIENCE-TRACKER.md, docs/prototypes/first-release/index.html and this journal. No app/dependency/workflow/schema/private-data files. Temporary tooling, screenshots and Library metadata stay outside Git. Sole Actions workflow is continuity-only; existing manual hosting/deployment boundary unchanged. Fresh-ref comparison and exact remote/CI verification accompany the final task result, not an invented self-referential commit hash.
