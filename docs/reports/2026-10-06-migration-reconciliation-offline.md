# AQ-002 offline migration inventory and reconciliation preparation

Recorded: 2026-10-06 UTC. Repository evidence pinned to `6836574088189c40de6ef22bf353eb210db01afa` on `aqai-local-index`.

**Offline portion complete; live comparison blocked/unverified.** No SQL was executed, no database was connected, and no migration was generated, changed, applied, reset, pushed or repaired. This is a preparation report, not a fresh-database bootstrap, applied-state certification or rollback guarantee. AQ-002 remains blocked for live criteria. PR1/PR2 remain unmerged proposals; neither is part of this inventory.

## Inventory and declared order

All tracked SQL is covered: **13 migrations (796 lines), 7 SQL fixtures**. Migration filename versions are unique valid 14-digit timestamps, from `20260916011500` through `20261006193000`. Lexical order is declared order, not actual execution time. There are **zero duplicate versions and zero byte-identical migration files**. The files declare **10 tables and 12 distinct function names/signatures across 22 function definitions**; eight functions have successive definitions. No repository migration ledger, down migrations, seed SQL or Supabase config is tracked. All 13 migrations entered this Git history together in handoff commit `76124489465df5eb06b805103f3c0fd537e78ee0`; file dates are not Git application evidence.

SHA-256 below covers exact file bytes, including line endings. Files 09/10 use CRLF; the others use LF. Do not normalize the source files to make checksums match. Numbers are local report references, not new migration IDs. All paths are under `supabase/migrations/`.

