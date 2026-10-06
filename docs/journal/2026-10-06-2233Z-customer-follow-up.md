# Fictional customer-follow-up practice

Task ID: AQ-021
Started: 2026-10-06T22:33:00Z (minute-level observation)
Starting commit: 5c38f245f9552a30ac19ef96234bccc53e2b21fa
Status: in progress — implementation and local verification complete; remote closeout pending

## Request

Implement one bounded trades-owner exercise under approved scoped tested commit/push authority; no deployment or live service work. Parent owns successors. Acceptance: fictional facts, plain language, factual-only prompt, explicit manual review/sending, three manageable examples, preserved navigation/resources/feed, no customer collection or new inference.

## Changes

ReaderHome replaces the first generic announcement card with a fictional carpentry gate-repair estimate request. Facts are inside the prompt so copying it leaves no missing source material. A visible trades-owner scenario leads to native expandable instructions. Practice prohibits real customer details; prompt asks for a missing detail and separates unknowns. Reader checks every claim, edits/rejects and decides on manual sending; comparison includes drafting and checking time and permits no benefit. Two other examples, eight resources, feed and navigation remain unchanged.

Three new reader tests cover content/discoverability, failure/retry and repeated navigation, and interrupted unmount/return without storage. State, backlog, F08 tracker, decision D-025 and continuity capability checkpoints are updated. F08 awaits authorized staging verification; no user savings or deployment claimed.

## Decisions and rationale

D-025 follows AQ-011/G-001/G-002 with a familiar small carpentry task, not a product integration. Retaining native details and replacing one card avoids expanding choice or adding state/network/storage. Small scoped code change uses the approved direct development-branch commit path; no substantial architecture or review-dependent behavior requires a draft PR.

Restoration was clean at b9e49bd on work. Explicit ref fetch found 5c38f24; an existing development branch prevented branch creation, so it was switched and fast-forwarded without reset or lost changes. ls-remote matched the actual starting SHA. Retained toolchain is Node 22.23.3, Python 3.12.14. Repository .agents/skills is absent and /workspace/.agents is empty; used canonical startup docs. Read AGENTS, docs index/state/charter/architecture/decisions/backlog/workflow/operating mode/environment register/DOT-START/CLOUD-HANDOFF, AQ-011 report and visitor tracker. No skill expanded authority.

Parent supplied verified AQ-001 final SHA and passing [CI 37541004642](https://github.com/joshuawakefield/aquidneckai/actions/runs/37541004642), terminal notification and no-overlap evidence. AQ-021 is an actual completion-triggered successor. This demonstrates first restoration/verified closeout plus successor start only. Daily reporting around 19:00 Eastern/Sunday synthesis is parent-reported enabled, not delivered. Quota pause/resume and future uninterrupted execution remain untested. AQ-020 stays blocked for these remaining criteria. Actual model/quota unknown; platform default, no override/router/daemon/schedule.

## Verification

- Node 22.23.3 `node node_modules/vitest/vitest.mjs run src/pages/ReaderHome.test.tsx`: 8/8 passed.
- `node scripts/cloud-check.mjs`: TypeScript, 41 frontend, 63 backend, 39 Python tests, production build and loopback auth/path isolation smoke passed. Offline guard; no credentials, database, source collection, inference, worker, migration or deployment.
- `node node_modules/eslint/bin/eslint.js src/pages/ReaderHome.tsx src/pages/ReaderHome.test.tsx`: passed.
- `node --test scripts/test-project-memory.mjs`: 16/16 passed.
- Local Vite/Chromium with fixture feed at 1280x900 and 390x900: keyboard Enter expansion, three cards/no form controls, resource search/reset, repeated practice/resource navigation, collapse/reopen, reload reset, no horizontal overflow, empty local/session storage. Exactly one existing `/api/aqai/published` request per visit; no new API/inference/sending request. External URLs blocked (existing Google font CSS); expanded-card screenshots visually inspected at both widths. Provider-font rendering, real-device and staging/public checks not run. Temporary browser script/screenshots/logs stay outside Git.
- Publishing workflow inspected: only Project memory push/PR continuity checks, no deployment step. Recorded hosting auto-builds remain disabled; no hosting settings changed or live reverified.
- Required project-memory validation against the full actual starting SHA and final pre-publish fetch/remote/CI verification follow below.

## Next steps

Finish remote/CI closeout, then parent may select AQ-003: local budget/exception visibility including stale/unavailable usage, no new inference or cap change. AQ-002 offline migration inventory is an alternative. Child launches neither. No live authorization is inferred; Supabase Free, inference caps/recovery, manual staging and Netlify apex/DNS stay unchanged. Public GitHub receives only reviewed code/tests/context; no credentials, account IDs or private data.
