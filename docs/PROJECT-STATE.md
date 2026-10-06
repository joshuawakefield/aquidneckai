# AquidneckAI current checkpoint

Updated: 2026-10-06T22:37Z. Read the [index](README.md) and [workflow](AGENT-WORKFLOW.md); the [historical record](reports/2026-10-06-project-history-through-handoff.md) explains older milestones. Earlier statements do not override this checkpoint.

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
- AQ-001 is complete: independent restoration, offline validation and remote closeout are verified below. AQ-021 is now implemented and locally tested; see the successor checkpoint below. AQ-002/AQ-003 remain priority reliability work; AQ-020 remains blocked only for untested reporting delivery and plan-limit pause/resume evidence. Do not recreate the published environment.


Codex Cloud environment AquidneckAI development was published and UI-verified around 21:09 UTC, with Only me visibility, Package managers network preset, no network secrets and no service environment variables. The independent Linux cloud baseline passed TypeScript, 38 frontend / 63 backend / 39 Python tests, production build, loopback auth smoke, documentation checks and 16 continuity tests. The final saved install script passed at b9e49bd52a712e3d49bbdaa342293caab9c592ee. Its Start skill reads the current repository and requires verification plus state/journal/remote updates.

The owner's Dot independently confirmed discovery of the published environment, the matching repository revision, and reading AGENTS/index plus all seven named context documents. It saved the repository/branch/read order and operating constraints. It correctly flagged the then-stale publication status, corrected in this closeout. At that earlier discovery check no fresh coding task or recurring schedule was launched. The independent AQ-001 restoration is recorded below.

## Ongoing-development interview

2026-10-06: the initial AQ-019 interview is recorded. The owner confirms bottom-line benefit, accessible AI understanding and otherwise-hard-to-find local connections, with an eventual automated AI/robotics/autonomy hub (charter G-001/G-002/G-003). Routine development decisions are delegated; [OPERATING-MODE](OPERATING-MODE.md) labels agent-selected PR/push/cadence defaults. The owner reports a $100 ChatGPT Pro plan and asks to stay within its limits; actual quota is unverified. Existing live/cost boundaries remain.

AQ-019 initial operating documentation and follow-up answers are recorded. The first reader is a self-employed local blue-collar owner or very small team wanting freedom from customer acquisition/retention/reactivation administration. First connection focus: peers, collaborators and local projects. D-021 and the charter preserve these choices. AQ-011 defines the [reader journey and usefulness baseline](reports/2026-10-06-trades-reader-journey.md); this is source-inspected design, not user-tested savings or deployed changes. AQ-021 now implements a fictional customer-follow-up exercise locally; AQ-022 separately verifies a real peer/project resource. F08 awaits separately authorized deployment; F09 remains open. AQ-020 tracks continuous serial execution; current activation/reporting evidence is recorded below. The prepared instruction uses the existing published environment and starts with AQ-001's independent restoration and remote closeout, then proceeds to outcome-driven work. No new credentials, spending, worker, migration, deployment or DNS operation performed.

## Dot launch preparation

2026-10-06: the owner requested final Dot setup and loop startup. [DOT-START](DOT-START.md) is prepared for fresh AQ-001, then AQ-021, then continuous serial useful successor tasks. The owner explicitly superseded the agent-selected daily cadence; D-023 records this. A supported wake-up can resume idle work if completion-triggered continuation is unavailable, with actual gaps reported. Native model selection is recommended where available; the platform default is the fallback, and no custom router or paid model integration was built. The setup chat had no Dot/scheduler control. AQ-020 remains blocked pending actual successor execution; the new child/reporting evidence below supersedes the earlier unconfigured status. Publication is already verified; do not recreate the environment. At preparation time no activation was claimed; current activation evidence follows. No new runtime deployment occurred.

## Independent restoration — 2026-10-06 22:27 UTC

