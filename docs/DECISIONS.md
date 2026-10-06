# AquidneckAI decision register

Recorded: 2026-10-06. IDs are permanent; supersede a decision rather than reusing its ID. Dates below are the register date unless an original decision date is known. Earlier interview dates are not inferred. `approved` is settled intent, `rejected` is out of scope, `deferred` is desired later, and `open` has no selected solution. Implementation may lag intent. Reasons are concise decision rationale, not private model reasoning.

### D-001 — approved — 2026-10-06 — Local usefulness with broad geographic reach
Decision: Center Island residents/businesses; include RI, nearby regions and national/global AI when substantively useful locally. Reason: an Island-only news gate would miss important opportunities. Evidence: owner interview; obsolete geography guard removed from [assessment-result](../scripts/assessment-result.mjs). Revisit: consistent irrelevant output or audience evidence; do not restore a three-town editorial gate by accident.

### D-002 — approved — 2026-10-06 — Free reader hub, sponsorship after audience value
Decision: Build a useful recurring destination with a slight business-owner emphasis; retain free reading and pursue labeled sponsorship when audience demand supports it. Reason: legitimacy and attention create sponsor value. Evidence: owner interview and [charter](PROJECT-CHARTER.md). Revisit: demonstrated readership, sponsor interest and support burden; no paywall or paid placement system is approved by this entry.

### D-003 — approved — 2026-10-06 — Minimize required owner work
Decision: Automate routine work, batch human review, rank useful candidates, expose exceptions. Reason: the product must not become a second job. Evidence: owner interview and deployed [review UI](../src/components/EditorialReview.tsx). Revisit: measured review time, exception volume or unreliable automation.

### D-004 — rejected — 2026-10-06 — Public chatbot as launch feature
Decision: Do not build an ask-anything interface. Reason: the owner wants a distinctive information hub, not another free general chat tool. Evidence: explicit owner rejection in the interview. Revisit: owner changes scope with a specific differentiated use case.

### D-005 — approved — 2026-10-06 — Explicit source registry, no expanding discovery loop
Decision: Research sources in bounded projects, then manage configured sources explicitly; do not autonomously keep widening the search or enroll endpoints. Reason: coverage should be understandable and costs controllable. Evidence: owner interview; [source-readiness](../scripts/source-readiness.mjs). Revisit: owner requests a bounded expansion or a registry workflow change.

### D-006 — approved — 2026-10-06 — Aggregators and public newsletter archives are inputs
Decision: Use useful AI newsletters, collectives, tool directories and nearby university sources, subject to evidence and local usefulness. Reason: benefit from existing curation without duplicating it. Evidence: owner's source-expansion requests; [source catalog](../scripts/source-catalog.json). Revisit: duplication, poor original attribution, access problems or low signal.

### D-007 — approved — 2026-10-06 — Evidence and editorial history precede publication
Decision: Keep exact AI evidence, meaningful summary/local usefulness, source/date provenance and durable decisions. Preserve earlier actions when a newer decision supersedes them. Reason: trustworthy publication and recoverable context. Evidence: October 6 approval follow-up; [editorial SQL](../supabase/migrations/20261005110000_aqai_editorial_review.sql). Revisit: concrete usability failures; improve the interface without removing correctness checks.

### D-008 — approved — 2026-10-06 — Broad assessment, narrow automatic publication
Decision: General articles require editorial approval; the existing verified official-calendar gate remains narrow. Reason: autonomous collection is safer and easier to validate than unrestricted publication. Evidence: [publisher](../scripts/publish-qualified.mjs), [editorial handler](../scripts/editorial-handler.mjs). Revisit: measured precision and an explicit, tested publication-policy change.

### D-009 — approved — 2026-10-01 — Supabase stays Free
Decision: Remove avoidable egress/processing waste without upgrading the plan. Reason: preserve low recurring costs. Evidence: explicit October 1 user instruction; bounded database helpers and [published feed](../scripts/published-feed.mjs). Revisit: measured remaining capacity after optimization and new owner authorization; never silently upgrade.

### D-010 — approved — 2026-10-06 — Preserve caps and paid-retry safeguards
Decision: Retain current inference price ceilings, bounded batches, durable claims and $1 non-resetting provider cap. Reason: uncertain responses must not produce unbounded paid retries. Evidence: deployed [classifier](../scripts/classify-new.mjs), [recovery](../scripts/recover-assessments.mjs). Revisit: verified low balance or measured workload; a monthly allowance has not been configured.

