# Codex Cloud and Dot handoff

Published and UI-verified: 2026-10-06 around 21:09 UTC. AquidneckAI development is an available private Codex Cloud environment. Setup independently validated the repository at b9e49bd52a712e3d49bbdaa342293caab9c592ee. Restoration into a separate future coding task remains a distinct check; no unattended recurring agent was started.

## Environment

| Setting | Value |
|---|---|
| Repository | https://github.com/joshuawakefield/aquidneckai |
| Working branch | aqai-local-index (explicitly select; main is the older site) |
| Published name | AquidneckAI development |
| Runtime | Node 22.23.3 and Python 3.12.14 verified |
| Install script | node scripts/cloud-setup.mjs --install |
| Start instruction | Read AGENTS.md and docs/README.md, then recover the current state and follow docs/AGENT-WORKFLOW.md. |
| Verification | node scripts/cloud-check.mjs |
| Initial credentials | None: repository development and fixture tests only |
| Network | Package managers preset; no extra domains or network secrets; GitHub checkout/fetch and npm install verified |
| Deployment | Manual and separate; never run production worker or migrations during environment preparation |

Select the intended branch before installing; if the setup UI checks out main, switch the setup workspace to aqai-local-index and rerun setup. Record the actual branch/commit in the setup report. Save and publish only after checks pass. Refresh the prepared environment after dependency changes; every task must still fetch/read current repository state.

Use personal/private environment visibility unless workspace sharing is specifically needed. A Dot in the same account can use an existing cloud environment; sharing project knowledge publicly does not require sharing credentials. Do not copy local browser sessions or .env files. Configure any later service access narrowly through the environment's supported secret/vault controls after the need and scope are clear.

## Published startup configuration

The saved install script requires a clean checkout at /workspace/aquidneckai, explicitly fetches and fast-forwards aqai-local-index, and selects pinned Node 22 from /workspace/aqai-toolchain/node_modules/.bin. It runs the repository setup plus memory checks and records the verified commit. It preserves existing changes by refusing to overwrite a dirty checkout. The host default was Node 24, so future shells must activate the retained Node 22 path. Package installation preserves proxy/TLS transport and uses a writable temporary npm cache; tests strip those settings and service keys.

The saved Start skill requires fresh Git state, the canonical read order, one bounded task, actual verification, state/journal updates, and an authorized commit/push or PR followed by remote verification. Privacy is Only me. No environment variables or network secrets were added. Setup evidence in the environment is /workspace/aqai-onboarding; its relevant results are also in the shared journal.

## Dot instruction and confirmed access

On October 6 the owner's Dot confirmed it could discover this published environment and read AGENTS/index plus all seven named context documents from the intended GitHub branch. It saved the repository/branch/read order and operating constraints. No coding task was launched for that read-only check. The instruction below is the reusable project contract.

> Use the AquidneckAI development Codex cloud environment and the repository joshuawakefield/aquidneckai on aqai-local-index. At the start of each task, fetch current repository state and read AGENTS.md, docs/README.md and its canonical context documents. Follow docs/AGENT-WORKFLOW.md. Choose one ready backlog task within current authority, verify its acceptance criteria, and leave updated PROJECT-STATE, backlog/decisions when affected, and a dated journal. Commit/push or open a PR containing the context with the change and verify it is on GitHub before reporting completion. Keep Supabase Free, existing inference limits, manual deployment and legacy apex intact. No blanket database push, autonomous source enrollment, speculative paid calls or production cutover. If live access is missing, finish independent work and state the exact blocker.

This is a project instruction, not a mandate to spend indefinitely. A coordinator should reuse current context, avoid duplicate work, and stop or request input at a concrete blocker.

## First fresh task

For the final launch message, continuous serial progression and model-selection fallback, use [DOT-START](DOT-START.md). It requests fresh AQ-001 now, then AQ-021, then immediate useful successor tasks. Each cloud job is bounded; one job per day is not the mandate. Supported wake-ups are a fallback if completion-triggered continuation is unavailable; actual execution/resume evidence remains required.

Use AQ-001: read the repository without this local conversation; identify the deployed commit, geographic scope, actual model, budget cap, migration caution and three highest-priority open tasks. Run the secret-free baseline. Leave an accurate journal/state update and propose one bounded next task. Do not deploy, access live databases, publish content or buy anything. This proves context recovery before unattended implementation.

## What transfers

GitHub supplies code, project context, reports, tests and schema files. It does not supply unsaved local edits, full chat history, login cookies, local skills, secrets or live database rows. Supabase holds runtime records; reconcile migrations and plan private backups independently.

The cloud coding environment runs while the local computer is offline. A Dot delegates work to it, but separate tasks do not automatically inherit every Dot conversation. The repository is the durable shared memory. Browser-only hosting administration may need the Dot's separate cloud browser or owner action; current Codex Cloud documentation lists browser/computer use as unsupported.

## Official references

Verified 2026-10-06: [Cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environments), [Dot tasks and memory](https://learn.chatgpt.com/docs/dots/tasks-and-memory), [Dot computers and apps](https://learn.chatgpt.com/docs/dots/computers-and-apps). Recheck these when the account UI or product capabilities differ.

## First restored task checkpoint — 2026-10-06

AQ-001 now runs as a separate task from the published configuration; see its [journal](journal/2026-10-06-2227Z-fresh-cloud-restoration.md). The restored shell had Node 24 and a main-only fetch refspec despite the earlier setup evidence. Explicitly fetch the development ref as in AGENT-WORKFLOW and select Node 22 before checks. Node 22.23.0/Python 3.12.14 passed here. The saved Start skill was not exposed as a readable SKILL.md in this child; its documented startup contract supplied the fallback. Do not infer that the earlier setup runtime will always be restored. AQ-020 still requires actual parent-to-successor evidence.
