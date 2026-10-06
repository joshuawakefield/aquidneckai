# Recurring source checks and AI source additions — October 5, 2026

> Historical report, curated for public repository continuity on 2026-10-06. Last-success timestamps describe the October 5 verification, not current source health. Scituate and RTX careers later returned 403 on October 6. Read [PROJECT-STATE](../PROJECT-STATE.md) before acting; this archive does not authorize enrollment, paid calls or deployment.

## Municipality answer

Before this change, 32 of 39 municipalities had recurring collection; seven were only audited and disabled. Cranston and Woonsocket now have deployed, activated replacements with successful collection, bringing recurring coverage to **34 of 39**. The five remaining blocked sites are Burrillville, Central Falls, Exeter, Hopkinton and Smithfield. Their official endpoints return HTTP 403 to the collector; they are not silently counted as active.

Most municipalities are checked daily. Newport council feed and two other municipal feeds run twice daily; existing Middletown and Portsmouth news feeds run every three hours. Collection covers the configured public feed/page, not every document or department site. The scheduler wakes every five minutes but fetches only due sources.

## Added sources and cadence

Public newsletter archives and RSS allow collection without signing up, reading private email, or creating an inbox-processing job. Newsletters/tool directories are discovery inputs; their claims still require evidence review and should be traced to originals when used in reporting. No autonomous enrollment or recurring search-expansion loop is added.