### D-011 — approved — 2026-10-06 — Staging deployment is separate from public launch
Decision: Manual builds only; keep existing Netlify apex and DNS unchanged until a separately authorized cutover. Reason: preserve the working public site while replacement is validated. Evidence: explicit staging upload/deployment approval; deployed `b34b14e11e2fb7403afddef1fc4004a078620449`. Revisit: tested launch checklist, rollback plan and owner launch instruction.

### D-012 — approved — 2026-10-06 — Apply database changes individually until history is reconciled
Decision: No blanket database push. Reason: the local migration directory and live migration history are not yet reconciled. Evidence: applied additive changes and [migration fixtures](../scripts/test-editorial-review.sql). Revisit: a verified migration inventory, baseline and restoration procedure.

### D-013 — deferred — 2026-10-06 — Continuing topic arcs and internal links
Decision: Develop persistent topics with visible updates and useful internal links after the core feed works reliably. Reason: readers should understand what changed over time. Evidence: owner interview; not implemented in [ReaderHome](../src/pages/ReaderHome.tsx). Revisit: enough related published material to validate one useful arc.

### D-014 — open — 2026-10-06 — Model routing
Decision: Desired roles are strong reasoning for major decisions, capable engineering and cheaper models for bounded tasks; no production router is selected. Reason: optimize cost without transferring consequential judgment to a poorly controlled model. Evidence: owner requested Astra/Sol/Luna; actual worker model is Gemini Flash Lite. Revisit: representative evaluation set, available provider models, measured cost/quality and fallback design.

### D-015 — open — 2026-10-06 — CMS and Cloudflare AI alternatives
Decision: Evaluate only against concrete maintenance/cost/functionality benefits; keep current implementation meanwhile. Reason: the owner asked about options, not a rewrite or purchase. Evidence: interview; deployed [architecture](ARCHITECTURE.md). Revisit: a demonstrated capability gap or lower-maintenance replacement with migration costs included.

### D-016 — approved — 2026-10-06 — Portable repository context and agent handoffs
Decision: Track scope, stack, decisions/reasons, verified state, deferred work and task outcomes in versioned, model-readable repository documentation. Reason: continuity must not depend on one computer or chat. Evidence: owner's current cloud/Dot handoff request. Revisit: a new agent cannot resume correctly, documents conflict, or routine updates become excessive.

### D-017 — approved — 2026-10-06 — Shared context does not convey unrestricted access
Decision: A new agent reads repository context and works within its granted task/environment permissions; secrets, private exports and browser sessions are not project memory. Reason: portable knowledge must not accidentally become public credentials or unbounded production authority. Evidence: current public-repository handoff scope and existing staging/plan boundaries. Revisit: owner explicitly configures a different access scope; document it separately from product intent.

### D-018 — approved — 2026-10-06 — Maintain useful continuity as part of development
Decision: Agents capture project-relevant learning from material interactions, maintain canonical goals/tasks/history and derive bounded steps and tests from owner intent. Reason: ongoing development should not require the owner to repeat context or manually maintain a second task system. Evidence: October 6 owner request, summarized in the [interview journal](journal/2026-10-06-2147Z-autonomous-continuity.md). Revisit: a future agent cannot explain priorities or documents become duplicative/stale. Initial unanswered questions were recorded in [OPERATING-MODE](OPERATING-MODE.md); subsequent interview evidence and current operating defaults are recorded below. Existing live/cost boundaries remain.

Update 2026-10-06: initial answers are now recorded in the [owner-response journal](journal/2026-10-06-2151Z-owner-outcomes-and-authority.md) and OPERATING-MODE. The earlier pending state is historical; D-019/D-020 supply current intent and authority. A recurring trigger remains unconfigured.

### D-019 — approved — 2026-10-06 — Useful outcomes and local technology-hub direction
Decision: Prioritize practical bottom-line benefit, accessible AI understanding and valuable local connections; eventually develop an automated AI/robotics/autonomy hub. Reason: these are the owner's stated success outcomes rather than a request for more article volume. Evidence: October 6 interview answers; stable G-001/G-002/G-003 in PROJECT-CHARTER. Revisit: reader evidence or an explicit change in owner intent. This direction does not authorize unrestricted source enrollment or paid operations.

### D-020 — approved — 2026-10-06 — Delegate routine engineering judgment within existing limits
Decision: Agents choose useful bounded goals, steps, tests and ordinary repository completion using their judgment. Reason: the owner explicitly asks for sensible autonomous progress and says to stay within the existing ChatGPT plan. Evidence: October 6 interview answers; PR/push and cadence defaults distinguished from owner statements in OPERATING-MODE. Revisit: poor change quality, excessive owner burden, platform limits or a changed mandate. Preserve existing production/deployment/spending restrictions; subscription context is not an API allowance or verified remaining quota.
