# Development operating record

Updated: 2026-10-06. This document connects owner intent to task selection and continuity. Product intent remains in [PROJECT-CHARTER](PROJECT-CHARTER.md); actual results remain in [PROJECT-STATE](PROJECT-STATE.md). Historical requests do not grant new live access or spending authority.

## Current mandate and interview status

The owner wants agents to keep improving AquidneckAI, derive useful goals, steps and tests, and preserve project-relevant learning from interactions in GitHub. The agent should maintain the record as part of its work, without making the owner repeat known context or administer a second task system. On 2026-10-06, the owner delegated routine development judgment: "do what makes the most sense." Select, implement, test and share bounded repository work without repeatedly asking the owner to choose steps. Existing live-operation, deployment, secret and spending limits remain in force.

Already recorded: free reading, Island residents/businesses with a slight business tilt, substantively useful broader AI coverage, eventual sponsorship, low owner effort, evidence-first publication, bounded operations, and no public chatbot. Do not re-interview settled choices unless new evidence warrants revisiting them.

| Interview topic | Recorded answer or selected default | Evidence/status |
|---|---|---|
| Useful outcomes and direction | Bottom-line benefit, opening up AI understanding, otherwise-hard-to-find local connections; eventual automated AI/robotics/autonomy hub. | Owner-confirmed; canonical G-001/G-002/G-003 in PROJECT-CHARTER. |
| Routine development completion | Agent chooses sensible steps and tests. Default: independently commit/push small, scoped, tested changes to aqai-local-index; prefer a PR for substantial architecture changes or changes needing review. Preserve others' work and verify remote results. | Owner delegated judgment; this PR/push split is the agent's selected operating default, not a quoted owner requirement. No force-push or automatic deployment. |
| Plan/usage | Owner reports a $100 ChatGPT Pro plan and AquidneckAI as the only current project; stay within plan limits. | Owner report, not billing or remaining-quota verification; see ENVIRONMENT-REGISTER. No additional paid API allowance. |
| Cadence and updates | Selected starting default: one bounded task each weekday, one weekly progress digest, and prompt notification for a concrete blocker or owner decision. | Agent-selected default under delegated judgment. Scheduling remains unconfigured; no promise of five completed tasks or automatic work until a supported trigger exists. |

Current follow-up interview: one representative local reader/business problem and which connections should be easiest first (events/training, peers/projects, or experts/services). These answers improve the first reader journey; their absence does not block independently useful authorized work. Ask further questions only when they materially affect a choice. Summarize each substantive answer into its canonical home; label proposals and unresolved preferences explicitly.

Stay within the existing subscription and platform-enforced usage limits. Remaining usage and reset timing are not exposed to this task; do not invent a numeric quota or claim quota monitoring. Use bounded tasks, reuse evidence and valid test outputs, avoid duplicate agent work and unchanged retries, and stop/back off when the platform reports a usage limit. Do not purchase credits, enable overage, raise caps or equate a ChatGPT subscription with OpenRouter/API credit.

## Goal and task selection

For each authorized session or scheduled task:

1. Fetch current development state and read the canonical context. Check [ENVIRONMENT-REGISTER](ENVIRONMENT-REGISTER.md) for relevant capability evidence and missing access; do not infer live access from installed tools.
2. Select one ready backlog item within current authority. Prefer correctness/reliability blockers, then practical benefit linked to G-001/G-002/G-003 and reduced owner effort. Consider dependencies, effort and cost; explain a priority change briefly.
3. Connect the task to a specific charter outcome. State its stable AQ-ID, expected behavior, acceptance criteria and what evidence would demonstrate completion. Split an oversized item into bounded work rather than silently abandoning acceptance criteria.
4. Derive the implementation steps and meaningful tests. Use fixtures and local checks first. Test the behavior being changed and relevant regressions; distinguish local, staging and public evidence.
5. Finish the state/journal/remote loop in [AGENT-WORKFLOW](AGENT-WORKFLOW.md). If blocked, record the exact prerequisite, completed independent work and next safe action. Do not repeat unchanged failed or paid actions.
6. Identify one next useful task. Continue only within the session/task mandate and usage limits. A backlog is not an endless-running process.

The existing AQ-001 restored-task check remains a prerequisite for claiming fresh-task continuity. After that first scheduled invocation, AQ-011 should map the three confirmed outcomes to a representative reader journey and minimal evidence of usefulness; reliability work such as AQ-003 can proceed independently. This record does not authorize live portions of the backlog.

## Capture knowledge while it is fresh

Every material interaction, milestone and closeout should update the smallest relevant set of records:

| New learning | Canonical destination |
|---|---|
| Reader needs, scope, owner preferences or success criteria | PROJECT-CHARTER; retain a dated source summary in the journal |
| Choice, reason, alternative rejected or revisit trigger | DECISIONS, permanent D-ID |
| Verified behavior, current blockers or immediate next action | PROJECT-STATE, with date and evidence |
| New or changed work, dependency, acceptance criteria or completion | BACKLOG, permanent AQ-ID |
| Plan, access capability, environment or operational restriction | ENVIRONMENT-REGISTER; secrets stay outside Git |
| Request, answer, change, lesson, verification and handoff | docs/journal/YYYY-MM-DD-HHMMZ-topic.md |
| Detailed research or audit worth retaining | docs/reports/YYYY-MM-DD-topic.md, linked from current state |

Record all useful project knowledge, including failed approaches and corrections when they affect future work. Summarize rather than copying an unbounded transcript, private conversation, hidden reasoning, credential values, cookies or raw exports. Preserve an earlier dated observation when a newer result supersedes it; update the current canonical fact instead of leaving contradictory current instructions.

Keep facts, owner preferences, proposals and unknowns distinguishable. Mark implementation, local tests, staging verification and public deployment separately. A closed task needs acceptance evidence; a future idea remains open or deferred. Keep task status vocabulary consistent with BACKLOG and put an active task's in-progress status in its journal.

## Regular review and execution

Read and reconcile current records at every task start. Update them after material interactions and before task closeout. Refresh environment evidence when the task actually exercises a capability or when the owner reports a plan/access change; date owner reports separately from direct checks. Consult relevant dated history when a current decision needs explanation.

A Dot or other supported scheduler must supply recurring task execution; repository documents cannot start an idle agent. Before enabling recurrence, record the configured trigger, task/usage limits, notification rhythm and actual scheduling evidence here. Use one active task per item and preserve existing cost/live-operation limits. Current scheduler status: not configured, as last recorded in PROJECT-STATE on 2026-10-06; no scheduler was changed in this interview task.

Prepared recurring task instruction: Use AquidneckAI development, fetch aqai-local-index and read AGENTS/docs/README plus canonical context. On the first fresh invocation complete AQ-001; thereafter select one ready task using charter outcomes G-001/G-002/G-003 and current authority. Implement/test, update state/journal/backlog as affected, commit/push or open a PR, and verify the remote result. Stay within the owner's existing ChatGPT plan; no purchase/overage or new API budget. Preserve the existing production/deployment/DNS/worker/migration limits. Stop at a concrete blocker or platform usage limit. Report meaningful outcomes in the weekly digest and promptly surface blockers. This is prepared text, not evidence that a schedule has been saved.

Memory checks validate structure and changed-context requirements; they do not prove factual accuracy, remote backup, permissions or that every document was read. Verify those claims separately.
