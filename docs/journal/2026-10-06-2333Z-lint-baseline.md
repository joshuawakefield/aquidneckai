# Full-project lint baseline repair

Task ID: AQ-027
Started: 2026-10-06T23:33Z
Starting commit: b8780f0ccf93d84b7c4f095264a5ca283a86ac47
Status: completed locally; remote/CI verification supplied in final task response

## Request

Resolve existing full-project lint errors with minimal behavior-preserving changes under the bounded continuous-development mandate. Preserve draft designs, reserved IDs and all live/cost boundaries. Parent owns successors.

## Initial evidence

Clean restored work branch b9e49bd was switched to existing aqai-local-index and fast-forwarded after an explicit development-ref fetch to the starting SHA; ls-remote matched. No unrelated edits. Selected retained Node 22.23.3 over host Node 24.19.0; Python 3.12.14. Read AGENTS, index, canonical context, operating mode/environment register and documented startup contract; no standalone Start SKILL.md present.

Full `npm run lint` exited 1: command.tsx:24 and textarea.tsx:5 empty-object-type errors; tailwind.config.ts:109 no-require-imports error. Eight warnings: EditorialReview.tsx:46 missing hydrate effect dependency; Fast Refresh mixed exports in ui/badge.tsx:29, button.tsx:47, form.tsx:129, navigation-menu.tsx:111, sidebar.tsx:636, sonner.tsx:27 and toggle.tsx:37. This reproduces rather than assumes the previous counts.

## Decisions and rationale

Use equivalent prop type aliases (preserving TextareaProps export) and ESM import of the same Tailwind animation plugin. No interface augmentation consumers exist in this repository. Test generated animation utilities and custom accordion CSS; run true full lint, TypeScript, all frontend tests, offline backend/Python/build/auth baseline and continuity against the starting SHA. Leave unrelated hook/export warnings unchanged to avoid changing effect lifecycle or reorganizing component APIs.

## Closeout

Only Project memory GitHub workflow exists; inspected push steps run continuity checks, not deployment. Shell GitHub API is Forbidden; use the existing connected GitHub reader for PR/CI verification, without new access.


## Changes

All three errors removed with the intended narrow edits. Public prop names/accepted props and rendered component code remain unchanged; no repository declaration-merging consumer exists. The Tailwind test runs real PostCSS/Tailwind compilation, asserting enter/exit animation names, fade opacity variables and generated keyframes including the custom accordion utility. Added it to the explicit offline frontend list so subsequent cloud checks retain coverage. No new dependencies, lint suppression or architecture change. No new durable decision is needed; existing D-020/D-024 govern this small direct tested fix.

Reviewed changed-file allowlist (eight files):
- `src/components/ui/command.tsx`
- `src/components/ui/textarea.tsx`
- `tailwind.config.ts`
- `src/test/tailwind-config.test.ts`
- `scripts/cloud-check.mjs`
- `docs/BACKLOG.md`
- `docs/PROJECT-STATE.md`
- `docs/journal/2026-10-06-2333Z-lint-baseline.md`

## Verification

Verification on Node 22.23.3/Python 3.12.14:
- Focused `vitest run src/test/tailwind-config.test.ts`: 1/1 passed.
- Full `npm run lint`: exit 0, 0 errors / 8 warnings, exact unchanged warning list above. No scoped-only substitution.
- `npm test`: all 54 tests in 11 files passed.
- `node scripts/cloud-check.mjs`: passed TypeScript, 54 frontend, 65 backend, Python 7 + 13 + 10 + 9 = 39 tests, production frontend build and loopback health/authentication/SPA/secret-source isolation smoke with worker disabled. Offline guard and sanitized environment used; no live endpoint or production snapshot.
- `node --test scripts/test-project-memory.mjs`: 16/16 passed.
- Final `node scripts/check-project-memory.mjs --base b8780f0ccf93d84b7c4f095264a5ca283a86ac47` and `git diff --check`: passed before commit. First memory check caught missing standard journal headings; corrected to the repository template and reran successfully.

Connected GitHub reads confirmed PR1 head 5292dc108e60e2899cf7125c95b118f2e7564ee4 and PR2 head c7f4805edb4cdf2dadf53d8d6b3d5a96c8d30b1f still open, draft and unmerged; no PR changes. Final fresh development fetch must reconcile before ordinary non-force push; final exact SHA/CI returned to parent, avoiding self-referential commits. Generated dist/logs are excluded; no secrets, account identifiers or raw data in the allowlist.

## Next steps

Recommend one isolated, non-public AQ-022-backed connection card, with parent allocating a fresh unused ID. Source/check dates, unknown/expired states and truthful next steps make the research useful while avoiding unapproved design integration or publication. AQ-024/AQ-025 reserved; AQ-026 remains untested exceptional recovery/report evidence, AQ-020 only normal/clean-idle continuation, AQ-023 design only. No deployment, production DB, SQL, migrations, workers, inference, source enrollment, content publication, outreach, purchase, expanded access, scheduler or router action. Parent launches successors; exact model/quota unavailable. No implementation blocker remains; eight warnings are explicitly outside this minimal error repair.
