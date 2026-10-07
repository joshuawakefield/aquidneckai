# Shared project record

Canonical repository: [joshuawakefield/aquidneckai, aqai-local-index](https://github.com/joshuawakefield/aquidneckai/tree/aqai-local-index). This branch contains the replacement system; the default `main` branch still represents the older public site.

## Read order

1. [PROJECT-STATE](PROJECT-STATE.md): what is true now, verification dates, blockers and immediate next action.
2. [PROJECT-CHARTER](PROJECT-CHARTER.md): audience, scope, product intent and success criteria.
3. [ARCHITECTURE](ARCHITECTURE.md): implemented stack and operational boundaries.
4. [DECISIONS](DECISIONS.md): settled/open choices, reasons, evidence and revisit triggers.
5. [BACKLOG](BACKLOG.md): stable task IDs, acceptance criteria and dependencies.
6. [AGENT-WORKFLOW](AGENT-WORKFLOW.md): the startup, work, verification and closeout loop.
7. [CLOUD-HANDOFF](CLOUD-HANDOFF.md): environment recipe and Dot instructions.
8. [OPERATING-MODE](OPERATING-MODE.md): interview gaps, task selection and ongoing knowledge capture.
9. [ENVIRONMENT-REGISTER](ENVIRONMENT-REGISTER.md): dated, non-secret plan and capability evidence.
10. [LOCAL-FIRST-WORKFLOW](LOCAL-FIRST-WORKFLOW.md): deterministic project scripts, report commands and judgment boundaries.

To finish Dot activation, use [DOT-START](DOT-START.md): prepared launch message, trigger defaults, startup evidence and model-selection guidance.

Then read only the relevant [reports](reports/), [journal](journal/), code and [visitor tracker](VISITOR-EXPERIENCE-TRACKER.md). Context should become more useful over time without requiring every model to reread a giant diary.

## Where information belongs

| Information | Canonical home |
|---|---|
| Scope, audience, non-goals | PROJECT-CHARTER |
| Current stack and invariants | ARCHITECTURE |
| Choice, reason, evidence, what would change it | DECISIONS, permanent D-ID |
| Verified deployment, current blockers, next step | PROJECT-STATE |
| Deferred idea or unfinished task | BACKLOG, permanent AQ-ID |
| Interaction outcome, learning, tests, handoff | journal/YYYY-MM-DD-HHMMZ-topic.md |
| Dated audit, research, costs, source coverage | reports/YYYY-MM-DD-topic.md |
| Script inventory, local commands, model-vs-deterministic boundary | LOCAL-FIRST-WORKFLOW and tested scripts |
| Runtime sources, collected content, editorial history | Supabase, not this diary |
| Credentials and private exports | Approved secret store/private backup, never GitHub |

Dates are ISO format; journal times are UTC. Keep stable canonical filenames undated; date-first names apply to historical reports and journal entries. Old report-name redirects exist only for compatibility.

## Record quality and backup boundary

Current state supersedes dated history. Label proposed, implemented, tested and deployed separately; attach timestamps and evidence to live observations. Reconstruct earlier interactions honestly rather than inventing exact dates or a verbatim transcript. Record useful conclusions and reasons, not private model reasoning.

GitHub is the shared project knowledge and code record. It does not automatically contain unsaved conversations, local files, credentials or a database backup. Raw local reports remain private; this repository preserves their relevant findings and verification summaries. Database restoration and migration reconciliation remain tracked work.

[AGENTS.md](../AGENTS.md) instructs agents to maintain this record. The [local project-check workflow](../.github/workflows/project-memory.yml) installs locked dependencies, runs the Node 22 offline baseline and validates project memory/change records on pull requests and development-branch pushes. It cannot prove an agent read the docs or that every statement is correct. Branch protection must be configured separately before checks become mandatory merge gates.

## Historical record

The [reviewed project history](reports/2026-10-06-project-history-through-handoff.md) carries forward earlier local milestones. The [cost report](reports/2026-10-06-operating-costs.md) and [recurring-source report](reports/2026-10-05-recurring-sources.md) are dated operational snapshots, not live dashboards.
