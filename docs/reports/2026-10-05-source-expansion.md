# AquidneckAI source expansion — October 4–5, 2026

> Historical report, curated for public repository continuity on 2026-10-06. Counts describe the 02:55 UTC October 5 batch, not current state. Later coverage is in [recurring sources](2026-10-05-recurring-sources.md); current decisions and permissions come from [PROJECT-STATE](../PROJECT-STATE.md). This archive is evidence, not authorization to rerun enrollment.

## Result and limits

Existing sources: 117 additional sources unlocked (7 feeds, 110 public-page watches), bringing existing operational coverage from 19 to 136. Fifty-two existing endpoints still require a working adapter or access repair.

Semantic discovery: 59 selected additional records — 50 verified for collection, nine awaiting setup. All 39 Rhode Island municipalities checked against the official state directory; existing Newport, Middletown and Portsmouth records reused. Live enrollment is complete: 247 registered, 186 collecting, 61 awaiting setup. All 50 newly researched sources completed actual collection successfully (289 observations); all 117 newly unlocked existing sources also completed collection. Health returned HTTP 200 with zero failed sources.

Sources were chosen by topic and useful role: municipal policy/procurement, state AI/business support, regional universities and journalism, frontier AI, open models, standards, and economic/workforce research. Discovery was a one-time operation, not an autonomous search-expansion loop.

Public-page watches collect bounded visible text. They do not collect every linked article, agenda PDF, embedded calendar, login portal or video transcript. Feeds contain supplied titles/descriptions, capped at 40 items for the new batch. Evidence without a reliable date stays subject to review; merely mentioning AI does not authorize publication.

## Efficiency and reliability work completed

- Retained conditional HTTP requests, saved validators and no-body handling for 304 responses.
- Added bounded parallel collection with independent source failure handling. A broken source no longer cancels otherwise successful collection. Database persistence failures still stop the run.
- Claim oldest-due sources first so lower-priority sources do not starve.
- Separate process liveness from data-source health, avoiding database health reads every container check and avoiding restarts caused by an upstream source failure.
- Bound newly added feeds to 40 entries: avoids loading entire OpenAI and Hugging Face archives into assessment queues.
- Decode gzip responses with both compressed and expanded byte limits.
- Preserve article headings and AI-bearing passages within existing assessment limits.
- Recognize unambiguous model names as AI evidence while rejecting ordinary names.
- Repair four stale official municipal URLs and avoid redundant municipal homepage/news enrollment.
- Broaden classification to the agreed regional/national/global AI scope without inventing a local connection.

## Remaining limitations / findings

- Existing bot blocks, login-only pages, empty JavaScript widgets and unsupported APIs need individual adapters or access arrangements. The dashboard records their reasons rather than presenting them as collecting.
- Page snapshots can include changing calendar/weather/navigation text. This can create low-value changed versions; a future per-site content selector would reduce that further.
- Full linked-article/PDF extraction remained separate work. Official-calendar cancellation reconciliation was subsequently deployed October 6; see [architecture](../ARCHITECTURE.md).
- Migration history remained unreconciled. The original report repeated an older dependency-advisory concern; the October 2 point-in-time audit had already reported zero advisories. A later audit is needed for any current security claim; see [dependency maintenance](2026-10-02-conditional-downloads.md).
- Historical Supabase egress is not undone by these changes. No paid upgrade was made; future usage must be judged from the usage meter. Existing inference cap and publication gates remain in place.

## Newly researched registry additions