| Source | Check frequency | Coverage / state |
|---|---|---|
| [The AI Collective newsletter](https://newsletter.aicollective.com/archive) | daily | Visible public-page headlines and excerpts only; no linked articles, attachments, private email, paywalled content or automatic site discovery. |
| [There is An AI For That newsletter](https://newsletter.theresanaiforthat.com/) | Not scheduled | Blocked: HTTPError: HTTP Error 403: Forbidden |
| [There is An AI For That tools](https://theresanaiforthat.com/) | weekly | Visible public-page headlines and excerpts only; no linked articles, attachments, private email, paywalled content or automatic site discovery. |
| [The Rundown AI newsletter](https://www.therundown.ai/articles-category/ai) | daily | Visible public-page headlines and excerpts only; no linked articles, attachments, private email, paywalled content or automatic site discovery. |
| [TLDR AI newsletter](https://tldr.tech/ai/archives) | daily | Visible public-page headlines and excerpts only; no linked articles, attachments, private email, paywalled content or automatic site discovery. |
| [DeepLearning AI The Batch](https://www.deeplearning.ai/the-batch) | weekly | Visible public-page headlines and excerpts only; no linked articles, attachments, private email, paywalled content or automatic site discovery. |
| [Bens Bites](https://www.bensbites.com/feed) | daily | Up to 10 recent feed entries with bounded publisher-syndicated text where supplied; no linked-page fetching or paywall access. |
| [Import AI](https://importai.substack.com/feed) | weekly | Up to 10 recent feed entries with bounded publisher-syndicated text where supplied; no linked-page fetching or paywall access. |
| [One Useful Thing](https://www.oneusefulthing.org/feed) | every 3 days | Up to 10 recent feed entries with bounded publisher-syndicated text where supplied; no linked-page fetching or paywall access. |
| [Future Tools AI news](https://futuretools.io/news) | daily | Visible public-page headlines and excerpts only; no linked articles, attachments, private email, paywalled content or automatic site discovery. |
| [CCRI AI initiative](https://ccri.edu/ai/) | weekly | Visible public-page snapshot only; no linked articles, PDFs, embedded calendar records or private course materials. |
| [Rhode Island College news](https://www.ric.edu/news) | daily | Visible public-page snapshot only; no linked articles, PDFs, embedded calendar records or private course materials. |
| [RIC Institute for Cybersecurity and Emerging Technologies](https://our.ric.edu/department-directory/institute-cybersecurity-emerging-technologies) | weekly | Visible public-page snapshot only; no linked articles, PDFs, embedded calendar records or private course materials. |
| [Bryant University news](https://news.bryant.edu/) | daily | Visible public-page snapshot only; no linked articles, PDFs, embedded calendar records or private course materials. |
| [Bryant AI Business Roundtable](https://ai-roundtable.bryant.edu/) | every 3 days | Visible public-page snapshot only; no linked articles, PDFs, embedded calendar records or private course materials. |
| [Johnson and Wales University news](https://www.jwu.edu/news/index.html) | Not scheduled | Blocked: Public HTTP response is an Incapsula JavaScript access-challenge shell with no news text. Requires a supported public feed or permission-compatible adapter; not regular collection. |
| [Providence College news](https://news.providence.edu/feed/) | daily | Public RSS summaries only; no automatic fetching of linked full articles. |
| [RISD AI teaching and learning](https://teachingandlearninglab.risd.edu/teaching-support/tech/ai) | every 3 days | Visible public-page snapshot only; no linked articles, PDFs, embedded calendar records or private course materials. |
| [Bristol Community College AI](https://bristolcc.edu/learnatbristol/degreescertificatesandclasses/computerscience/artificialintelligence.html) | weekly | Visible public-page snapshot only; no linked articles, PDFs, embedded calendar records or private course materials. |
| [Bristol Community College news](https://bristolcc.edu/news/) | daily | Visible public-page snapshot only; no linked articles, PDFs, embedded calendar records or private course materials. |
| [Babson Generator AI events](https://www.babson.edu/thegenerator/community/upcoming-events/) | every 3 days | Visible public-page snapshot only; no linked articles, PDFs, embedded calendar records or private course materials. Current visible listings include past 2026 events; do not infer future status from the page title. |
| [Northeastern Experiential AI events](https://ai.northeastern.edu/events) | every 3 days | Visible public-page snapshot only; no linked articles, PDFs, embedded calendar records or private course materials. Current visible listings include past 2026 events; do not infer future status from the page title. |
| [Cranston government](https://www.cranstonri.gov/community-spotlights/) | daily | Visible municipal spotlight index only; linked articles and PDFs not fetched. |
| [Woonsocket government news](https://www.woonsocketri.gov/m/newsflash?cat=6,1) | daily | Visible official municipal news index only; linked articles and PDFs not fetched. |

## Controls on recurring usage

- News usually daily; slower event/resource pages every three days; program/initiative pages and the large TAFT directory weekly.
- New RSS imports limited to 10 entries, except Providence College capped at 20.
- Unchanged normalized content produces no new observation or AI assessment. Existing durable claims prevent automatic repeat paid calls after uncertain responses.
- HTTP validators retained for seven days, with an unconditional weekly refresh. The prior 24-hour cutoff caused daily pages to miss conditional-download savings.
- RSS text enrichment uses only content already supplied in the feed, bounded to 18,500 characters and the existing 6,000-character assessment input. It does not fetch linked articles.
- General download ceiling stays 3 MB. Only TAFT gets a reviewed 8 MB ceiling (current public response about 6.1 MB), and it is checked weekly. Decompressed data is also bounded.
- Publication candidate filtering moved into SQL so non-calendar/news candidates are not repeatedly sent to a publisher that cannot publish them. JavaScript evidence/date checks still apply.
- CCRI all-news stays daily; overlapping home/archive pages become weekly and the job-fair resource every three days. No record or collected history is removed.
- Bounded collection concurrency remains four; leases, bounded batches, request timeouts and per-source intervals remain intact.
- Existing OpenRouter hard spending cap, publication rules, authentication, and Supabase Free remain unchanged.

The selected additions plus two municipal repairs average 13.52 scheduled fetches/day. Slowing three overlapping CCRI resources removes 2.38/day, for approximately **11.14 net additional fetches/day**. This is a schedule estimate excluding retries, discovery/initial-validation reads and 304 response sizes; it is not a measured billing guarantee.

## Remaining limitations

- TAFT public directory is readable; its separate newsletter returns 403 and remains listed as blocked. JWU news returns a JavaScript access challenge and remains blocked.
- Five municipality sites still block automated collection. No bypass was attempted.
- Public-page snapshots may include historical events, dynamic chrome or several articles together. Unknown dates must not become claims of upcoming events.
- Full linked article/PDF extraction, comprehensive department coverage, per-site volatile-text trimming and external failure notifications remain future work.
- Previous Supabase overage remains visible in billing. These changes reduce avoidable future usage but do not erase historical usage.

## Verification

Predeployment: 22 actual production adapters and Node normalization passed (68 entries); 13 conditional-download, 7 page-parser, 9 syndicated-feed, 7 XML-audit and 14 Node collector/readiness tests passed, plus production authentication/path-isolation smoke. Twenty publication-filter SQL fixture cases passed and rolled back, then the migration was committed separately.

Deployment: remote commit 84fa0342e0254833f9e04f9bf2abe8f966236dfd; catalog digest 62a52d5229b0421d. Manual Hyperlift deployment is complete. Live registry: 269 registered, 208 collecting, 61 awaiting setup. All 22 ready additions/repairs completed successful collection (68 observations), with zero failed sources. /healthz returned 200; private preview returned 401 and public published API returned 200. Apex/Netlify remains unchanged.

The public source tables above retain evidence endpoints, scopes and cadences. The [runtime source catalog](../../scripts/source-catalog.json) retains configured adapter details, and the [prior expansion inventory](2026-10-05-source-expansion.md) records the earlier batch. Private research exports and enrollment snapshots are intentionally omitted from this archive; live verification claims describe the dated checks performed, not a fresh reproduction.

## Live municipality schedule

| Municipality | Frequency | Latest collection |
|---|---|---|
| Barrington | Daily | 2026-10-05T02:54:28.043874+00:00 |
| Bristol | Daily | 2026-10-05T02:54:27.813714+00:00 |
| Burrillville | Blocked; not scheduled | None |
| Central Falls | Blocked; not scheduled | None |
| Charlestown | Daily | 2026-10-05T02:54:22.991196+00:00 |
| Coventry | Daily | 2026-10-05T02:54:22.924287+00:00 |
| Cranston | Daily | 2026-10-05T03:32:42.636709+00:00 |
| Cumberland | Daily | 2026-10-05T02:54:30.830661+00:00 |
| East Greenwich | Daily | 2026-10-05T02:54:24.880909+00:00 |
| East Providence | Daily | 2026-10-05T02:54:25.426553+00:00 |
| Exeter | Blocked; not scheduled | None |
| Foster | Daily | 2026-10-05T02:54:26.343574+00:00 |
| Glocester | Daily | 2026-10-05T02:54:27.2253+00:00 |
| Hopkinton | Blocked; not scheduled | None |
| Jamestown | Daily | 2026-10-05T02:54:29.684859+00:00 |
| Johnston | Daily | 2026-10-05T02:54:29.737902+00:00 |
| Lincoln | Daily | 2026-10-05T02:54:38.453022+00:00 |
| Little Compton | Daily | 2026-10-05T02:54:31.967967+00:00 |
| Middletown | Every 3 hours | 2026-10-05T00:45:08.471751+00:00 |
| Narragansett | Daily | 2026-10-05T02:54:36.18214+00:00 |
| New Shoreham | Daily | 2026-10-05T02:54:34.769967+00:00 |
| Newport | Every 12 hours | 2026-10-05T02:29:27.404488+00:00 |
| North Kingstown | Daily | 2026-10-05T02:54:35.978085+00:00 |
| North Providence | Every 12 hours | 2026-10-05T02:54:35.748843+00:00 |
| North Smithfield | Daily | 2026-10-05T02:54:37.064247+00:00 |
| Pawtucket | Every 12 hours | 2026-10-05T02:54:37.134163+00:00 |
| Portsmouth | Every 3 hours | 2026-10-05T00:45:10.472245+00:00 |
| Providence | Daily | 2026-10-05T02:54:38.503753+00:00 |
| Richmond | Daily | 2026-10-05T02:54:41.986588+00:00 |
| Scituate | Daily | 2026-10-05T02:54:43.826837+00:00 |
| Smithfield | Blocked; not scheduled | None |
| South Kingstown | Daily | 2026-10-05T02:54:44.814381+00:00 |
| Tiverton | Daily | 2026-10-05T02:54:45.951232+00:00 |
| Warren | Daily | 2026-10-05T02:54:48.489596+00:00 |
| Warwick | Daily | 2026-10-05T02:54:50.06748+00:00 |
| West Greenwich | Daily | 2026-10-05T02:54:50.219376+00:00 |
| West Warwick | Daily | 2026-10-05T02:54:51.411873+00:00 |
| Westerly | Daily | 2026-10-05T02:54:51.592931+00:00 |
| Woonsocket | Daily | 2026-10-05T03:32:44.647127+00:00 |

Verified 2026-10-05T03:33:22.595Z. All 208 eligible sources together schedule approximately 274 fetches/day (before retries, initial manual checks or HTTP304 body savings). Snapshot health is not a long-term uptime guarantee.

