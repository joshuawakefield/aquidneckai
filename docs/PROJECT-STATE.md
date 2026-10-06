# AquidneckAI current checkpoint

Updated: 2026-10-06T21:02Z. Read the [index](README.md) and [workflow](AGENT-WORKFLOW.md); the [historical record](reports/2026-10-06-project-history-through-handoff.md) explains older milestones. Earlier statements do not override this checkpoint.

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

The owner requested shared, model-readable project knowledge and cloud/Dot readiness. Before this task, the remote development branch contained runtime code but no project docs/AGENTS, migrations, or substantive regression suite. A clean clone is being used to assemble and validate the curated handoff.

The new record contains charter, architecture, decision register, backlog, dated reports/journal, model startup/closeout instructions and automated continuity checks. GitHub commit 76124489465df5eb06b805103f3c0fd537e78ee0 now contains all 86 reviewed handoff files; remote Git blob hashes matched every file. GitHub Project memory run 37530484278 passed. A clean checkout passed TypeScript, 38 frontend / 61 backend / 39 Python tests, build and loopback auth smoke. Sixteen continuity tests passed. No live credentials or service calls were used.

## Boundaries and next work

- Supabase stays Free. Keep existing inference limits and paid-call recovery safeguards.
- Manual staging deployments only; no apex/DNS cutover, plan purchase or source-discovery loop.
- Migration history is unreconciled. No blanket database push. Runtime data is in Supabase; repository context is not a database backup.
- General articles require human editorial approval; strict automatic official-calendar publication is separate.
- Source CRUD, continuing arcs, broader model routing and sponsorship are still backlog work.
- Immediate task: finish AQ-001 handoff validation; then choose one bounded ready item in [BACKLOG](BACKLOG.md). High-value options are migration inventory (AQ-002), budget/exception visibility (AQ-003), and current upstream failures (AQ-004).


Codex Cloud environment preparation is underway in the owner account, private visibility, with no network secrets or service environment variables. The setup agent checked out the correct development commit and independently passed document/continuity checks. Its dependency install exposed a proxy-transport issue in the new runner; the package-install-only fix passed two regression tests. Environment publication and the fresh cloud application baseline remain pending.
