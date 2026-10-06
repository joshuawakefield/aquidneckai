# Continuous development cadence correction

Task ID: AQ-020
Started: 2026-10-06T22:14:00Z (minute precision)
Starting commit: 87b01c7269763c0be57307dabbdf29520f9850de
Status: continuous mandate recorded; external Dot continuation capability still unverified

## Request

The owner explicitly requests continuous running, not once per day. This corrects the agent's weekday scheduling default; it does not change subscription, production, deployment or spending boundaries.

## Changes

Updated DOT-START, operating mode, handoff, backlog and state to require serial progression immediately after verified task closeout. Added D-023. Distinguished one bounded cloud job from the coordinator's continuous sequence. Supported periodic wake-up is a transparent fallback if completion-triggered continuation is unavailable, not a claim of uninterrupted execution.

## Decisions and rationale

Use one active task at a time, keep state/journal/remote checkpoints, skip blocked items when independent work exists, and derive justified new tasks from charter outcomes when useful. Pause at platform limits, an all-work blocker, owner stop or no useful authorized work; avoid duplicate retries and busywork. Daily/weekly summaries do not limit work cadence. The chat still cannot launch or configure Dot continuation, so activation remains an external capability step.

## Verification

node scripts/check-project-memory.mjs --base 87b01c7269763c0be57307dabbdf29520f9850de passed for 42 Markdown files; git diff --check passed. Reviewed current cadence references for stale daily work limits. No Dot message, schedule, successor task, application code, production service or paid operation is initiated by this chat. Actual first-task and successor/resume evidence is required to close AQ-020.

## Next steps

Send the revised DOT-START instruction to the Dot. Have it launch fresh AQ-001, then AQ-021 after success, then immediately continue useful tasks. Require it to report actual continuation/wake-up mechanism, overlap protection, platform-limit resume behavior and remote results. Do not label the loop continuous from a daily schedule or promise alone.
