# Project history through the portable handoff — 2026-10-06

This curated historical narrative preserves milestones, corrections and reasons from the earlier local project diary. It is not a raw transcript, current authorization or a claim that every historical task remains open. [PROJECT-STATE](../PROJECT-STATE.md), [DECISIONS](../DECISIONS.md) and [BACKLOG](../BACKLOG.md) govern resumption. Secret placement, account identifiers, login sessions, machine paths, unrelated account details and private exports are intentionally omitted.

## September 15–16: establish an evidence-backed pipeline

The starting repository was a marketing site. The product discussion favored a low-maintenance AI information hub with explicit sources, useful local interpretation and eventual sponsorship. Existing public hosting was preserved while a replacement developed on `aqai-local-index`.

A six-page discovery pilot established that reachable websites were not necessarily usable feeds. Empty attributes and parser errors required honest handling; AI boilerplate was not meaningful AI news. An imported registry was preserved with provenance and private access. Canonical source identities replaced an early parallel pilot model without deleting history.

The early database foundation was applied manually as equivalent compact SQL; readback confirmed four tables, six disabled public-source seeds, row-level security and blocked client reads. Registry, imports and archive-chunk tables were manually created and checked; the three registry/archive tables had private access, and reconstructed import content was verified by hash. Source-check persistence was confirmed with seven checks. The classification-trials table later had one verified saved pilot report. These observations establish historical schema/data verification, **not a reconciled live migration ledger**.

Seven RSS endpoints produced 66 observations in an initial bounded collection. Repeated collections produced zero duplicate versions. Collector migration `20260916040000_aqai_collector.sql` was explicitly applied; rolled-back fixtures checked disabled-source scheduling, exclusive leases, finish replay and deduplication. Leases, atomic completion, due-source scheduling and immutable observation hashes were tested before unattended activation. A small Gemini Flash Lite trial found useful Salve research entries but missed their old dates; deterministic date routing moved them into archive review. Subsequent speculative AI positives led to an exact-quote/explicit-AI guard rather than trusting model enthusiasm.

Each immutable observation received a durable assessment claim. Ambiguous paid work would not silently retry. The frontend used a backend proxy rather than exposing database credentials. Early UI was an editorial index, not yet an adequate reader homepage.

Hyperlift staging deployed with server-side secrets, protected root/private APIs, a public published-only feed and manual builds. The runtime used external durable storage because the hosting filesystem was not persistent. The original Netlify apex and mail/DNS were preserved.

Salve's official calendar required a dedicated API adapter; its research RSS did not include the current events. Calendar migration `20260916102000_aqai_calendar_sources.sql` was manually applied. A narrow automatic publication rule admitted verified local AI calendar items and initially published two September events. Source-accessibility checks and runtime flags were explicitly distinguished from proven recurring collection: setting 188 flags did not make 188 working adapters.

## September 18–19: broaden feeds, repair response handling

Eleven validated RSS adapters brought eligible coverage to 19. Each later completed three successful runs without duplicate versions. An incomplete model batch left claimed work unresolved; the initial explanation of exhausted OpenRouter credit was corrected after measured preflight showed remaining credit. Interactive Codex limits and hosted-worker credit were separate systems.

Saved responses recovered eight records without inference; one controlled reassessment repaired 33 others for **$0.003298878**. Paid responses were persisted before parsing, per-item faults became visible review cases, and excerpt cleanup improved the input signal. An authenticated inspection panel exposed source evidence and guard reasons. Final staging commit `831b3db` was verified on September 19. See [recovery](2026-09-19-assessment-recovery.md).

## October 1–2: fix bandwidth waste, then conditional downloads

Supabase reported **6.668 GB** in the active 5 GB uncached allowance despite a small database. Repeated full history reads, dashboard evidence downloads and health queries explained avoidable transfer. The owner's explicit constraint was to retain Free.

Pending work and publication candidates moved to bounded database selection; review became paginated/on-demand; health and public responses were cached/coalesced. Runtime images stopped carrying frontend dependencies. Tests and rolled-back SQL fixtures passed; staging commit `a4e1f5b` deployed without deleting history. Small serialized responses proved the bulk-read waste was removed, not that future traffic could never exceed quota. See [egress report](2026-10-01-egress-reduction.md).

