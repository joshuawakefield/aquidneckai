# AQ-038 — About and technical transparency

Date: 2026-10-07 UTC. Starting PR1 head: 7504e070bd7118e313205344276fa71ccc816ace; base: 136f63bbbeaf344b6ffefbc529c0d12c0dcae329. PR1 was open, draft and mergeable at task start; PR2/PR3 remained separate draft proposals. The dot workspace contained a partial, dirty AQ-036 snapshot without a remote, so implementation used the exact PR1 prototype, test and document files fetched from its verified branch. No unrelated snapshot changes were overwritten.

## Request

The owner asked for an obvious explanation that AquidneckAI is autonomous and evolving; what model it uses and other technical detail; and a first-person account of the owner's programming history and Newport Fifth Ward transplant/local identity. AQ-038 extends the existing PR1 prototype in place instead of creating another design. The public-facing biography stays within the facts authorized in this request, names only the neighborhood, and does not claim a degree.

## Decisions and rationale

- Added an About navigation link, home-page entry point and responsive prototype route.
- Added a compact first-person programming timeline and a clear Newport/local statement.
- Separated AI-agent-assisted development, model-assisted candidate assessment, human editorial review and manual deployment.
- Disclosed the documented runtime model/stack as last noted in project records October 6, 2026; developer model selection is explicitly a separate, variable layer. The preview states it is static and not a live production/model connection.
- Updated the same PR1 first-release brief, backlog, decision log, visitor tracker and current-state note. No duplicate prototype was created.

## Verification

The targeted PR1 test script includes route, navigation, repository-model-date, pipeline-gate and biography assertions. Completed changes are tested and saved at reviewable checkpoints; interrupted work is reconciled before continuing. Local syntax checks passed for the test file and extracted inline prototype JavaScript. The first exact-head workflow, run 37621639180 on 8cd62f57, failed: one biography assertion still expected the earlier “did not earn” wording after the copy was revised to “did not complete,” and project-memory validation required four canonical journal headings. Both are corrected in this follow-up. Browser screenshot/interaction testing was attempted with the workspace Chromium/Playwright, but browser launch is blocked by the sandbox (socket() failed: Operation not permitted). The supported cloud-browser route also rejected the local data URL because only HTTP/HTTPS schemes are allowed. No local screenshot or visual pass is claimed; responsive CSS and markup receive static checks only. The workspace does not have node_modules/jsdom, so the jsdom suite was not run locally. The corrected exact-head CI run remains the required runtime test evidence. No current live runtime, provider, source, reader, staging, production, database or deployment check occurred.

## Next steps

Run the targeted prototype test and the repository's required offline checks on the new exact PR1 head; review the code diff and CI outcome before presenting the draft for owner feedback. Keep it isolated and undeployed until separately selected for application integration and release.
