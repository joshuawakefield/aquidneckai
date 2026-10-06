# AquidneckAI project charter

Recorded: 2026-10-06. This is durable product intent, reconstructed from the owner's interview and subsequent instructions. For verified implementation and deployment, read [PROJECT-STATE.md](PROJECT-STATE.md); aspirations below are not claims of completed features.

## Purpose and audience

Make AquidneckAI a trusted daily destination for understanding AI and putting it to use around Aquidneck Island. Initially emphasize residents and local business owners, with a slight business tilt: explain what changed, why it matters, what can be done now, and what is coming.

The product should become a sustainable, sponsor-supported business with little routine owner labor. The owner can help tune the system and make valuable editorial decisions; that availability must not become the system's required daily maintenance budget.

Reading remains free. Local businesses should eventually want a visible presence because the site attracts a useful local audience. Sponsorship is a later audience-backed offering, with clear labeling and separation from editorial judgments; revenue and audience demand are not yet proven.

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
