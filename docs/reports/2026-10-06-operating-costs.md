# Operating schedule and costs — 2026-10-06

Historical measurement at 20:19:52 UTC, curated for public repository continuity. No paid inference, billing change or purchase was performed for the audit. Values are a dated baseline, not a current balance or guaranteed future bill. Read [PROJECT-STATE](../PROJECT-STATE.md) for current status and authority.

## Schedule

The hosted server runs a cycle at startup and waits **five minutes after each cycle finishes**. This is a serial loop, not an exact clock-time cron job. A cycle claims at most 16 due sources, fetches up to four concurrently, classifies up to 80 new/changed observations, reconciles official-calendar cancellations and runs the narrow publication gate. Sources are not all fetched every five minutes.

| Source interval | Scheduled endpoints | Average checks/day |
|---|---:|---:|
| Every 3 hours | 2 | 16 |
| Every 6 hours | 14 | 56 |
| Every 12 hours | 21 | 42 |
| Daily | 157 | 157 |
| Every 3 days | 6 | 2 |
| Weekly | 8 | 1.14 |
| **Total** | **208** | **274.14** |

There were 269 registered endpoints: 208 scheduled and 61 awaiting setup. Scheduled is not synonymous with healthy: Scituate government and RTX Portsmouth careers returned HTTP 403. The prior 24 hours contained 271 collection runs: 269 succeeded, two failed and 199 observations were new. The estimate is about 8,224 scheduled checks per 30 days, before retries; it is not a bandwidth estimate. Thirty-four of 39 municipalities were scheduled, including failing Scituate; five remained unscheduled. See [recurring-source scope](2026-10-05-recurring-sources.md).

Intervals are relative to source-check completion. Unchanged normalized content does not create another assessment. Conditional requests retain validators, with a full refresh at least weekly. Volatile navigation/calendar text can still create low-value changed versions; source-specific trimming is backlog work.

General articles require editorial approval; only narrowly qualified official local calendar items can publish automatically. Approved changes should reach the cached feed within roughly two minutes without a rebuild. Code builds remain manual.

## Costs and safeguards

| Component | Verified baseline | Interpretation |
|---|---|---|
| Spaceship Hyperlift Small | **$6.48/month**, active subscription UI | Monthly prepaid hosting for the web server and continuous worker together. Invoice/tax not inspected. |
| Supabase Free | **$0/month** | No upgrade. Then-published limits included 500 MB database, 5 GB uncached egress and a separate 5 GB cached quota; cached quota is not extra database REST bandwidth. Recheck provider limits before future planning. |
| OpenRouter inference | **$0.143272701 total site-key usage; $0.103097016 in the provider calendar month so far** | Usage-based, not a monthly subscription. Includes initial ingestion, development and repairs on the same site key. |
| Domain/email and retained Netlify apex | Separate existing services | Invoices and renewal amounts not audited; excluded from subtotal. |
| Cloudflare | No verified cost assigned here | No Cloudflare AI inference is wired into this worker. A reported possible subscription was not verified as a runtime dependency or bill. |

The known fixed subtotal was **$6.48/month plus measured inference**, before tax and separate existing services. A **$7–8/month core operating allowance** was a provisional planning estimate for the current small-model workload, not an invoice or a promise. The short sample includes nonrecurring repairs and initial ingestion. Personal/development subscriptions are deliberately omitted from this public operational report; they are not consumed by the deployed collector.

OpenRouter reported a **$1 non-resetting key cap**, with **$0.856727299 remaining**. This is a lifetime allowance for that key, not $1/month. Assessment preflight refuses a new run when less than $0.02 remains; the provider also enforces the cap. Eventual deliberate budget maintenance is necessary. No cap or refill setting was changed by this audit.

The deployed classifier is `google/gemini-2.5-flash-lite`; the then-verified rates were $0.10/million input tokens and $0.40/million output tokens. Batches have at most four observations, 18,000 input characters and 2,600 output tokens. Price preflight stops if configured ceilings are exceeded. The provider's allowlisted key-usage response is the authoritative aggregate because repair operations can replace current database ledger reports. Astra/Sol/Luna routing is not implemented in the runtime.

OpenRouter described a 5.5% Standard platform credit-purchase fee, separately from inference deductions. No credit purchase occurred in the audit; adding that fee to the ledger and presenting it as an observed invoice would be incorrect.

## Evidence and limits

- Active hosting subscription UI, bounded database cadence/cost counters and allowlisted provider key-usage fields were inspected. Private snapshots, account identifiers and login context are not published here.
- Runtime references: [production server](../../scripts/production-server.mjs), [cycle runner](../../scripts/cycle-runner.mjs), [collection batch](../../scripts/collection-batch.mjs), [classifier](../../scripts/classify-new.mjs), [assessment batches](../../scripts/assessment-batches.mjs).
- Provider references consulted during the audit: [Spaceship Hyperlift](https://www.spaceship.com/starlight-cloud/hyperlift/), [Supabase pricing](https://supabase.com/pricing), [Supabase egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress), [OpenRouter model](https://openrouter.ai/google/gemini-2.5-flash-lite), [OpenRouter pricing](https://openrouter.ai/pricing), [OpenRouter billing FAQ](https://openrouter.ai/docs/faq).
- Database usage dashboard was not reread during this audit. The [October 1 incident](2026-10-01-egress-reduction.md) measured 6.668 GB for the September 16–October 16 interval. Optimizations do not erase historical usage or guarantee a future free-quota total.

## October 7 owner test-budget clarification

The existing **$1 non-resetting cap is a test budget**, intended to burn slowly over repeated, perhaps daily checks. Roughly **$0.10 is an owner estimate**, not a newly verified balance, lifetime usage or monthly usage observation. Keep the October 6 measured snapshot above separate; no provider/account check was made in AQ-033. Future incremental dollar-by-dollar funding may be considered if actual usefulness and usage are acceptable, but no payment, refill or cap increase is authorized now.

HTTP source checks and paid model assessment must be accounted for separately. Conditional fetches, unchanged-200 content reuse, reviewed syndication deduplication, bounded discovery/cadence and saved-response reconciliation should avoid repeatedly paying to assess the same material. The [AQ-033 report](2026-10-07-technology-source-evaluation.md) documents zero source HTTP/model calls and $0 incremental API spend, a pure replay helper, proposed ceilings and activation gates. Those proposals do not alter the running worker, existing caps or current Gemini/OpenRouter safeguards, and do not predict a daily/monthly bill. The user-named “OpenAI Decisions API” is a deferred idea with availability unverified; no migration/provider research or router now.