AQ-001 recovered the current repository in a separate child launched from the published configuration. Explicit development-ref fetch corrected a stale main-only fetch configuration; clean b9e49bd was fast-forwarded to 2f0af026942f224e55849dbf6c868b09223da5b5 before edits. Node 24 initially failed preflight; temporary Node 22.23.0 with Python 3.12.14 passed TypeScript, 38 frontend, 63 backend and 39 Python tests, build and loopback authentication smoke. All 16 continuity tests and project-memory validation passed. Earlier baseline evidence above remains separate. Exact task model is unknown; platform default used. See the [task journal](journal/2026-10-06-2227Z-fresh-cloud-restoration.md) for commands, limits and remote closeout. AQ-001 is done: commit c674479d1e6057dbf092bde176a51311525a84f8 was pushed and matched the exact remote development ref; [Project memory CI](https://github.com/joshuawakefield/aquidneckai/actions/runs/37540917217) passed. The journal records this verified checkpoint; final status-only closeout is verified separately in the task response.

Parent completion notification is supported by the tool contract. Parent reports enabled daily summaries starting October 7 around 19:00 America/New_York, flexible within an hour, with Sunday weekly synthesis; no report delivery or successor execution is yet demonstrated. One active child, fresh fetch before successors and uncertain-outcome reconciliation are recorded in D-024. AQ-020 remains blocked. After verified AQ-001 closeout, parent should launch AQ-021: fictional customer-follow-up exercise, focused UI tests, no customer collection/inference/sending, no deployment. The child does not launch it. Application deployment remains the historical b34b14e staging observation; no live revalidation occurred.

## AQ-021 successor checkpoint — 2026-10-06 22:36 UTC

The parent launched this bounded task after AQ-001 terminal notification and verification of final commit 5c38f245f9552a30ac19ef96234bccc53e2b21fa and [CI run 37541004642](https://github.com/joshuawakefield/aquidneckai/actions/runs/37541004642). This is actual completion-triggered successor execution, superseding earlier statements that none was demonstrated. Parent reports no other active development writer. It owns successors; this child launches none. First restoration/verified closeout plus this successor start are demonstrated, not future uninterrupted execution. Daily report delivery and plan-limit pause/resume remain untested; AQ-020 stays blocked for those remaining criteria. Exact model/quota are unknown; platform default used.

AQ-021 replaces the first generic drafting example with a fictional carpentry estimate follow-up. Three examples, eight resources, navigation and feed behavior remain. The self-contained prompt limits facts and forbids invented prices, timing, appointments, guarantees and prior conversations; readers check/edit/reject and decide on manual sending. No customer collection/storage, sending control, new inference, service integration or telemetry was added. Full offline baseline passed: Node 22.23.3/Python 3.12.14, TypeScript, 41 frontend / 63 backend / 39 Python tests, build and loopback auth smoke. Eight reader tests, scoped lint and 16 continuity tests passed. Fixture Chromium checks passed at 1280px and 390px, including keyboard expansion, repeated resource/practice navigation, reload, empty browser storage and only the existing feed request per visit. Screenshots inspected with external fonts blocked; provider-font/live/staging checks were not run. No measured savings or real reader validation claimed.

See the [AQ-021 journal](journal/2026-10-06-2233Z-customer-follow-up.md) for rationale and closeout. Implementation is local/repository scope, not deployed; F08 remains pending staging verification. Next recommended bounded task: AQ-003 budget/exception visibility with stale/unavailable fixtures and no live inference/cap changes; parent owns selection and launch. AQ-002 offline migration inventory is an alternative.

AQ-021 remote implementation checkpoint: [93a0a21](https://github.com/joshuawakefield/aquidneckai/commit/93a0a21dac3d662dd2ba5865c712995f4eb7665d) matched the exact development ref; [Project memory run 37541654803](https://github.com/joshuawakefield/aquidneckai/actions/runs/37541654803) passed. The journal contains the reviewed file allowlist and local results. Final status-only closeout remote/CI evidence is supplied in the task response. Nothing deployed.
