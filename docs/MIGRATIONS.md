# Database migration inventory

Reviewed offline on 2026-10-06. This inventory makes the schema design and test evidence portable; it is **not a verified database bootstrap, backup, or live migration ledger**. No SQL was executed during this handoff.

Supabase migration history remains unreconciled. Do not run `supabase db push`, blindly replay this directory, repair the migration ledger, or execute fixtures against the live database. Compare the live catalog and migration ledger through approved read-only access first; propose the exact reconciliation and restoration procedure under [AQ-002](BACKLOG.md).

## What is and is not preserved

The [13 migration files](../supabase/migrations/) contain schema/RPC definitions, permission restrictions, six public discovery-source seeds, and a public Salve calendar endpoint adjustment. The seven fixtures below contain synthetic records. Offline inspection found no credentials, private account/project identifiers, actual editorial decisions, or database exports in these 20 SQL files. They are copied unchanged; publishing their design does not grant access to the database.

The canonical source registry, original imported YAML, observations, classification results, and editorial history are runtime data and are **not reconstructed by these files**. In particular, `20260916102000_aqai_calendar_sources.sql` deliberately fails unless a `salve-events` registry row already exists; the foundation seeds the separate legacy `aq_sources` table, not that canonical row. A fresh database needs an explicitly designed initialization sequence and reviewed seed data. No such initialization sequence has been validated.

## Historical application evidence

Dates below are migration filename dates in UTC. "Recorded applied" means earlier operator checkpoints report successful manual application or verified resulting tables. It does **not** establish a matching live migration-history row, byte-for-byte equivalence with this file, or that each historical function definition remains current after later replacements. Live schema/ledger status is **unverified for every row** in this offline inventory.

The September confirmations are preserved in the [curated project history](reports/2026-10-06-project-history-through-handoff.md); recent editorial work is recorded in the [visitor tracker](VISITOR-EXPERIENCE-TRACKER.md).

| Date / migration | Purpose | Evidence recorded before this handoff |
| --- | --- | --- |
| 2026-09-16 — [foundation](../supabase/migrations/20260916011500_aqai_foundation.sql) | Private sources, collection runs, observations and published entries; six disabled discovery seeds. | Recorded applied as equivalent compact SQL. The September 15 evening checkpoint verified four tables, six sources, RLS and blocked client reads. |
| 2026-09-16 — [registry](../supabase/migrations/20260916023000_aqai_registry.sql) | Canonical endpoint registry and original import archive. | Registry-handoff checkpoint records manual creation/application and verified persisted registry/import data; ledger not reconciled. |
| 2026-09-16 — [archive chunks](../supabase/migrations/20260916024500_aqai_archive_chunks.sql) | Chunk transport for the source-import archive. | Registry-handoff checkpoint records three registry/archive tables, archive reconstruction and private permissions. Exact file-vs-live equivalence not checked. |
| 2026-09-16 — [source checks](../supabase/migrations/20260916030000_aqai_source_checks.sql) | Private source-check history. | First-classification checkpoint records table creation and verification of seven persisted checks. |
| 2026-09-16 — [classification trials](../supabase/migrations/20260916031500_aqai_classification_trials.sql) | Private durable inference claims/reports. | First-classification checkpoint's final confirmation records one persisted trial/report after manual table creation. |
| 2026-09-16 — [collector](../supabase/migrations/20260916040000_aqai_collector.sql) | Retarget foreign keys to canonical registry; leases, scheduling and idempotent completion RPCs. | Explicit recorded application; historical rollback checks for disabled scheduling, leases, replay and deduplication passed. |
| 2026-09-16 — [calendar sources](../supabase/migrations/20260916102000_aqai_calendar_sources.sql) | Configure existing Salve Localist source; calendar/RSS scheduling. | Explicit recorded manual application in calendar deployment checkpoint. Requires imported registry data. |
| 2026-10-01 — [bounded reads](../supabase/migrations/20261001090000_aqai_bounded_reads.sql) | Bounded assessment/publication/review queries and compact health/preview summaries. | October 1 egress report records passing rollback fixtures followed by this additive migration's separate application. |
| 2026-10-02 — [conditional downloads](../supabase/migrations/20261002090000_aqai_conditional_downloads.sql) | Persist HTTP validators; safe not-modified handling without duplicate observations. | October 2 conditional-download report records rollback checks and application of this file alone. |
| 2026-10-05 — [source expansion](../supabase/migrations/20261005090000_aqai_source_expansion.sql) | Public-page eligibility, oldest-due scheduling, diagnostics and bounded assessment context. | Source-expansion checkpoint explicitly records successful application after rollback fixtures. Activation/import was a separate operation. |
| 2026-10-05 — [publication filter](../supabase/migrations/20261005100000_aqai_publication_candidate_filter.sql) | Exclude sources that cannot satisfy existing automatic-publication policy before transferring text. | October 5 recurring-source report records 20 rollback fixture cases and separate successful application. |
| 2026-10-05 — [editorial review](../supabase/migrations/20261005110000_aqai_editorial_review.sql) | Append-only decisions, versioned review, publication validation and calendar reconciliation. | [Visitor tracker](VISITOR-EXPERIENCE-TRACKER.md) records October 6 rollback checks, individual application and service readback. |
| 2026-10-06 — [review readiness order](../supabase/migrations/20261006193000_aqai_review_readiness_order.sql) | Prioritize individual feed/calendar candidates while preserving other filters. | [Visitor tracker](VISITOR-EXPERIENCE-TRACKER.md) records October 6 rollback checks, individual application and live queue readback. |