| Source | Area | Collection | Endpoint |
|---|---|---|---|
| Barrington government news | Barrington | public_page | https://www.barrington.ri.gov/m/newsflash?cat=1 |
| Bristol government news | Bristol | public_page | https://www.bristolri.gov/m/newsflash?cat=1 |
| Burrillville government | Burrillville | Awaiting setup | https://www.burrillville.org/ |
| Central Falls government | Central Falls | Awaiting setup | https://www.centralfallsri.us/ |
| Charlestown government news | Charlestown | public_page | https://charlestownri.gov/news |
| Coventry government | Coventry | public_page | https://coventryri.gov/ |
| Cranston government | Cranston | Awaiting setup | https://www.cranstonri.gov/ |
| Cumberland government news | Cumberland | public_page | https://www.cumberlandri.gov/m/newsflash?cat=1 |
| East Greenwich government news | East Greenwich | public_page | https://www.eastgreenwichri.gov/m/newsflash?cat=21 |
| East Providence government news | East Providence | public_page | https://eastprovidenceri.gov/files-docs?title=&field_department_tid=All&field_agenda_minutes_category_tid=All&field_document_type_tid=127 |
| Exeter government | Exeter | Awaiting setup | https://www.town.exeter.ri.us/ |
| Foster government news | Foster | public_page | https://www.townoffosterri.gov/m/newsflash |
| Glocester government | Glocester | public_page | https://www.glocesterri.gov/ |
| Hopkinton government | Hopkinton | Awaiting setup | https://www.hopkintonri.org/ |
| Jamestown government | Jamestown | public_page | https://www.jamestownri.gov/ |
| Johnston government news | Johnston | public_page | https://www.johnstonri.gov/m/newsflash |
| Lincoln government news | Lincoln | public_page | https://www.lincolnri.gov/m/newsflash?cat=59,34,54,58,30,43,51,1,57,22,19,50,47,52,25,45 |
| Little Compton government news | Little Compton | public_page | https://www.littlecomptonri.org/newslist.php |
| Narragansett government news | Narragansett | public_page | https://www.narragansettri.gov/m/newsflash?cat=7 |
| New Shoreham government news | New Shoreham | public_page | https://www.newshorehamri.gov/m/newsflash?cat=1 |
| North Kingstown government news | North Kingstown | public_page | https://www.northkingstownri.gov/m/newsflash?cat=24,19,16 |
| North Providence government | North Providence | rss | https://northprovidenceri.gov/feed/ |
| North Smithfield government news | North Smithfield | public_page | https://www.nsmithfieldri.gov/m/newsflash?cat=1 |
| Pawtucket government news | Pawtucket | rss | https://pawtucketri.gov/feed/ |
| Providence government | Providence | public_page | https://www.providenceri.gov/ |
| Richmond government news | Richmond | public_page | https://www.richmondri.gov/m/newsflash?cat=1 |
| Scituate government | Scituate | public_page | https://www.scituateri.gov/ |
| Smithfield government | Smithfield | Awaiting setup | https://www.smithfieldri.com/ |
| South Kingstown government news | South Kingstown | public_page | https://www.southkingstownri.gov/m/newsflash?cat=28 |
| Tiverton government news | Tiverton | public_page | https://www.tiverton.ri.gov/m/newsflash?cat=1 |
| Warren government | Warren | public_page | https://www.townofwarren-ri.gov |
| Warwick government | Warwick | public_page | https://www.warwickri.gov/ |
| West Greenwich government news | West Greenwich | public_page | https://www.wgtownri.org/m/newsflash |
| West Warwick government | West Warwick | public_page | https://westwarwickri.gov/ |
| Westerly government | Westerly | public_page | https://westerlyri.gov/ |
| Woonsocket government | Woonsocket | Awaiting setup | https://www.woonsocketri.org/ |
| Rhode Island AI Hub | Rhode Island | public_page | https://ai.ri.gov/ |
| Rhode Island AI Hub business | Rhode Island | public_page | https://ai.ri.gov/programs-initiatives/business |
| Rhode Island Small Business Coalition | Rhode Island | rss | https://www.risbc.org/blog-feed.xml |
| SCORE Rhode Island | Rhode Island | Awaiting setup | https://www.score.org/ri/rhode-island/ |
| Brown Professional Studies news | Providence | public_page | https://professional.brown.edu/news |
| Brown Data Science Institute news | Providence | public_page | https://dsi.brown.edu/news |
| Roger Williams University news | Bristol | public_page | https://www.rwu.edu/news |
| UMass Dartmouth news | South Coast Massachusetts | public_page | https://www.umassd.edu/news/ |
| UMass Dartmouth business news | South Coast Massachusetts | public_page | https://www.umassd.edu/charlton/news/ |
| URI Rhody Today | Rhode Island | rss | https://www.uri.edu/news/feed/ |
| Rhode Island Governor news | Rhode Island | rss | https://governor.ri.gov/press-releases.xml |
| NIST AI news | United States | public_page | https://www.nist.gov/news-events/news-updates/topic/2753736 |
| SBA AI for small business | United States | public_page | https://legacy.sba.gov/business-guide/manage-your-business/small-business-ai-basics |
| OpenAI news | Global | rss | https://openai.com/news/rss.xml |
| Anthropic news | Global | public_page | https://www.anthropic.com/news |
| Google DeepMind news | Global | rss | https://deepmind.google/blog/rss.xml |
| Hugging Face blog | Global | rss | https://huggingface.co/blog/feed.xml |
| Microsoft news | Global | rss | https://news.microsoft.com/source/feed/ |
| Rhode Island Current AI | Rhode Island | public_page | https://rhodeislandcurrent.com/tag/ai/ |
| New Bedford Light | South Coast Massachusetts | rss | https://newbedfordlight.org/feed/ |
| Stanford HAI news | Global | Awaiting setup | https://hai.stanford.edu/news |
| Stanford Digital Economy Lab | Global | public_page | https://digitaleconomy.stanford.edu/news/ |
| MIT AI news | Global | rss | https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml |

