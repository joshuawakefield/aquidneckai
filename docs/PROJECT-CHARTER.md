# AquidneckAI project charter

Recorded: 2026-10-06. This is durable product intent, reconstructed from the owner's interview and subsequent instructions. For verified implementation and deployment, read [PROJECT-STATE.md](PROJECT-STATE.md); aspirations below are not claims of completed features.

## Purpose and audience

Make AquidneckAI a trusted daily destination for understanding AI and putting it to use around Aquidneck Island. Initially emphasize residents and local business owners, with a slight business tilt: explain what changed, why it matters, what can be done now, and what is coming.

The product should become a sustainable, sponsor-supported business with little routine owner labor. The owner can help tune the system and make valuable editorial decisions; that availability must not become the system's required daily maintenance budget.

Reading remains free. Local businesses should eventually want a visible presence because the site attracts a useful local audience. Sponsorship is a later audience-backed offering, with clear labeling and separation from editorial judgments; revenue and audience demand are not yet proven.

## Owner-confirmed outcomes and longer-term direction

Confirmed in the 2026-10-06 interview; [dated answers](journal/2026-10-06-2151Z-owner-outcomes-and-authority.md). These outcome IDs are stable references for task selection, not claims that the outcomes have been achieved:

- G-001: A local resident or business learns something that improves their bottom line. Look for credible, concrete financial or practical benefit; avoid unsupported savings/revenue promises.
- G-002: AI becomes understandable and usable for someone who previously found it inaccessible. Help readers move from an unfamiliar development to an achievable next action.
- G-003: Interested local people find one another or an opportunity to meet that would be difficult to uncover elsewhere. Preserve real evidence, current dates and accurate connection details.

The eventual direction is an automated local technology hub covering AI, robotics and autonomy. The current AI-focused hub is the starting point. Broader coverage is an intentional product direction; implement it through bounded work and evidence rather than assuming new sources, spending or unrestricted publication are authorized.

No numeric audience, financial or usage target was supplied. Derive candidate measures in AQ-011, distinguish a proposed metric from measured reader benefit, and seek concrete reader examples through the continuing interview. The existing slight business tilt and low owner-maintenance goal remain.

## Useful news is central — October 7 clarification

The owner explicitly wants a news hub drawing on regularly checked local resources and worthwhile authors/publications, including One Useful Thing and TAAFT. Useful news is a core reason to return, alongside practical examples and connections. Serve Island residents and SMBs with a slight business tilt; trades owners remain an important example audience, not a required reader persona. This clarification supersedes any interpretation of the October 6 first-reader emphasis as the whole product.

The proposed first release leads with two complementary streams: **local developments** that matter to life or work here, and **broader ideas** with an honest useful application for local readers. Do not imply all material originated locally, force an AI angle onto ordinary local facts, or make a generic breaking-news firehose. Current AI-only assessment still excludes non-AI local news; any broader selection gate is proposed and requires bounded fixture review before runtime change. Keep the existing narrow automatic-calendar gate separate.

Each selected item explains what changed, why it may matter, and a practical next action only when supported. Name the publication and author when known; link the original; separate source publication, collection, editorial check and AquidneckAI publication dates; disclose uncertainty, commercial context and expired/corrected information. A reader may simply become better informed without doing an exercise. The owner's trust in named sources is a preference, not a guarantee of every claim. Source-specific review and sponsored/affiliate distinctions remain necessary.

Prioritize source quality, provenance and news display ahead of further isolated exercises. Reuse the existing collection/editorial stack and bounded source catalog; no new enrollment, paywall bypass, paid service or publication permission follows. D-032 records the rationale; the news-first design remains an unmerged PR1 proposal.

## Supporting customer-work focus

Confirmed 2026-10-06 in the [follow-up interview](journal/2026-10-06-2155Z-trades-and-local-connections.md): prioritize local blue-collar business owners who work for themselves or with a very small team. Help them reclaim time and freedom through AI and automation for the annoying parts of getting, keeping and refreshing customers. This sharper first-reader focus does not exclude other residents or change the broader geographic scope.

