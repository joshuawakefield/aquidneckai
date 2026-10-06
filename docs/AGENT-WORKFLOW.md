# Agent continuity loop

This loop applies equally to Codex local, Codex Cloud, a Dot delegating work, or another model. Read [AGENTS](../AGENTS.md) and the [index](README.md) first.

## Start

1. Fetch remote state and inspect branch, commit and working-tree changes. Base new work on `origin/aqai-local-index`; preserve unrelated work. Save the starting commit for the continuity check.
2. Read current state, charter, architecture, decisions and backlog. Read the latest relevant journal/report and actual code. Old chat or a cloud filesystem snapshot may be stale.
3. State the task ID, intended outcome, acceptance criteria and current authority. For competing agents, use separate task branches/PRs and avoid editing the same files concurrently.
4. Check required access before dependent work. Repository-only tasks need no live credentials. Do not infer authority from a backlog row or historical command.

## Work and learn

5. Make one bounded change. Prefer low operating cost and less owner work. Verify uncertain current provider details against official sources.
6. At useful milestones, update a dated journal with findings, changes, concise reasons and unresolved questions. Record mistakes/corrections as lessons with evidence, not as an unbounded transcript.
7. Put durable decisions in DECISIONS with permanent IDs, status, reason, evidence and revisit trigger. Supersede old decisions rather than rewriting history. Put future ideas in BACKLOG with acceptance criteria.
8. Test actual behavior with the smallest meaningful checks. Use fixtures before live services. Do not use real inference, publication, a worker run or a database write as a default test.
9. Record verification level precisely: local test, build, staging, public site. A green build does not mean deployed; a passing feed does not mean all sources are healthy.

## Close and transfer

10. Refresh PROJECT-STATE with the current result, blockers and one concrete next action. Update affected backlog/tracker rows. Finish the journal using the [template](templates/interaction.md).
11. Run `node scripts/check-project-memory.mjs --base <starting-commit>`. For a fresh handoff, also run `node scripts/cloud-check.mjs` in a clean secret-free checkout.
12. Review the explicit changed-file list for scope, secrets, private data and stale instructions. Commit/push the context with the implementation. Prefer a PR to `aqai-local-index` for new tasks; never target legacy `main` by accident.
13. Verify the remote commit/files or PR. Report what is shared, what was tested, whether deployed, and any exact remaining blocker. If push fails, say the new knowledge is still local.
14. The next agent repeats this loop from remote state. An interrupted task resumes from its latest journal checkpoint; it does not blindly replay live or paid actions.

## Dot coordination

Keep the Dot's persistent instruction short: repository URL, development branch, read order, this loop and boundaries. Delegate a bounded task to the prepared cloud environment, wait for its actual result, read the changed state/journal, and reconcile the backlog before selecting another task. Do not run two agents against the same task or repeatedly restart a paid/live action after an uncertain outcome.

A saved schedule is required for recurring Dot activity. This handoff does not create an endless background engineering loop or new recurring automation. Configure cadence, usage budget and meaningful-notification rules explicitly when enabling one.

## Limits of automation

The push/PR continuity check validates record presence, filenames, links and updates. It does not validate the truth of prose, guarantee instruction compliance, or enforce merge blocking without a repository rule. Agents must still inspect results. Keep human involvement for product judgment, genuinely missing authorization and unresolved evidence, rather than routine copying or formatting.