## SQL fixtures are manual, mutating tests

Use a disposable development database with the required schema, Supabase roles, and explicit transaction control. These fixtures invoke real functions and insert/update rows inside their test transactions; rollback does not make running them on production an acceptable default. Some are **fragments**, not standalone rollback scripts. None belongs in a cloud setup script, application startup, or an automatic CI job pointed at a live database.

| Fixture | Coverage and transaction requirement |
| --- | --- |
| [test-collector-database.sql](../scripts/test-collector-database.sql) | Own `BEGIN`/`ROLLBACK`; historical seven-source pilot assumptions and real scheduler claims. Not a current general-purpose collector test. Adapt an isolated database fixture first. |
| [test-bounded-reads.sql](../scripts/test-bounded-reads.sql) | Own `BEGIN`/`ROLLBACK`; limits, durable claims, pagination/search, duplicate exclusion and permissions. Some assertions depend on database-wide pending counts. |
| [test-conditional-downloads.sql](../scripts/test-conditional-downloads.sql) | Cache persistence, replay and uncached-304 rejection. Has final `ROLLBACK` but **no opening `BEGIN`**; requires an already-open transaction. |
| [test-source-expansion.sql](../scripts/test-source-expansion.sql) | Page eligibility, claims, persistence, diagnostics and permissions. **No transaction wrapper**; requires an explicit surrounding `BEGIN`/`ROLLBACK`. Scheduler calls can touch other due sources within that transaction. |
| [test-publication-filter.sql](../scripts/test-publication-filter.sql) | Own `BEGIN`/`ROLLBACK`; source-policy filtering, duplicate suppression, keyset pagination and permissions. Uses deliberately synthetic low UUIDs. |
| [test-editorial-review.sql](../scripts/test-editorial-review.sql) | Evidence/date validation, version conflicts, decisions and conservative event reconciliation. **No transaction wrapper**; requires surrounding `BEGIN`/`ROLLBACK`. Reconciliation can inspect and alter other eligible records within that transaction. |
| [test-review-readiness-order.sql](../scripts/test-review-readiness-order.sql) | Candidate readiness order, other filters, search/pagination, bounds and private permissions. **No transaction wrapper**; requires surrounding `BEGIN`/`ROLLBACK`. |

Past passes establish evidence for their historical schema/data state. The fixtures were inspected but **not rerun** for this repository handoff. See [current state](PROJECT-STATE.md) and [architecture](ARCHITECTURE.md) before planning database work.
