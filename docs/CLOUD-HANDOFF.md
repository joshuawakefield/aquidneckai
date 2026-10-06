# Codex Cloud and Dot handoff

Prepared: 2026-10-06. This document is the portable setup recipe. Account-side environment publication and a fresh cloud smoke task must be verified separately; documentation alone is not an active agent.

## Environment

| Setting | Value |
|---|---|
| Repository | https://github.com/joshuawakefield/aquidneckai |
| Working branch | aqai-local-index (explicitly select; main is the older site) |
| Suggested name | AquidneckAI development |
| Runtime | Node 22 and Python 3 |
| Install script | node scripts/cloud-setup.mjs --install |
| Start instruction | Read AGENTS.md and docs/README.md, then recover the current state and follow docs/AGENT-WORKFLOW.md. |
| Verification | node scripts/cloud-check.mjs |
| Initial credentials | None: repository development and fixture tests only |
| Network | GitHub and npm registry for checkout/install; no live-service access needed for checks |
| Deployment | Manual and separate; never run production worker or migrations during environment preparation |

Select the intended branch before installing; if the setup UI checks out main, switch the setup workspace to aqai-local-index and rerun setup. Record the actual branch/commit in the setup report. Save and publish only after checks pass. Refresh the prepared environment after dependency changes; every task must still fetch/read current repository state.

Use personal/private environment visibility unless workspace sharing is specifically needed. A Dot in the same account can use an existing cloud environment; sharing project knowledge publicly does not require sharing credentials. Do not copy local browser sessions or .env files. Configure any later service access narrowly through the environment's supported secret/vault controls after the need and scope are clear.

## Dot instruction to save

> Use the AquidneckAI development Codex cloud environment and the repository joshuawakefield/aquidneckai on aqai-local-index. At the start of each task, fetch current repository state and read AGENTS.md, docs/README.md and its canonical context documents. Follow docs/AGENT-WORKFLOW.md. Choose one ready backlog task within current authority, verify its acceptance criteria, and leave updated PROJECT-STATE, backlog/decisions when affected, and a dated journal. Commit/push or open a PR containing the context with the change and verify it is on GitHub before reporting completion. Keep Supabase Free, existing inference limits, manual deployment and legacy apex intact. No blanket database push, autonomous source enrollment, speculative paid calls or production cutover. If live access is missing, finish independent work and state the exact blocker.

This is a project instruction, not a mandate to spend indefinitely. A coordinator should reuse current context, avoid duplicate work, and stop or request input at a concrete blocker.

## First fresh task

Use AQ-001: read the repository without this local conversation; identify the deployed commit, geographic scope, actual model, budget cap, migration caution and three highest-priority open tasks. Run the secret-free baseline. Leave an accurate journal/state update and propose one bounded next task. Do not deploy, access live databases, publish content or buy anything. This proves context recovery before unattended implementation.

## What transfers

GitHub supplies code, project context, reports, tests and schema files. It does not supply unsaved local edits, full chat history, login cookies, local skills, secrets or live database rows. Supabase holds runtime records; reconcile migrations and plan private backups independently.

The cloud coding environment runs while the local computer is offline. A Dot delegates work to it, but separate tasks do not automatically inherit every Dot conversation. The repository is the durable shared memory. Browser-only hosting administration may need the Dot's separate cloud browser or owner action; current Codex Cloud documentation lists browser/computer use as unsupported.

## Official references

Verified 2026-10-06: [Cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environments), [Dot tasks and memory](https://learn.chatgpt.com/docs/dots/tasks-and-memory), [Dot computers and apps](https://learn.chatgpt.com/docs/dots/computers-and-apps). Recheck these when the account UI or product capabilities differ.