| Order / filename version and path | SHA-256 (raw bytes) | Declared change | Dependencies / assumptions | Replay and historical evidence |
|---|---|---|---|---|
| 01 [20260916011500_aqai_foundation.sql](../../supabase/migrations/20260916011500_aqai_foundation.sql) | `eeaa3ca5e204a80e1dcee2cf57f7103540cf3bc91a696a7afc786c6f9f6f3583` | Foundation: four tables, three indexes, six disabled legacy seeds. | Supabase roles and gen_random_uuid(); no earlier app table. | Run-once CREATE and INSERT; collision aborts explicit transaction. H1. |
| 02 [20260916023000_aqai_registry.sql](../../supabase/migrations/20260916023000_aqai_registry.sql) | `42e71b2f06143ca1c7bf826403858a94d4852b8e1066bd770f6c11947a48f2c2` | Registry and imports: definition JSON, source identity, disabled-by-default runtime. | Supabase roles; no FK from import_sha256 to imports. | Run-once tables in transaction; does not populate registry. H1. |
| 03 [20260916024500_aqai_archive_chunks.sql](../../supabase/migrations/20260916024500_aqai_archive_chunks.sql) | `5921bed2cfa7ba5a6dedd047ca8d805fc5177a15259ecded88b074610797d6b7` | Archive chunks keyed by import hash/part. | Supabase roles; logically paired with imports but no FK. | Run-once table; no explicit transaction wrapper. H1. |
| 04 [20260916030000_aqai_source_checks.sql](../../supabase/migrations/20260916030000_aqai_source_checks.sql) | `88c48df02874ec92d47bc2c2abf14197fc4b0953245ab5a1918ee0fdb04b3414` | Source checks keyed by source/time/kind. | 02 registry FK. | Run-once table; no explicit transaction wrapper. H1. |
| 05 [20260916031500_aqai_classification_trials.sql](../../supabase/migrations/20260916031500_aqai_classification_trials.sql) | `b7dd58cfbbe19a4d8a5fb8631f98f18ae6c8b150cf3debb74a3ea1632d9dcef8` | Classification trials keyed by request_id, JSON report. | Supabase roles; observation link is application convention, no FK. | Run-once table; no explicit transaction wrapper. H1. |
| 06 [20260916040000_aqai_collector.sql](../../supabase/migrations/20260916040000_aqai_collector.sql) | `b2e5353354a5ba147ddd83328323ba8b47356f07179b39f2db1ae0937e10f54b` | Retarget two source FKs to registry; add schedule/lease columns and run new_item_count; create claim/finish RPCs. | 01, 02, 04; legacy runs/observations must already match registry; exact FK names. | Run-once columns/functions; transactional FK drop/recreate. Replay unsafe. H2. |
| 07 [20260916102000_aqai_calendar_sources.sql](../../supabase/migrations/20260916102000_aqai_calendar_sources.sql) | `960c7181086d18721f3ba9143e19cd490c2f1edc8bfc864621a1caf46a3724da` | Change salve-events definition/URL; disable runtime, reset schedule/lease; claim limit 7→8. | 06 plus pre-existing salve-events row from outside migrations. | CREATE OR REPLACE does not make DML harmless: rerun disables source and clears lease. H3. |
| 08 [20261001090000_aqai_bounded_reads.sql](../../supabase/migrations/20261001090000_aqai_bounded_reads.sql) | `30fa18f02513026931cbef642d50cac4cde62a617e91a2df7c8d489a3c2e3b50` | Six read RPCs; two IF NOT EXISTS indexes; limits for assessment/publication/review. | 01, 02, 05, 06; review_records precedes dependent page/summary. | Plain CREATE FUNCTION is not replayable; index name existence does not verify definition. H4. |
| 09 [20261002090000_aqai_conditional_downloads.sql](../../supabase/migrations/20261002090000_aqai_conditional_downloads.sql) | `f82df88574da1783cb4166c2660de5bb5d7f36e6bd685067a5506088a5d055a9` | Replace finish RPC with conditional-v1 HTTP cache and validated not_modified handling. | 06 registry/lease/checks shape; caches stored in JSON, no new column. | Replacement preserves signature but replay after 10 reverts newer behavior. H5. |
| 10 [20261005090000_aqai_source_expansion.sql](../../supabase/migrations/20261005090000_aqai_source_expansion.sql) | `8350bdfd651d4ca94389aa526d4b0133c4f8c780c2ed0187ffd83aeceb381caa` | Add eligibility helper; replace claim/health/preview/finish/pending; page watches, limit 16, due ordering, diagnostics. | 06, 08; carries forward 09 cache contract; definition JSON supplied elsewhere. | Replacement-only DDL, no enrollment DML; signatures/dependencies/ACL still required. H6. |
| 11 [20261005100000_aqai_publication_candidate_filter.sql](../../supabase/migrations/20261005100000_aqai_publication_candidate_filter.sql) | `cf56fce32603c677df44cedacc06eeeb1040cf74bc69ab855dba666634fada89` | Replace publication_candidates with stricter official-calendar prefilter. | 08 and source/report JSON conventions; publisher retains final gate. | Replacement-only; wrong order can restore weaker filtering. H7. |
| 12 [20261005110000_aqai_editorial_review.sql](../../supabase/migrations/20261005110000_aqai_editorial_review.sql) | `f5bb9c9f683dbee4f504a4ddc762859841926d1c5d16b7836a7b7c72bfe9ed04` | Editorial table and two indexes; state/save/reconcile RPCs; replace review_records. | 01, 02, 05, 08; new review table, URL/version uniqueness, advisory locking. | Run-once table/functions; replacement of review_records retains its signature and existing ACL. H8. |
| 13 [20261006193000_aqai_review_readiness_order.sql](../../supabase/migrations/20261006193000_aqai_review_readiness_order.sql) | `682cb52b2a00451317edf004e1ced2f97dc4d3281759664b883e846c3da482f8` | Replace review_page: individual/current candidates first, other filters by recency. | 08 review_records/page plus registry; intended final state includes 12 editorial semantics. | Replacement-only; 08 has older ordering and its plain CREATE collides with existing functions. H9. |

Ten files have explicit BEGIN/COMMIT wrappers; 03/04/05 do not. They contain multiple statements, so partial application is possible depending on the original client transaction. No wrapper is proof of historical atomic application. Files 06–13 issue PostgREST schema reload notifications; catalog parity alone does not prove API cache freshness. Nothing here authorizes a notification or API invocation.

## Historical applied-state evidence (not independently verified now)

