# AQ-022 local connection verification

Task ID: AQ-022
Started: 2026-10-06T23:05Z
Starting commit: 15362f57f8972eb30960b876bd436e024fa1b972
Status: research and local checks completed; remote verification follows commit

## Request

Verify a bounded public candidate list for local peers, collaborators and projects, prioritizing self-employed trades owners/small teams and practical technology. Deliver official evidence, geography/audience/activity/contact, dates, stated costs/eligibility, exclusions and honest unknowns; propose a bounded implementation without publishing. Parent owns successors; no other development writer reported. Existing production/cost/access limits remain.

## Changes

- Added [one verification report](../reports/2026-10-06-local-connections-verification.md) with source IDs, page locators, claim mapping, one organization recommended for editorial consideration, provisional/excluded candidates, proposed wording and next preview acceptance criteria.
- Updated PROJECT-STATE, AQ-022 only in BACKLOG and F09 in VISITOR-EXPERIENCE-TRACKER. Research is complete; reader implementation, publication and actual connection outcomes are not.
- Recorded current design proposal pointers without importing their documents/code or changing PRs. AQ-024/AQ-025 and proposal decision IDs remain reserved.

## Decisions and rationale

Apply D-007/D-021's evidence and first-reader requirements: an explicit networking offer is stronger than directory logos, generic courses or a public email alone. Keep practical AI learning separate from claims about the peer audience. PPL's public technical workshop description is useful but its calendar failure prevents next-session verification. Do not widen research to fill a target count. No new durable policy decision or colliding D-ID needed.

Read AGENTS, README/index, current state/charter/backlog/decisions/architecture/workflow/operating mode/environment register/cloud handoff, reader tracker and AQ-011 journey report. Read PR1 FIRST-RELEASE-DESIGN at 5292dc1 as proposed direction only. Both PRs verified open/draft/unmerged via read-only GitHub metadata. Relevant repository skill files were not exposed at the checked .agents/.codex paths; use the documented startup contract. No external authoring skill needed for this repository-native report.

## Verification

- Restored clean branch `work` at b9e49bd. Plain branch fetch updated FETCH_HEAD to 15362f57 but left stale tracking state due to saved fetch configuration. Explicit `git fetch origin refs/heads/aqai-local-index:refs/remotes/origin/aqai-local-index`, switch to existing development branch and `git merge --ff-only origin/aqai-local-index` recovered actual start. A create-branch attempt safely failed because the branch already existed; no reset/force operation. `git ls-remote` matched actual start; tree clean before edits.
- Node 22.23.3 at `/workspace/aqai-toolchain/node_modules/node/bin/node`; Python 3.12.14. Default shell Node 24 was not used for checks. Exact task model and quota unknown.
- Public official pages checked October 6 around 23:06–23:10 UTC through the authorized web tool. Report records source/date/access distinctions. PPL calendar returned HTTP 429; stopped, no bypass/retry. Initial inaccessible domain probes and discarded stale evidence are recorded. No outreach, signup, form submission or purchase.
- Scope is five documentation files only. No application change, database/inference/SQL/migration/worker/source enrollment, directory/customer collection, deployment/DNS, schedule/child or visibility change.
- Local verification passed: `node --test scripts/test-project-memory.mjs` (16/16); `node scripts/check-project-memory.mjs --base 15362f57f8972eb30960b876bd436e024fa1b972` (47 Markdown files); `git diff --check`. Node means the explicit Node 22 path above. Application tests/build were not rerun for report-only work; no runtime correctness claim added.
- Reviewed allowlist: `docs/reports/2026-10-06-local-connections-verification.md`, `docs/journal/2026-10-06-2309Z-local-connections.md`, `docs/PROJECT-STATE.md`, `docs/BACKLOG.md`, `docs/VISITOR-EXPERIENCE-TRACKER.md`. Public organization evidence only; no secrets/private records or design files. Existing push workflow is continuity-only; manual hosting remains unchanged.
- Parent supplied additional public leads during research. Checked the same organizations' program/contact and historical Health Tech pages; 2025 event excluded. Supplied FabNewport article returned inaccessible and was not treated as verified. No extra candidate expansion.
- PR1 exact-head Project memory run [37544383439](https://github.com/joshuawakefield/aquidneckai/actions/runs/37544383439) independently confirmed successful. This is proposal evidence, not this task's CI. Exact AQ-022 remote/CI proof follows commit and will be reported at closeout.

## Next steps

Parent should review the report and consider the isolated non-public connection-card preview. Freshly reconcile task IDs/proposal branches first; do not reuse AQ-024/AQ-025 or merge either draft automatically. Resolve the event timezone-label inconsistency before conversion and recheck date/conditions before any reader publication. F09 remains open. Parent-reported hourly idle recovery has not been recovery-tested; callbacks remain primary, reporting delivery/limit-resume remain unproven. No successor or schedule is launched here.
