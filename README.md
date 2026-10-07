# AquidneckAI

A useful, free AI information hub for Aquidneck Island residents and businesses, including wider developments when they matter locally.

**Start here: [Project record](docs/README.md).** Agents must read [AGENTS.md](AGENTS.md).

This is the `aqai-local-index` development branch for the replacement site at [staging.aquidneckai.com](https://staging.aquidneckai.com/). The older public site remains on `main`/Netlify. Development commits do not automatically deploy.

- [What we are building and why](docs/PROJECT-CHARTER.md)
- [Current state](docs/PROJECT-STATE.md) and [architecture](docs/ARCHITECTURE.md)
- [Decisions](docs/DECISIONS.md), [backlog](docs/BACKLOG.md), [dated journal](docs/journal/)
- [Cloud / Dot handoff](docs/CLOUD-HANDOFF.md)
- [Schedule and operating costs](docs/reports/2026-10-06-operating-costs.md)

For a clean checkout with Node 22 and Python 3:

```sh
node scripts/cloud-setup.mjs --install
node scripts/cloud-check.mjs
```

Setup installs locked npm dependencies. Checks use fixtures and local loopback only; no production credentials are needed. For an exact change report, run `node scripts/project-check-report.mjs --base <starting-commit> --inventory`; this cheap mode runs no tests. Run the full offline baseline and change-record checks with `node scripts/project-check-report.mjs --base <starting-commit> --run-checks`. See [the local-first workflow](docs/LOCAL-FIRST-WORKFLOW.md) and the cloud handoff for network/access boundaries and migration cautions.
