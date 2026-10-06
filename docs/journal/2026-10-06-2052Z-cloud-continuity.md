# Portable context and cloud handoff

Task ID: AQ-001
Started: 2026-10-06T20:35:00Z (approximate)
Starting commit: b34b14e11e2fb7403afddef1fc4004a078620449
Status: in progress

## Request

Make project intent, scope, stack, decisions/reasons, unresolved work and useful interaction outcomes available on GitHub so a Dot or any future model can continue without this computer. Adopt date-first reports and a repeatable context/verification/handoff loop. Prepare Codex Cloud access.

## Changes

Audited remote development branch: no project docs/AGENTS, migrations or substantive regression tests were present. Built a curated handoff in a clean clone. Added canonical charter, architecture, decision register, backlog, workflow, cloud recipe and model entry point. Moved dated report content to ISO date-first names, retaining compatibility pointers. Replaced contradictory historical operation guides with current references and preserved reviewed chronology in a dated report.

Added continuity checker, fixtures and GitHub workflow; reviewed tests/schema files and added a no-secret cloud setup/check runner. Raw exports, credentials, personal transcript and machine-specific paths are excluded. SQL is portable evidence, not a validated fresh-database bootstrap.

## Decisions and rationale

D-016/D-017: GitHub is the shared project record; credentials and runtime data remain separate. Canonical state is short and current; dated history supplies evidence without overwriting present intent. Models follow read/work/verify/write/sync; checks detect missing context updates but cannot certify prose truth. Existing runtime, billing, manual deployment and apex boundaries remain.

## Verification

Clean checkout at the recorded baseline installed 490 locked packages with lifecycle scripts disabled. TypeScript, 38 frontend tests, 61 backend tests, 39 Python tests, production build and loopback auth/framing/path smoke passed. No database, inference, collection or deployment was run. Cloud guard tests reject real .env files and external fetch/TCP, and strip inherited service credentials. Continuity rule suite: 16 passing tests. SQL files reviewed offline only.

Remote upload and account-side cloud environment preparation remain in progress; completion evidence will be appended before closeout.

## Next steps

Verify shared files/CI remotely; configure/publish a secret-free cloud development environment and run AQ-001 from repository context. Then choose one scoped ready backlog task. Do not declare AQ-001 complete merely because documents exist.

### 21:02 UTC checkpoint

All 86 reviewed files are on GitHub in commit 76124489465df5eb06b805103f3c0fd537e78ee0; remote blob hashes match. Project memory workflow run 37530484278 passed. Cloud setup independently recovered the correct branch/context and passed structure plus 16 continuity tests. Package install exposed cloud proxy transport being stripped by the new setup runner; the package-install-only fix passed two regression tests and is ready for the cloud retry. No production keys were transferred. Environment remains private and unpublished pending verification.

