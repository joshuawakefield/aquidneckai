# Local-first and script-first workflow

This guide separates tasks that can be completed reproducibly with local scripts from work that still needs semantic judgment or live access. It implements the October 7 owner direction recorded in [D-034](DECISIONS.md); it does not widen runtime, provider, database or deployment authority.

## Existing deterministic work

| Task | Local implementation | What it can establish | What it cannot establish |
|---|---|---|---|
| Project tests, type-check, build and loopback auth smoke | `scripts/cloud-check.mjs` | Results of the exact offline commands on this checkout | Staging, public behavior, live source health or database state |
| Project memory, links and change record | `scripts/check-project-memory.mjs`, `scripts/test-project-memory.mjs` | Required document presence, relative links, dated journal format, and state/journal changes versus a Git base | Whether the prose is accurate, complete or useful |
| News provenance normalization | `scripts/offline/news-provenance.mjs`, `scripts/test-news-provenance.mjs` (AQ-032) | Allowed fields, dates, URLs, evidence pointers and display labels for supplied records | The truth of a claim, whether a fetched page contains an individual story, or permission to republish |
| Technology/source evaluation | `scripts/offline/technology-scope.mjs`, `scripts/offline/evaluate-technology-scope.mjs`, `scripts/test-technology-scope.mjs` (AQ-033) | Explicit rubric outcomes for supplied, reviewed annotations and fixtures | Whether annotations are right, current source health or editorial importance |
| Reuse and uncertain-result replay | `scripts/offline/candidate-reuse.mjs`, `scripts/offline/replay-candidate-reuse.mjs`, `scripts/test-candidate-reuse.mjs` (AQ-035) | Deterministic reuse, hold and review outcomes from supplied metadata | Current web content, a database result, or authorization for paid reassessment |
| Local project report | `scripts/project-check-report.mjs` and its regression tests (AQ-036) | Repository branch/head/base, changed file list, available checks, and actual outcomes when explicitly run | Any result for a command marked `not_run`; it never imports a CI result or infers success |

The root `scripts/cloud-check.mjs` inventory is the complete offline regression/build baseline. Its tests use fixtures and loopback only; it rejects a Node version other than 22. The new report wrapper does not reimplement those checks.

## Run the report

Use the full starting commit captured before editing. With locked dependencies installed:

```sh
node scripts/project-check-report.mjs --base "$STARTING_COMMIT" --inventory
node scripts/project-check-report.mjs --base "$STARTING_COMMIT" --run-checks --format json
```

The first command is a cheap inventory/status snapshot and runs no tests. Its checks are explicitly marked `not_run`; it is not a pass. The second command runs the report's own nonrecursive regression suite, existing offline project suite, continuity tests and project-memory diff check, capturing each command's actual exit code, duration and bounded/redacted diagnostic tails. It requires Node 22 and has a 10-minute total check budget; timed-out commands trigger process-tree cleanup (POSIX process group; Windows taskkill `/T`) and report cleanup outcome. A blocked, failed, timed-out or skipped check cannot produce a `passed` report. JSON is the default; use `--format text` for a concise human-readable summary.

The report writes only to stdout. It uses the existing offline network guard, preserves `PATH` and the documented `AQAI_CLOUD_PYTHON` tool override, and drops service credentials and proxy settings from child processes. No source reads, database operations, inference, migrations, worker runs, deployments or external writes occur. To run the wrapper through npm, use `npm run check:local -- --base "$STARTING_COMMIT" --run-checks`.

## Script first, model only for residual judgment

1. Before asking a model to inspect, count, normalize, compare, validate, replay or summarize repetitive project state, inspect `scripts/` and this inventory. If a checked-in deterministic command fully covers the task, run it and use its output directly.
2. If an existing script covers only part of the work, use it for the exact part it establishes. A missing value remains unknown; a script's result never upgrades an unreviewed annotation into a fact.
3. Write a new local script only when the repeated behavior is bounded, has explicit input/output rules and can be covered by fixtures. Prefer extending an existing contract over duplicating it.
4. Keep source/story accuracy, reader usefulness, local relevance, news priority, real-world source identity/rights and publication decisions with human review. A model can help form a candidate judgment when useful, but it cannot be replaced by a keyword score or checklist alone.
5. For the residual model-assisted work, use the least expensive model that has demonstrated reliable results against that task's acceptance criteria. Escalate only when evidence shows the cheaper option misses the quality bar or the decision's stakes require stronger review. Evaluate before changing provider or routing; preserve the current model, caps and approved spending boundaries unless separately changed.

## Next script candidate

**Priority 1: local closeout/journal skeleton from a checked report.** If repeated closeouts show real overhead after AQ-036, a follow-on script may consume the JSON report and emit a reviewable journal skeleton with actual base/head, changed paths and command outcomes. Acceptance criteria: preserve the five journal headings and UTC filename; require an explicit output path or print to stdout; default to `in progress`; never invent rationale, next steps or completion; fail closed on missing/malformed report data and failed/incomplete checks; include fixture tests for pass/fail/timeout and missing fields; make no network, API, model or project-state writes.

Do not build another source-scoring/reuse harness: AQ-032/033/035 already cover deterministic provenance, explicit annotation rules and replay. A real news edition remains an editorial task requiring accessible story evidence. A follow-on script should be proposed only when a repeated, deterministic step with available local inputs is demonstrated.