ETag/Last-Modified persistence and correct 304 handling followed. Compatible dependency maintenance reduced the point-in-time audit from 24 advisories to zero. Two hosting image-registry timeouts were infrastructure failures before compilation; a later manual retry deployed `6ecf750e` successfully. The initial daily full-refresh rule was later lengthened to weekly because a 24-hour cutoff negated conditional savings for daily sources. See [conditional-download report](2026-10-02-conditional-downloads.md).

## October 4–5: make wider coverage real and bounded

The next expansion activated **117** verified existing sources: seven feeds and 110 bounded page watches. It deliberately excluded portal/widget shells with no usable content. Oldest-due selection, four-way bounded concurrency, per-source failure isolation, byte-limited gzip decoding and separate liveness/health improved reliability.

A one-time semantic research project compared all 39 RI municipalities with the official directory and selected state support, university, regional reporting, frontier-model and research sources. Fifty verified additions plus nine explicit blockers brought the registry to **247 registered / 186 eligible / 61 awaiting setup**. Discovery was not turned into a recurring autonomous expansion job. See [source expansion](2026-10-05-source-expansion.md).

The owner then requested newsletters, AI collectives, tool directories and nearby universities. Twenty working additions plus two blocked records were enrolled; Cranston and Woonsocket adapters were repaired. Final coverage reached **269 registered / 208 scheduled / 61 awaiting setup**, with **34 of 39 municipalities scheduled**. Five towns remained blocked. Bounded syndicated content, source cadences and a large-directory exception kept downloads controlled. Estimated checks averaged **274/day**. See [recurring sources](2026-10-05-recurring-sources.md).

## October 5–6: create a reader product and usable editorial decisions

A Newport resident/business-owner audit found that staging led with an operational inbox, raw evidence and two expired events. The replacement separated the reader homepage from private editorial work: eight source-backed resources, practical business exercises, clear provenance, useful search, honest empty/error states and a past-event archive. The admin bundle loads separately. Date-only values retain their calendar day.

Human editorial decisions became persistent, versioned and auditable. Exact evidence, meaningful summaries/usefulness and explicit geography were required; whole-page snapshots and stale revisions could not be published as articles. Calendar reconciliation withdrew future events only on explicit cancellation or changed start time, not disappearance. Worker shutdown and saved-response recovery were also tightened.

An obsolete three-town assessment gate conflicted with the owner's broad relevance intent. **126** saved results were corrected without inference. **68** incomplete outputs were repaired in 18 bounded requests for **$0.00887733** total. Nine genuine evidence/judgment exceptions remained, rather than being hidden or auto-approved. Tighter four-item batches reduced future malformed-output risk.

The reader/editorial package deployed as `219bc369` after tests, database rollback fixtures and explicit staging upload approval. Live desktop/mobile checks confirmed the behavior. Two upstream endpoints later returned 403; degraded health remained visible while liveness and the reader API worked.

The owner next reported that Approve appeared unresponsive on the Naval War College AI conference story. Required reader fields were empty and feedback appeared too far above the buttons. The story was verified and approved as news about an already-held event; its earlier note and rejection remained history, not duplicate articles. Commit `b34b14e` placed requirements/errors near actions, preserved drafts and passed focused tests/live checks.

The cost audit confirmed $6.48/month core hosting plus small usage-based inference. Crucially, the $1 OpenRouter cap was **non-resetting**, not monthly; the runtime still used Gemini Flash Lite, not the desired future Astra/Sol/Luna router. See [operating costs](2026-10-06-operating-costs.md).

## Why the repository-context handoff is necessary

Earlier GitHub uploads deliberately contained reviewed runtime files only. The local diary, tests, migration files and reports were generally excluded, so an agent starting from GitHub lacked important rationale and validation context. The owner's October 6 request changes that documentation objective: publish reviewed portable project knowledge so continuation does not depend on one machine.

Canonical charter, architecture, decisions, backlog and current state replace a growing diary as the entry point. Date-first reports preserve measurements and resolved mistakes without letting stale checkpoints masquerade as current instructions. Actual GitHub publication and fresh-environment verification must be recorded separately; writing this history alone does not prove either step succeeded.
