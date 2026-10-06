# Development operating record

Updated: 2026-10-06. This document connects owner intent to task selection and continuity. Product intent remains in [PROJECT-CHARTER](PROJECT-CHARTER.md); actual results remain in [PROJECT-STATE](PROJECT-STATE.md). Historical requests do not grant new live access or spending authority.

## Current mandate and open interview

The owner wants agents to keep improving AquidneckAI, derive useful goals, steps and tests, and preserve project-relevant learning from interactions in GitHub. The agent should maintain the record as part of its work, without making the owner repeat known context or administer a second task system. This request authorizes this interview and continuity documentation; routine engineering completion authority and a recurring schedule are still being clarified.

Already recorded: free reading, Island residents/businesses with a slight business tilt, substantively useful broader AI coverage, eventual sponsorship, low owner effort, evidence-first publication, bounded operations, and no public chatbot. Do not re-interview settled choices unless new evidence warrants revisiting them.

| Open question | Why it affects work | Current status |
|---|---|---|
| What would make the next six months successful, including the most valuable reader/business outcome? | Select improvements against useful outcomes rather than feature volume. | Asked 2026-10-06; answer pending. No numeric target inferred. |
| Should autonomous tested changes end in a PR for review or a push to the development branch? | Establish ordinary completion authority and review expectations. | Asked 2026-10-06; answer pending. Existing task-specific authority still applies. |
| What task cadence, usage ceiling and notification rhythm should apply? | Configure a bounded external trigger without unbounded execution. | Asked 2026-10-06; answer pending. No recurring schedule configured. |

After these answers, ask only follow-ups that materially affect choices: preferred initial reader journey and examples, near-term feature priority, acceptable owner review time, measurable success indicators, and separately scoped production permissions when needed. Summarize each substantive answer into its canonical home; label proposals and unresolved preferences explicitly.

## Goal and task selection

For each authorized session or scheduled task:

1. Fetch current development state and read the canonical context. Check [ENVIRONMENT-REGISTER](ENVIRONMENT-REGISTER.md) for relevant capability evidence and missing access; do not infer live access from installed tools.
2. Select one ready backlog item within current authority. Prefer correctness/reliability blockers, then measurable reader value and reduced owner effort. Consider dependencies, effort and cost; explain a priority change briefly.
3. Connect the task to a specific charter outcome. State its stable AQ-ID, expected behavior, acceptance criteria and what evidence would demonstrate completion. Split an oversized item into bounded work rather than silently abandoning acceptance criteria.
4. Derive the implementation steps and meaningful tests. Use fixtures and local checks first. Test the behavior being changed and relevant regressions; distinguish local, staging and public evidence.
5. Finish the state/journal/remote loop in [AGENT-WORKFLOW](AGENT-WORKFLOW.md). If blocked, record the exact prerequisite, completed independent work and next safe action. Do not repeat unchanged failed or paid actions.
6. Identify one next useful task. Continue only within the session/task mandate and usage limits. A backlog is not an endless-running process.

The existing AQ-001 restored-task check remains a prerequisite for claiming fresh-task continuity. Current high-value engineering options are AQ-002, AQ-003 and AQ-004; this record does not authorize their live portions.

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

Memory checks validate structure and changed-context requirements; they do not prove factual accuracy, remote backup, permissions or that every document was read. Verify those claims separately.