## New sources awaiting setup

| Source | Observed blocker |
|---|---|
| Burrillville government | HTTPError: HTTP Error 403: Forbidden |
| Central Falls government | HTTPError: HTTP Error 403: Forbidden |
| Cranston government | ValueError: NoUsablePublicContent |
| Exeter government | HTTPError: HTTP Error 403: Forbidden |
| Hopkinton government | HTTPError: HTTP Error 403: Forbidden |
| Smithfield government | HTTPError: HTTP Error 403: Forbidden |
| Woonsocket government | HTTPError: HTTP Error 403: Forbidden |
| SCORE Rhode Island | HTTPError: HTTP Error 403: Forbidden |
| Stanford HAI news | ValueError: NoUsablePublicContent |

## Existing sources awaiting setup

| Source ID | Observed blocker |
|---|---|
| arcfield-careers | Public page contains no usable listings; dedicated portal/widget collector required. |
| crossref-works-api | API query/authentication or platform-specific access needs a dedicated collector |
| dod-contracts | HTTP Error 403: Forbidden |
| dvids-nuwcdn-news-search | UnexpectedHTTPStatus |
| dvids-nuwcdn-video-search | UnexpectedHTTPStatus |
| grants-gov-search | Public page contains no usable listings; dedicated portal/widget collector required. |
| innovate-newport-events | Public page contains no usable listings; dedicated portal/widget collector required. |
| middletown-clerkbase | Public page contains no usable listings; dedicated portal/widget collector required. |
| middletown-gov-agendas | Public page contains no usable listings; dedicated portal/widget collector required. |
| middletown-gov-rss-directory | Public page contains no usable listings; dedicated portal/widget collector required. |
| middletown-schools-committee-calendar | NoUsablePublicContent |
| middletown-schools-technology | NoUsablePublicContent |
| mrc-current-openings | Public page contains no usable listings; dedicated portal/widget collector required. |
| navsea-warfare-centers-news | HTTP Error 403: Forbidden |
| newport-daily-news-home | HTTP Error 403: Forbidden |
| newport-engage | NoUsablePublicContent |
| newport-gov-bids | Public page contains no usable listings; dedicated portal/widget collector required. |
| newport-gov-events | NoUsablePublicContent |
| newport-gov-home | NoUsablePublicContent |
| newport-gov-jobs | NoUsablePublicContent |
| newport-gov-news | NoUsablePublicContent |
| newport-schools-facebook | API query/authentication or platform-specific access needs a dedicated collector |
| nuwc-careers | HTTP Error 403: Forbidden |
| nuwc-home | HTTP Error 403: Forbidden |
| nuwc-news-category | HTTP Error 403: Forbidden |
| nuwc-news-tag | HTTP Error 403: Forbidden |
| ocean-tech-hub-events | NoUsablePublicContent |
| ocean-tech-hub-opportunities | Public page contains no usable listings; dedicated portal/widget collector required. |
| openalex-works-api | API query/authentication or platform-specific access needs a dedicated collector |
| patentsview-patent-api | API query/authentication or platform-specific access needs a dedicated collector |
| pell-pto-facebook | API query/authentication or platform-specific access needs a dedicated collector |
| piee-solicitation-module | NoUsablePublicContent |
| portsmouth-gov-rss-directory | Public page contains no usable listings; dedicated portal/widget collector required. |
| portsmouth-library-all-events | HTTP Error 404: Not Found |
| portsmouth-library-calendar | NoUsablePublicContent |
| portsmouth-schools-policies | NoUsablePublicContent |
| ri-ai-task-force-open-meetings | NoUsablePublicContent |
| ri-sos-business-search | NoUsablePublicContent |
| rihub-events | NoUsablePublicContent |
| rimta-events | Public page contains no usable listings; dedicated portal/widget collector required. |
| rimta-news | NoUsablePublicContent |
| saic-middletown-careers | HTTP Error 403: Forbidden |
| saic-ri-careers | HTTP Error 403: Forbidden |
| sam-contract-opportunities | Public page contains no usable listings; dedicated portal/widget collector required. |
| sam-opportunities-public-api | API query/authentication or platform-specific access needs a dedicated collector |
| sbir-awards | NoUsablePublicContent |
| uri-ai-lab-calendar | <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1006)> |
| uri-ai-lab-group | <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1006)> |
| uri-iacr-events | <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1006)> |
| usaspending-spending-by-award-api | API query/authentication or platform-specific access needs a dedicated collector |
| wun-city-gov | HTTP 301 redirect loop |
| wun-sitemap | NoUsablePublicContent |

