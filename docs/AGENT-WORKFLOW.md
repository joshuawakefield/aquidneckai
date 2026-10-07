# Agent continuity loop

This loop applies equally to Codex local, Codex Cloud, a Dot delegating work, or another model. Read [AGENTS](../AGENTS.md) and the [index](README.md) first.

## Start

1. Explicitly fetch the development ref with `git fetch origin refs/heads/aqai-local-index:refs/remotes/origin/aqai-local-index`, then inspect branch, commit and working-tree changes. A plain `git fetch origin` can refresh only main in a restored checkout; compare the development ref with `git ls-remote origin refs/heads/aqai-local-index` before trusting it. Base new work on `origin/aqai-local-index`; preserve unrelated work. Save the starting commit for the continuity check.
2. Read current state, charter, architecture, decisions and backlog. Read the latest relevant journal/report and actual code. Old chat or a cloud filesystem snapshot may be stale.
   Also read [OPERATING-MODE](OPERATING-MODE.md) for task-selection/interview updates and relevant entries in [ENVIRONMENT-REGISTER](ENVIRONMENT-REGISTER.md). Derive goals, steps and tests from current intent within the task's authority; do not treat historical permissions or a backlog as a recurring execution grant.
3. State the task ID, intended outcome, acceptance criteria and current authority. For competing agents, use separate task branches/PRs and avoid editing the same files concurrently.
4. Check required access before dependent work. Repository-only tasks need no live credentials. Do not infer authority from a backlog row or historical command.

Before using a model for repetitive project work, consult [LOCAL-FIRST-WORKFLOW](LOCAL-FIRST-WORKFLOW.md) and inspect the existing scripts. Prefer the existing deterministic command for checks, normalization, replay and formatting; only add a script when its bounds and fixture expectations can be stated. Use a model only for residual semantic judgment a tested script cannot perform, choosing the least costly model proven reliable for the task. Script output is evidence, not a substitute for checking input quality or the truth of a human-authored state update.

## Work and learn

5. Select the next task by expected reader benefit, reduced owner effort, evidence gained and dependencies, using [FIRST-RELEASE-DESIGN](FIRST-RELEASE-DESIGN.md) for the release direction. Reorder or retire backlog items with a concise evidence-backed reason. Make one bounded change. Prefer low operating cost and less owner work. Verify uncertain current provider details against official sources.
6. At useful milestones, update a dated journal with findings, changes, concise reasons and unresolved questions. Record mistakes/corrections as lessons with evidence, not as an unbounded transcript.
   Capture material learning from owner interactions at the time it arrives, updating the canonical document rather than leaving new intent only in chat. Record plan/access changes as dated, non-secret metadata in ENVIRONMENT-REGISTER.
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

The owner now requests continuous serial development (D-023). The Dot coordinator launches the next useful task after verified closeout; individual cloud jobs stay bounded. Actual supported completion-triggered continuation or saved wake-ups are required for execution; documents alone cannot keep an idle agent running. Record the mechanism, overlap protection, platform-limit pause/resume and notification behavior. Use [DOT-START](DOT-START.md) for the current launch contract.

## Limits of automation

The push/PR continuity check validates record presence, filenames, links and updates. It does not validate the truth of prose, guarantee instruction compliance, or enforce merge blocking without a repository rule. Agents must still inspect results. Keep human involvement for product judgment, genuinely missing authorization and unresolved evidence, rather than routine copying or formatting.

The parent coordinates one active development child and launches successors only after reading the verified result and freshly fetching the development branch. A child completes only its assigned task. Reconcile uncertain task/push outcomes from remote refs, CI and the journal before retrying; never create a duplicate writer. Use draft PRs for substantial work, never automatically merge PRs, and stop before any push known to trigger an unauthorized deployment.
