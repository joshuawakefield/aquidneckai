# AquidneckAI architecture

Verified baseline: 2026-10-06. Latest deployed application commit: `b34b14e11e2fb7403afddef1fc4004a078620449`. Live counts and provider usage are dated snapshots; refresh narrowly when needed. Read [PROJECT-STATE.md](PROJECT-STATE.md) before acting.

## Deployed surfaces

| Surface | Implementation | Boundary |
|---|---|---|
| Replacement reader | React, TypeScript, Vite; [ReaderHome](../src/pages/ReaderHome.tsx), [resources](../src/data/reader-resources.ts) | `https://staging.aquidneckai.com/`; root still has staging authentication |
| Editorial workspace | Lazy-loaded `/admin` and `/index-preview`; [EditorialReview](../src/components/EditorialReview.tsx) | Existing Basic authentication; no public account system |
| HTTP server and worker | Node 22, Python standard-library collectors, [Dockerfile](../Dockerfile), [production-server](../scripts/production-server.mjs) | One Spaceship Hyperlift app; manual builds, automatic builds off |
| Durable storage | Supabase PostgreSQL, `aq_*` tables and service-only RPCs | Free plan; privileged keys stay server-side; no wholesale database reads |
| Assessment | [classify-new](../scripts/classify-new.mjs), OpenRouter | `google/gemini-2.5-flash-lite`; no Astra/Sol/Luna routing |
| Existing public apex | Older Netlify deployment at `https://aquidneckai.com/` | Separate from staging; no DNS cutover has occurred |

The hosting container's local disk is not durable. Database records are the authoritative runtime state; local caches are recovery aids. Repository documentation records project knowledge, not a database backup or a secret store.

## Collection to publication

1. The serial worker starts a cycle at boot, then waits five minutes after completion. [cycle-runner](../scripts/cycle-runner.mjs) runs collection, assessment, calendar reconciliation and the separate publisher.
2. Claim up to 16 due registry sources; [collection-batch](../scripts/collection-batch.mjs) fetches up to four concurrently. Source eligibility requires enabled configuration and a parsed compatible adapter.
3. RSS, official calendar adapters and bounded public-page watches retain provenance. Content normalization/deduplication prevents unchanged material from creating another observation.
4. Assess up to 80 new/changed observations per cycle. Batches contain at most four observations and 18,000 input characters; output is capped at 2,600 tokens. Exact evidence and valid structure are checked.
5. Ordinary candidates await editorial review. [editorial-handler](../scripts/editorial-handler.mjs) and database functions save drafts/notes, approve, reject or withdraw with version checks and history.
6. [publish-qualified](../scripts/publish-qualified.mjs) has a much narrower automatic rule for verified official AI calendars in the three Island towns. Broad editorial scope does not silently broaden this gate.
7. [reconcile-published-events](../scripts/reconcile-published-events.mjs) uses already collected official-calendar revisions to withdraw explicitly cancelled or rescheduled future events. Absence alone is not cancellation.
8. [published-feed](../scripts/published-feed.mjs) serves only published entries, separates past events, bounds reads to 100 rows and caches/coalesces for 60 seconds. Reader output is capped at 24 current and six past items.

## Durable data and validation

`aq_source_registry` stores configured endpoints and status; `aq_observations` retains source versions; `aq_classification_trials` retains assessment claims/results; `aq_entries` stores canonical editorial/publication state; `aq_editorial_reviews` is append-only decision history. Collection, scheduling and supporting schemas are in [migrations](../supabase/migrations/).

Editorial writes require authentication, same-origin JSON, bounded input, an exact source quote, meaningful reader content and explicit geography. Whole-page watches and stale revisions cannot be approved as articles. Concurrent edits return a conflict rather than overwriting a newer decision. Old rejection/note records remain history when a later approval supersedes them.

Migration history is not reconciled. Applied changes were individually reviewed and checked with rollback fixtures. **Do not run a blanket database push.** SQL files do not prove which migrations a live environment has applied; inspect narrowly and prepare an explicit reconciliation plan.

## Cost and reliability controls

- Dated baseline: 269 registered sources; 208 scheduled; 61 awaiting setup. About 274 checks/day before retries; 34 of 39 municipalities scheduled. Scheduled does not imply healthy. See the [source report](reports/2026-10-05-recurring-sources.md).
- Cadences: 2 sources every 3 hours, 14 every 6 hours, 21 every 12 hours, 157 daily, 6 every 3 days and 8 weekly. Fetch only due sources.
- Conditional HTTP validators avoid unchanged bodies; at least one full refresh weekly. Per-source response/text caps, failure backoff and bounded syndicated text constrain downloads. No general linked-article crawler is deployed.
- Durable assessment claims prevent automatic repeat paid calls after uncertain results. Recover saved output before considering an explicit retry; never erase a claim simply to retry.
- OpenRouter has a **$1 non-resetting key cap**, not a monthly budget. Assessment preflight stops when less than $0.02 remains and checks model price ceilings. Eventual budget maintenance is required; exhaustion must remain visible.
- For the verified schedule and cost scope, use the [operating report](reports/2026-10-06-operating-costs.md). Do not treat a dated usage snapshot as a future bill or an approved new allowance.
- `/livez` is process liveness; `/healthz` may return 503 for upstream failures while the site remains operational. Do not conceal failures by disabling sources.
- Scituate government and RTX Portsmouth careers returned 403 at the last check. Nine assessment exceptions need evidence/judgment review; they are not malformed-output failures.

## What is not implemented

A private Codex Cloud development environment was published October 6; see [handoff](CLOUD-HANDOFF.md). It has no production credentials. Normal parent-coordinated serial development and a scheduled clean-idle wake are now evidenced in the [AQ-020 matrix](OPERATING-MODE.md#aq-020-evidence-matrix--2026-10-06); uninterrupted service and authentic crash/quota recovery are not proven. No model router, Cloudflare AI integration, public chatbot, source-editing dashboard, continuous discovery loop, continuing-topic arcs or sponsor checkout is implied by the working collector. Repository instructions guide future work; each task still needs its own scope and access.

For next work and its access boundaries, use [BACKLOG.md](BACKLOG.md). Keep source collection, editorial publication, GitHub writes, hosting deployments and production DNS changes as distinct operations with evidence for each.


## News-first proposal boundary — October 7

AQ-031's [source-stage audit](reports/2026-10-07-useful-news-source-audit.md) distinguishes adapter configuration, dated scheduling/fetch evidence, assessment, editorial approval and reader display. Existing catalog/feeds and the bounded pipeline remain unchanged. Current assessment rejects non-AI local news; public-page watches are not approvable articles. Feed `published_at` is AquidneckAI approval time, not source publication time, and current output lacks author/publication/check-scope/commercial fields. These are concrete AQ-032 contract/policy-fixture gaps. Two-stream selection and richer provenance in [PR1's proposal](FIRST-RELEASE-DESIGN.md) are prototype behavior only, not integrated application fields or a new schema. Preserve caps, rights/access boundaries and all manual editorial/publication gates.