| Ref | Repository evidence | What it supports, and what remains unknown |
|---|---|---|
| H1 | [Curated history, September 15–16](2026-10-06-project-history-through-handoff.md) | Equivalent compact foundation SQL manually applied; four tables/six seeds/RLS read back. Registry/import/archive manually created; source checks and one saved classification pilot reported. Does not establish byte equivalence to 01–05 or ledger rows. |
| H2 | Same history, collector paragraph | Explicit application of 06 and rolled-back lease/replay/dedup fixtures reported. No current definition/hash/history export. |
| H3 | Same history, Salve calendar paragraph | 07 manually applied, according to narrative; subsequent runtime flags changed separately. No current row/lease state established. |
| H4 | [October 1 egress report](2026-10-01-egress-reduction.md) | Additive helpers applied/committed, rollback fixtures and later deployment reported. Report explicitly warns tracking is unreconciled. No ledger export. |
| H5 | [October 2 conditional-download report](2026-10-02-conditional-downloads.md) | Names 09 as applied alone. No proof current finish body still equals 09 (10 intentionally supersedes it). |
| H6 | [Source expansion report](2026-10-05-source-expansion.md) and curated October 4–5 history | Runtime coverage/rollout evidence is indirect for 10, not exact applied SQL or ledger evidence. Registry enrollment occurred outside migrations. |
| H7 | [Recurring-source report](2026-10-05-recurring-sources.md), predeployment paragraph | Twenty publication-filter SQL cases reportedly passed/rolled back, then migration committed separately. No present catalog capture. |
| H8 | Curated October 5–6 history; [state](../PROJECT-STATE.md) | Deployed versioned editorial behavior and rollback fixtures reported; behavioral evidence, not exact 12 bytes/ledger reconciliation. |
| H9 | 13 and its fixture in repository | No explicit per-file applied-state proof found in reviewed canonical/historical reports. Repository presence and UI behavior alone do not establish this body is deployed. |

All live statuses remain **unknown**. Historical runtime counts and tested fixtures must not be copied into a current comparison as measured results.

## Expected final object and application contracts

| Object / consumer evidence | Expected repository contract to compare |
|---|---|
| `aq_sources` (01, 06) | Legacy six-source seed retained; not current collector authority. Do not delete it or treat its disabled seeds as current registry state. |
| `aq_source_registry`, `aq_registry_imports`, `aq_registry_archive_chunks` (02/03/06) | Registry PK source_id, definition object/source identity check, runtime disabled default, schedule and leases. The identity CHECK can pass NULL when definition.source_id is missing; required JSON keys remain an application assumption. Import/hash/archive provenance exists without enforcing cross-table hash FKs. Migrations do not recreate the populated source registry. |
| `aq_collection_runs`, `aq_observations`, `aq_source_checks` (01/04/06) | Source FKs point to registry after 06; observation run FK, version uniqueness `(source_id,url,content_hash)`, nonnegative original item_count fields (new_item_count has no added CHECK). No composite FK enforces observation.source_id equals its run.source_id; runtime logic supplies that relationship. |
| `aq_classification_trials`; [classifier](../../scripts/classify-new.mjs), [recovery](../../scripts/recover-assessments.mjs) | PK request_id; `observation-v1:<uuid>` joins by convention. Durable claims, statuses, saved input/result and retry markers live inside report JSON; no typed schema validates those fields. Never infer current lifetime usage from trial costs or reset claims as reconciliation. |
| `aq_entries`; [published feed](../../scripts/published-feed.mjs), [publisher](../../scripts/publish-qualified.mjs) | Unique canonical_url; observation FK; kind/status checks; published rows need publication time, nonempty AI/local evidence and towns. Event times are timestamptz. Feed expects selected reader columns and bounded published-only queries. Table constraint alone is weaker than editorial/publisher policy. |
| `aq_editorial_reviews`; [editorial handler](../../scripts/editorial-handler.mjs) | Unique `(canonical_url,version)` and observation FK; service role SELECT/INSERT only, no UPDATE/DELETE grant. Append-only is privilege/application intent, not an owner-proof immutable trigger. Review JSON/version/note/evidence/URL locks and rejection/withdrawal history must survive. |
| [collector](../../scripts/collect-feeds.mjs), [source readiness](../../scripts/source-readiness.mjs) | Claim/finish RPC signatures below, ten-minute leases, at most 16 due claims, finish replay and dedup, conditional-v1 cache validation. Definition JSON includes monitor_enabled/mode, poll_interval_minutes, municipality, endpoint_type and adapter-specific fields; existence of a table does not validate JSON or source readiness. |
| [preview](../../scripts/preview-handler.mjs), [budget display contract](../../scripts/inference-budget.mjs) | Preview/review RPCs return existing JSON keys, bounded candidate/review pages and evidence on demand. Current preview SQL has no provider-usage snapshot; unavailable budget is expected, not schema drift. |
| [calendar reconciliation](../../scripts/reconcile-published-events.mjs) | Reconciliation RPC can withdraw and append history; never invoke it as read-only inspection. Source absence alone is not cancellation. |