## Municipality inventory

One primary municipal source per new town was selected. A working page/feed is partial coverage, not full meeting/document coverage.

| Municipality | Registry source | Audit status |
|---|---|---|
| Barrington | barrington-government-news | ready |
| Bristol | bristol-government-news | ready |
| Burrillville | burrillville-government | blocked |
| Central Falls | central-falls-government | blocked |
| Charlestown | charlestown-government-news | ready |
| Coventry | coventry-government | ready |
| Cranston | cranston-government | blocked |
| Cumberland | cumberland-government-news | ready |
| East Greenwich | east-greenwich-government-news | ready |
| East Providence | east-providence-government-news | ready |
| Exeter | exeter-government | blocked |
| Foster | foster-government-news | ready |
| Glocester | glocester-government | ready |
| Hopkinton | hopkinton-government | blocked |
| Jamestown | jamestown-government | ready |
| Johnston | johnston-government-news | ready |
| Lincoln | lincoln-government-news | ready |
| Little Compton | little-compton-government-news | ready |
| Middletown | middletown-gov-rss-news | existing |
| Narragansett | narragansett-government-news | ready |
| New Shoreham | new-shoreham-government-news | ready |
| Newport | newport-gov-council-granicus | existing |
| North Kingstown | north-kingstown-government-news | ready |
| North Providence | north-providence-government | ready |
| North Smithfield | north-smithfield-government-news | ready |
| Pawtucket | pawtucket-government-news | ready |
| Portsmouth | portsmouth-gov-rss-news | existing |
| Providence | providence-government | ready |
| Richmond | richmond-government-news | ready |
| Scituate | scituate-government | ready |
| Smithfield | smithfield-government | blocked |
| South Kingstown | south-kingstown-government-news | ready |
| Tiverton | tiverton-government-news | ready |
| Warren | warren-government | ready |
| Warwick | warwick-government | ready |
| West Greenwich | west-greenwich-government-news | ready |
| West Warwick | west-warwick-government | ready |
| Westerly | westerly-government | ready |
| Woonsocket | woonsocket-government | blocked |

## Provenance and reproducibility

Official baseline: [Rhode Island municipality directory](https://www.ri.gov/towns/). Each new database definition recorded discovery method, audit time, evidence URL and batch SHA-256. The public [source catalog](../../scripts/source-catalog.json) and source inventory above retain portable endpoint context. Private research exports and database snapshots are intentionally omitted; their absence must not be represented as reproduced live verification.

Validation: 50 actual production-adapter fetches and normalization checks passed; six page tests, 11 conditional-download tests, 21 Node collector/classification tests and production auth/path isolation smoke passed. First expansion also passed nine frontend tests, TypeScript and Vite build.

Deployment: manual Hyperlift build of e867e885d58ba457a764dc69239ab56bbff526ba; automatic builds OFF. Supabase Free unchanged. Apex/Netlify unchanged.

Final verification at 2026-10-05 02:55 UTC: deployed catalog digest e07cd1694367702e, /healthz 200, private /api/aqai/preview 401, public /api/aqai/published 200. Initial collection was run in bounded operator batches; the existing hosted worker retains responsibility for scheduled checks and AI assessment. This is first-run validation, not a multi-day reliability guarantee.

