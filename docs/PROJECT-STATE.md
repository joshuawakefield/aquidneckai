# AquidneckAI current checkpoint

Updated: 2026-10-06T21:51Z. Read the [index](README.md) and [workflow](AGENT-WORKFLOW.md); the [historical record](reports/2026-10-06-project-history-through-handoff.md) explains older milestones. Earlier statements do not override this checkpoint.

## Current result

The replacement reader and authenticated editorial dashboard are deployed to [staging.aquidneckai.com](https://staging.aquidneckai.com/), application commit `b34b14e11e2fb7403afddef1fc4004a078620449`, verified October 6 around 20:27 UTC. The existing public apex remains on Netlify. Automatic hosting builds are off.

The requested Naval War College AI wargaming article was approved through the dashboard at 20:20:53 UTC on October 6 and appears once in the published feed. Earlier rejection/note actions remain versioned history. The approval UI now shows missing-field feedback beside the controls, saves draft reader fields and restores them after reload. Sixteen focused UI tests, five API tests, TypeScript/build and live feedback checks passed.

## Dated runtime snapshot

- 269 registered endpoints; 208 scheduled, 61 awaiting setup; about 274 checks/day. 34/39 municipalities scheduled; see the [source report](reports/2026-10-05-recurring-sources.md).
- At the October 6 verification, no pending/incomplete assessments remained; 176 candidates and nine genuine editorial exceptions awaited judgment. Counts can change with ordinary collection.
- Scituate government and RTX Portsmouth careers returned 403. Liveness/public feed returned 200; health reported degraded/503. Preserve these failures visibly rather than disabling sources.
- Worker starts at boot, then five minutes after each serial cycle completes. Collection claims up to 16 due sources with concurrency four; assessment considers up to 80 new/changed observations.
- Runtime model: Gemini 2.5 Flash Lite through OpenRouter. Astra/Sol/Luna engineering/editorial routing is desired, not implemented.
- Hosting is $6.48/month; Supabase Free. OpenRouter usage at October 6 20:19 UTC: $0.143272701 lifetime, $0.103097016 month-to-date, $0.856727299 left under a $1 non-resetting key cap. See [cost scope](reports/2026-10-06-operating-costs.md); this is not a complete future invoice.

## Shared continuity record

The owner requested shared, model-readable project knowledge and cloud/Dot readiness. Before this task, the remote development branch contained runtime code but no project docs/AGENTS, migrations, or substantive regression suite. A clean clone was used to assemble and validate the curated handoff.

The new record contains charter, architecture, decision register, backlog, dated reports/journal, model startup/closeout instructions and automated continuity checks. GitHub commit 76124489465df5eb06b805103f3c0fd537e78ee0 now contains all 86 reviewed handoff files; remote Git blob hashes matched every file. GitHub Project memory run 37530484278 passed. A clean checkout passed TypeScript, 38 frontend / 61 backend / 39 Python tests, build and loopback auth smoke. Sixteen continuity tests passed. No live credentials or service calls were used.

## Boundaries and next work

- Supabase stays Free. Keep existing inference limits and paid-call recovery safeguards.
- Manual staging deployments only; no apex/DNS cutover, plan purchase or source-discovery loop.
- Migration history is unreconciled. No blanket database push. Runtime data is in Supabase; repository context is not a database backup.
- General articles require human editorial approval; strict automatic official-calendar publication is separate.
- Source CRUD, continuing arcs, broader model routing and sponsorship are still backlog work.
- Immediate task for the first delegated cloud run: AQ-001, verify restoration into a new task and complete its state/journal/remote loop. Environment setup and Dot discovery/read access are already verified; do not recreate the environment. Then choose one bounded ready item in [BACKLOG](BACKLOG.md), such as migration inventory (AQ-002), budget/exception visibility (AQ-003), or current upstream failures (AQ-004).


Codex Cloud environment AquidneckAI development was published and UI-verified around 21:09 UTC, with Only me visibility, Package managers network preset, no network secrets and no service environment variables. The independent Linux cloud baseline passed TypeScript, 38 frontend / 63 backend / 39 Python tests, production build, loopback auth smoke, documentation checks and 16 continuity tests. The final saved install script passed at b9e49bd52a712e3d49bbdaa342293caab9c592ee. Its Start skill reads the current repository and requires verification plus state/journal/remote updates.

The owner's Dot independently confirmed discovery of the published environment, the matching repository revision, and reading AGENTS/index plus all seven named context documents. It saved the repository/branch/read order and operating constraints. It correctly flagged the then-stale publication status, corrected in this closeout. No fresh coding task or recurring schedule was launched; restoration into a separate task remains AQ-001's final check.

## Ongoing-development interview

2026-10-06: the initial AQ-019 interview is recorded. The owner confirms bottom-line benefit, accessible AI understanding and otherwise-hard-to-find local connections, with an eventual automated AI/robotics/autonomy hub (charter G-001/G-002/G-003). Routine development decisions are delegated; [OPERATING-MODE](OPERATING-MODE.md) labels agent-selected PR/push/cadence defaults. The owner reports a $100 ChatGPT Pro plan and asks to stay within its limits; actual quota is unverified. Existing live/cost boundaries remain.

AQ-019 initial operating documentation is complete; concrete reader examples and preferred connection path are asked as the next interview round and feed AQ-011. AQ-020 tracks the unavailable external scheduling step; recurrence is not configured. The prepared instruction uses the existing published environment and starts with AQ-001's still-unverified fresh-task restoration, then proceeds to outcome-driven work. No new credentials, spending, worker, migration, deployment or DNS operation performed.