Every declared app table enables RLS, with no CREATE POLICY in these migrations. They revoke client/PUBLIC access and grant service access; 12 narrows editorial-table grants. Functions use SECURITY INVOKER and `search_path=public,pg_temp`; reads are STABLE, eligibility IMMUTABLE, write RPCs use default VOLATILE. Check actual owners, effective role membership/privileges, RLS/force flags, policies, default ACLs and function signatures: declarations do not prove live security. Default privileges and extra objects may exist outside repository scope. No triggers, extensions or custom roles are created by these migrations; the existing Supabase roles and UUID capability are prerequisites.

| Function identity (public schema) | Definition succession by inventory number | Latest expected contract |
|---|---|---|
| `aq_claim_feed_sources(boolean)` | 06 → 07 → 10 | Due-order, eligibility helper, limit 16; **writes** leases/runs. |
| `aq_finish_feed_run(text,uuid,jsonb)` | 06 → 09 → 10 | Conditional cache, mode-specific check kind/error diagnostics; **writes**. |
| `aq_pending_assessments(integer,boolean)` | 08 → 10 | Limit 80, public-page endpoint override, durable reassessment guard. |
| `aq_publication_candidates(text,integer)` | 08 → 11 | Limit 80; unpublished official calendar in Island towns; final evidence gate remains JS. |
| `aq_health_summary()` | 08 → 10 | Eligibility helper, failedSources and dated aggregate. |
| `aq_preview_summary()` | 08 → 10 | Source diagnostics, at most 100 candidates; all-source list/counts are not a whole-history export. |
| `aq_review_records()` | 08 → 12 | Human actions supersede model queue decisions without rewriting trial report. Internal unpaginated helper: do not call live for inventory. |
| `aq_review_page(text,text,integer,integer)` | 08 → 13 | Candidate readiness/archive ordering; limit ≤50, offset ≤1,000,000. |
| `aq_source_eligible(jsonb,text)` | 10 | RSS/feed_parsed, calendar/api_parsed, public_page/page_parsed. |
| `aq_editorial_state(uuid)` | 12 | Latest revision guard, URL version, entry/draft, last ten review actions. |
| `aq_save_editorial_review(jsonb)` | 12 | Optimistic version and URL advisory lock; validation then **writes/publication**. |
| `aq_reconcile_calendar_publications(integer)` | 12 | At most 50 explicit calendar changes; **writes/withdrawals**. |

These are intentional replacements, not duplicate versions. Comparing the current body against every historical body would invent mismatches. Replacement compatibility also depends on exact argument names/defaults, return types, volatility, security, search path and grants, not just names.

## SQL fixture inventory and limitations

SQL fixture files are executable writes even where they end with ROLLBACK. None was run in this task. They are not down migrations, backups, or proof of recovery after commit.

| Path | SHA-256 (raw bytes) | Relevant limitation |
|---|---|---|
| [test-bounded-reads.sql](../../scripts/test-bounded-reads.sql) | `0e67d838f551fdc6405867d42581b1b1eb1ff05b0b29820e0ca2624b1663888a` | Own BEGIN/ROLLBACK; needs prior schema and non-conflicting fixture rows. |
| [test-collector-database.sql](../../scripts/test-collector-database.sql) | `e378b70f5360da3613113ceb400d605151b2053c593b075dedfcbf95a1a5ceed` | Own BEGIN/ROLLBACK; assumes no enabled eligible sources and exactly seven pilot claims. Historical fixture is not a safe generic current-schema test. |
| [test-conditional-downloads.sql](../../scripts/test-conditional-downloads.sql) | `93ccfa3b066582ebdd015f4fb6936c6e7136877cc5f4864965812efda5b36f3d` | Ends ROLLBACK but no outer BEGIN; requires the stated migration transaction context. |
| [test-editorial-review.sql](../../scripts/test-editorial-review.sql) | `54064b2d8f8bfe9bc0fd2cbda994ea7d11fa883b98e7059d41413b9ff336226c` | DO block; requires enclosing migration transaction changed to rollback in a disposable test copy, never source edits/live execution here. |
| [test-publication-filter.sql](../../scripts/test-publication-filter.sql) | `7cd3311ef73f1639bbc5f4b23bb7cbe74db3be8f8b276ca15aa61009baf0e568` | Own BEGIN/ROLLBACK; inserts sources/runs/observations/trials to exercise publisher prefilter. |
| [test-review-readiness-order.sql](../../scripts/test-review-readiness-order.sql) | `226798e5d521c1967c774efe502f7fe84d2fad7f0edd4f089ddc3d7f302cc8bf` | DO block; requires enclosing rollback transaction; tests source mode/archive ordering and role privileges. |
| [test-source-expansion.sql](../../scripts/test-source-expansion.sql) | `9948c6db7937671c814d60aa246a26b3b5f25b69ab560c63dd5d4e224c22f802` | DO block; requires enclosing rollback transaction; latest function prerequisites. |