Use the customer's lifecycle to choose practical examples: respond to an inquiry, prepare a factual quote follow-up, keep an existing customer informed, or draft a relevant returning-customer check-in. These are candidate use cases derived from the owner's goal, not validated claims of revenue or automated features. Start with work the owner can check and control, using fictional/public information in demonstrations.

For local connections, prioritize peers, collaborators and local projects. Training/events and experts/services remain useful supporting routes, but a course list alone does not satisfy the connection goal. Do not invent local partners, publish personal details or promise an available collaboration. Validate an organization's/project's actual activity and contact route before recommending it.

The first [reader-journey/usefulness plan](reports/2026-10-06-trades-reader-journey.md) records current implementation gaps, a proposed customer follow-up experiment and evidence to gather. It is design work, not user validation or deployed behavior.

## Editorial scope

- Center Newport, Middletown and Portsmouth; include Jamestown, Tiverton, Little Compton, Bristol, Barrington, Providence, Rhode Island statewide and the nearby South Coast when useful. These are coverage areas, not a claim that every place belongs to Newport County.
- Include national and global AI developments when they have a plausible, substantive local implication. Geographic distance alone is not grounds for rejection.
- Include useful opportunities, training, tools, research, business adoption, policy, events and long-horizon developments. A generic AI mention or invented local angle is not sufficient.
- Start with an objective account of the development, then explain local usefulness. Distinguish source facts from editorial interpretation and predictions. Do not force local wording into every headline.
- Prefer a coherent searchable reader experience over mandatory audience or town segmentation. Internal geographic and topic labels remain useful for editorial assessment.
- Keep original source links, publication/event dates, exact supporting evidence, corrections and withdrawal history. A source page or model's assessment is not itself a publishable article.

## Desired reader experience

Readers should quickly answer: What matters today? What can my business try? Where can I learn nearby? What is coming? What changed since I last checked?

The deployed starting point has curated resources, practical exercises, a published feed and an archive. Future work includes continuing topic arcs with visible updates and relevant internal links, subject to evidence quality and measured reader usefulness. A public question-answering chatbot is explicitly out of scope.

## Desired operating experience

- Collect from an explicit, inspectable source registry. Batch assessment and surface the strongest review candidates first.
- Provide authenticated source management and editorial controls, useful evidence highlighting, clear errors and recoverable drafts. Editorial controls exist; source add/edit/disable controls are still backlog work.
- Automate routine collection, deduplication, assessment and narrowly safe publication. Make uncertainty and exceptional failures visible without requiring constant supervision.
- Use public newsletters, aggregators and directories as useful leads. Trace important claims to original evidence where possible. Do not create a continuously widening discovery or automatic source-enrollment loop.
- Keep source cadences, downloads, database reads and inference bounded. Stay on Supabase Free; new services and budget changes are deliberate decisions.
- Preserve project intent, decisions, evidence, unresolved work and handoffs in versioned repository documents so another model can continue without a private chat history.

## Model and platform direction

The owner wants strong reasoning for consequential choices, capable engineering assistance and cheaper models for tightly controlled tasks. The requested Astra/Sol/Luna division is an aspiration, not a deployed provider configuration. The current worker uses Gemini 2.5 Flash Lite through OpenRouter. Any routing change needs an evaluation, explicit failure behavior and a cost ceiling.

Cloudflare AI and packaged CMS products were raised as possibilities, not selected components. Reuse the working stack unless a demonstrated improvement reduces owner work, operating cost or implementation risk. Avoid a platform rewrite merely because another product exists.

## Measures of success

Track useful current coverage, evidence accuracy, repeat readership, actionable local opportunities, time spent resolving exceptions, source health, duplicate/noisy assessments and actual operating cost. Later measure sponsor interest and retention. Raw source count, page volume or number of model calls are not success measures.

The concrete roadmap is [BACKLOG.md](BACKLOG.md); durable decisions and their revisit triggers are in [DECISIONS.md](DECISIONS.md).