## Reconciliation questions and comparison strategy

1. Does a readable migration ledger exist, and which versions are recorded? Missing rows do not prove missing objects; recorded versions do not prove their current definitions or byte identity. Supabase compares migration timestamps, and history repair inserts/deletes ledger records without applying/undoing schema. Do not use repair to silence an unexplained difference. [Supabase CLI reference](https://supabase.com/docs/reference/cli/supabase-migration-repair).
2. Do all ten tables, twelve exact function signatures and seven explicitly named indexes exist, with the expected columns, constraints, FKs, ACLs and latest bodies? Separate missing, extra, different and not-visible objects. Unrelated schemas are out of scope; unknown dependencies require bounded follow-up, not deletion.
3. Was the compact manual foundation semantically equivalent to 01–05? Compare defaults, checks, PKs/uniques, FK targets and privileges; a matching table name is insufficient. Are partial non-transactional applications visible?
4. Are source FKs actually retargeted to registry? Can later data be restored with those relationships? Are registry/import/archive records available privately for a future restore? No migration reconstructs them. The calendar prerequisite makes a naive empty-schema chronological replay incomplete.
5. Are function replacements the final expected bodies, including preserved ACLs on review_records? Have later manual changes or overloads appeared? Preserve unexplained objects and investigate provenance.
6. How are read-only role visibility limits distinguished from absence? Have effective client grants/role inheritance or RLS policies changed? Do not automatically grant extra access or query through the application service key to bypass a missing inspection permission.
7. Is actual data compatible with proposed reconciliation? Live content/JSON shape, references, lease state and durable claims are **not inspected by the catalog queries below**. If needed, design separately approved bounded aggregate checks after catalog review; do not bulk export or publish rows.

Produce a private matrix: repository version/checksum, ledger presence, object/signature, expected latest defining file, observed definition/security, evidence timestamp, classification, explanation and proposed action. All observed cells start **unverified**. Match versions as strings; compare objects by schema/name/signature. Inspect normalized decompiled definitions semantically (whitespace, explicit casts and qualification can differ). `pg_get_functiondef` reconstructs a definition rather than returning original SQL, so its hash must not be compared directly to the raw migration hash. [PostgreSQL catalog functions](https://www.postgresql.org/docs/current/functions-info.html).

Capture metadata in one short consistent read transaction; no worker interruption for this read-only phase. If a result exceeds the proposed caps or times out, record incomplete evidence and refine scope; do not silently truncate and declare parity. Recheck changed contracts if development advances. SQL parsing/replay, API cache verification and application behavior tests on a disposable restored database are later gates, not executed evidence here.

## Proposed future read-only inspection commands — NOT EXECUTED

Separate authorization must name the target and permit narrow metadata/history reads. Use an already approved least-privilege inspection connection. Verify target identity privately; keep host, role/account identifiers, credentials, function bodies and raw outputs outside Git. Do not print environment values. A private libpq service alias below is illustrative, **not configured here**. No new credential/permission setup is authorized by this report. If no approved connection exists, stop this phase.

Place the reviewed SQL blocks in a private file only during that future task. A proposed invocation (not run):

```sh
PGSERVICE=aqai-review PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=10000 -c lock_timeout=2000 -c idle_in_transaction_session_timeout=30000' \
  psql -X --no-password --set=ON_ERROR_STOP=1 \
  --file=/approved/private/aqai-catalog-review.sql \
  --output=/approved/private/aqai-catalog-review.txt
```

Expected: successful connection to the privately verified target, read-only settings, ordered catalog results, then ROLLBACK. Authentication/permissions errors mean blocked evidence, not permission expansion. `-X` ignores startup files; stop-on-error prevents continuing after a failed query. Use restrictive private directory/file permissions; never put output under this repository. The transaction modes below prevent ordinary persistent data/DDL writes and give a consistent snapshot; this is not a claim that read-only mode prevents every disk write. [PostgreSQL transaction documentation](https://www.postgresql.org/docs/current/sql-set-transaction.html).

Stage A: metadata inventory. Filters use a literal `aq_` prefix and return **catalogs only**, not app rows or RPC results. Inspect output privately; cap is 1,001 rows per category, with any result over 1,000 considered incomplete and requiring a narrower follow-up.

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL search_path = pg_catalog;
SET LOCAL statement_timeout = '10s';
SET LOCAL lock_timeout = '2s';
SET LOCAL idle_in_transaction_session_timeout = '30s';
SELECT current_timestamp AS captured_at,
       current_setting('server_version') AS server_version,
       current_setting('transaction_read_only') AS read_only,
       current_setting('transaction_isolation') AS isolation;
-- Expected: read_only=on; isolation=repeatable read. Version is unknown now.

SELECT to_regclass('supabase_migrations.schema_migrations') IS NOT NULL AS ledger_exists;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='supabase_migrations' AND table_name='schema_migrations'
ORDER BY ordinal_position LIMIT 1001;
-- Expected: existence true/false; visible ledger columns, if permitted.
-- Zero visible columns can mean insufficient visibility, not an empty ledger.

SELECT c.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity,
       c.relowner::regrole AS owner, c.relacl
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND left(c.relname,3)='aq_'
ORDER BY c.relkind,c.relname LIMIT 1001;
-- Expected from repository: 10 ordinary tables plus indexes; no declared views.

SELECT c.relname, a.attnum, a.attname, format_type(a.atttypid,a.atttypmod) AS type,
       a.attnotnull, a.attidentity, a.attgenerated,
       pg_get_expr(d.adbin,d.adrelid) AS default_expression
FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
WHERE n.nspname='public' AND left(c.relname,3)='aq_'
  AND c.relkind IN ('r','p') AND a.attnum>0 AND NOT a.attisdropped
ORDER BY c.relname,a.attnum LIMIT 1001;

SELECT c.relname, k.conname, k.contype, k.convalidated,
       pg_get_constraintdef(k.oid,true) AS definition
FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND left(c.relname,3)='aq_'
ORDER BY c.relname,k.conname LIMIT 1001;
SELECT c.relname, i.indexrelid::regclass AS index_name,
       i.indisvalid, i.indisready, pg_get_indexdef(i.indexrelid) AS definition
FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND left(c.relname,3)='aq_'
ORDER BY c.relname,i.indexrelid::regclass::text LIMIT 1001;
-- Expected: constraints/defaults from inventory, two source FKs to registry;
-- seven explicit indexes plus indexes supporting primary/unique constraints.

SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS identity_arguments,
       pg_get_function_arguments(p.oid) AS arguments_with_defaults,
       pg_get_function_result(p.oid) AS result,
       p.provolatile, p.prosecdef, p.proconfig, p.proowner::regrole AS owner,
       p.proacl, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND left(p.proname,3)='aq_' AND p.prokind='f'
ORDER BY p.proname,identity_arguments LIMIT 1001;
-- Expected: 12 signatures above; no calls to aq_* functions are made.

SELECT * FROM pg_policies
WHERE schemaname='public' AND left(tablename,3)='aq_'
ORDER BY tablename,policyname LIMIT 1001;
SELECT c.relname, t.tgname, pg_get_triggerdef(t.oid,true) AS definition
FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND left(c.relname,3)='aq_' AND NOT t.tgisinternal
ORDER BY c.relname,t.tgname LIMIT 1001;
-- Expected repository declarations: zero policies and zero custom triggers.
-- Any observed extras need explanation; do not remove them.

SELECT r.rolname,c.relname,
       has_table_privilege(r.oid,c.oid,'SELECT') AS can_select,
       has_table_privilege(r.oid,c.oid,'INSERT') AS can_insert,
       has_table_privilege(r.oid,c.oid,'UPDATE') AS can_update,
       has_table_privilege(r.oid,c.oid,'DELETE') AS can_delete
FROM pg_roles r CROSS JOIN pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE r.rolname IN ('anon','authenticated','service_role')
  AND n.nspname='public' AND left(c.relname,3)='aq_' AND c.relkind IN ('r','p')
ORDER BY r.rolname,c.relname LIMIT 1001;
SELECT r.rolname,p.proname,pg_get_function_identity_arguments(p.oid) AS arguments,
       has_function_privilege(r.oid,p.oid,'EXECUTE') AS can_execute
FROM pg_roles r CROSS JOIN pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE r.rolname IN ('anon','authenticated','service_role')
  AND n.nspname='public' AND left(p.proname,3)='aq_' AND p.prokind='f'
ORDER BY r.rolname,p.proname,arguments LIMIT 1001;
SELECT rolname,rolsuper,rolinherit,rolbypassrls
FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role') ORDER BY rolname;
SELECT defaclrole::regrole AS owner,defaclnamespace::regnamespace AS schema,
       defaclobjtype,defaclacl FROM pg_default_acl
WHERE (defaclnamespace=0 OR defaclnamespace='public'::regnamespace)
  AND defaclrole IN
    (SELECT c.relowner FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
     WHERE n.nspname='public' AND left(c.relname,3)='aq_'
     UNION
     SELECT p.proowner FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE n.nspname='public' AND left(p.proname,3)='aq_')
ORDER BY defaclrole,defaclnamespace,defaclobjtype LIMIT 1001;
-- Expected app grants: clients false; service true except editorial UPDATE/DELETE false.
-- Inspect PUBLIC ACL entries too; role flags/default ACLs are environment assumptions,
-- not asserted by migrations. Effective ACL checks do not simulate row-level access.

SELECT pg_describe_object(d.classid,d.objid,d.objsubid) AS dependent,
       pg_describe_object(d.refclassid,d.refobjid,d.refobjsubid) AS referenced,
       d.deptype
FROM pg_depend d
WHERE (d.refclassid='pg_class'::regclass AND d.refobjid IN
       (SELECT c.oid FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND left(c.relname,3)='aq_'))
   OR (d.refclassid='pg_proc'::regclass AND d.refobjid IN
       (SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='public' AND left(p.proname,3)='aq_'))
ORDER BY dependent,referenced,d.deptype LIMIT 1001;
-- Catalog dependencies are supplemental: textual SQL/PLpgSQL and JS references
-- may not be represented. Retain the manual dependency map above.
ROLLBACK;
```

Stage B: only after Stage A confirms the history relation, a `version` column and sufficient read permission, run this separate short read-only transaction through the same connection/settings. Otherwise record absent/not-visible/inaccessible and stop. Do not create the ledger. Names/statements and other fields are deliberately excluded; even version presence is not checksum equivalence.

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL search_path = pg_catalog;
SET LOCAL statement_timeout = '10s';
SET LOCAL lock_timeout = '2s';
SELECT current_timestamp AS captured_at;
SELECT version FROM supabase_migrations.schema_migrations
ORDER BY version LIMIT 1001;
ROLLBACK;
```

Expected: zero or more actual version strings, count and set unknown today. More than 1,000 means incomplete. Compare with the 13 repository version strings; retain actual applied order uncertainty because a version sort is not an execution chronology. If definitions/history change between stages, capture again within the approved scope before concluding.

Do not run application RPCs (even via SELECT), SQL fixtures, workers, migrations, `db pull`, `db push` (including dry-run), migration repair/up/down/reset/squash or CLI linking as shortcuts for this inspection. In particular, pull can generate a file and offer a history update; it is not this read-only catalog procedure. [Supabase CLI reference](https://supabase.com/docs/reference/cli/supabase-migration-repair).

## Baseline options after evidence — no choice authorized for application

| Option | When it could fit | Required gate / caveat |
|---|---|---|
| Preserve history and document verified manual equivalence; later repair only proven ledger entries | Current schema and all latest contracts are explained, but old manual application lacks ledger entries | Proven object/security/data compatibility, private backup and restore rehearsal, reviewed exact ledger-only change under separate write authority. Never mark absent/different objects applied. Repair does not undo or install schema. |
| New reviewed baseline representing a verified live snapshot, archive old provenance | Compact/manual history cannot be reconstructed reliably | Separately authorize baseline generation, dependency/role/security review and isolated replay. Preserve all original checksums/history; include separately reviewed data/bootstrap prerequisites. Schema-only baseline cannot recover registry, observations, editorial decisions or paid-attempt claims. No squash or delete now. |
| Reconstruct chronological history in a disposable environment | Historical sequence is valuable and missing prerequisites can be supplied as synthetic fixtures | Supply Supabase-compatible roles/capabilities and synthetic registry row before 07; account for manual imports. No production enrollment. Replay and fixture adaptation require a later SQL-authorized task; success would still not prove live equivalence. |
| Leave history unreconciled temporarily and block schema changes | Missing permission, unknown objects, absent recovery evidence or ambiguity | Safest present status. Continue unrelated repository work; do not let future source CRUD presume clean migration replay. |

## Backup/restore prerequisites and rollback caveats

Before any future repair or schema write, agree a recovery objective, acceptable downtime/data-loss window, target scope and responsible operator. Verify an existing recovery mechanism on Supabase Free without assuming paid PITR, an automatic backup entitlement or buying a plan. Keep backups encrypted/private outside Git with retention, access controls, timestamp, integrity hash and documented retrieval. A catalog inventory is not a backup.

A recovery package must cover schema definitions/owners/ACL/RLS, relevant role/extension prerequisites, migration ledger and durable app data: source registry/import/archive provenance, observations/runs/checks, entries/editorial history and classification claims/results. Assess external dependencies and any service-managed schemas separately; an app-only dump may be insufficient. Record tool/server versions and a consistent snapshot boundary. Backup/dump commands are deliberately not prescribed as an executable live step before this scope and existing recovery capability are established.

Rehearse restoration in an isolated compatible environment with production networking, workers, inference and publication disabled. Verify integrity and relationships, row counts privately, latest function/security contracts, claim/replay safeguards and editorial/version history; use synthetic fixture checks and record actual restore duration. A restorable file and known recovery point, not a successful backup exit alone, are the prerequisite. No restoration was attempted here.

Transaction rollback can cancel an uncommitted reviewed change; it cannot undo already committed editorial decisions, collector activity or external paid calls. Restoring an older backup can discard new content/history and resurrect already-used paid claims or leases. A Git revert does not revert a database. Replacing a function with an older definition can break newer callers or weaken filtering; retain reviewed prior definitions and compatible application versions before any change. Dropping tables/columns is not an acceptable generic rollback. Post-commit recovery needs an explicit plan for concurrent writes, worker quiescence (separate authorization), catch-up/dedup and uncertain paid outcomes. Ledger-only reversal does not reverse schema. No rollback guarantee is made.

## Offline verification and next action

The [task journal](../journal/2026-10-06-2315Z-migration-inventory.md) records executed checks, allowlist and remote closeout. A deterministic Python standard-library snippet below is sufficient to reproduce file hashes/order and duplicate checks; no permanent helper or dependency is needed. Run from the repository root. This performs filesystem reads only and was run during this task.

```sh
python3 - <<'PY'
from pathlib import Path
from hashlib import sha256
from collections import Counter
from datetime import datetime
files = sorted(Path('supabase/migrations').glob('*.sql'))
versions, hashes = [], []
for path in files:
    version = path.name.split('_', 1)[0]
    assert len(version) == 14 and version.isdigit(), path
    datetime.strptime(version, '%Y%m%d%H%M%S')
    digest = sha256(path.read_bytes()).hexdigest()
    versions.append(version)
    hashes.append(digest)
    print(path.as_posix(), digest)
print('migration files:', len(files))
print('duplicate versions:', sum(n-1 for n in Counter(versions).values()))
print('duplicate byte hashes:', sum(n-1 for n in Counter(hashes).values()))
PY
```

Expected offline output: the 13 exact paths/hashes above, migration files 13, duplicate versions 0, duplicate byte hashes 0. This validates filenames/bytes only, not SQL syntax or runtime correctness.

Remaining AQ-002 blocker: separately authorized, least-privilege live catalog/history evidence, then comparison and verified recovery prerequisites. The current task ends after repository closeout; no successor or schedule is launched. Latest coordinator priority: **AQ-020 recovery proof** after verifying this remote commit/CI and confirming no writer; exercise supported wake-up recovery and record what actually happens before resuming one bounded authorized successor. Recovery remains untested. **AQ-023** usage-snapshot design is an independent successor candidate without provider calls, runtime wiring or schema changes. Future source-management schema work must retain the AQ-002 gate.
