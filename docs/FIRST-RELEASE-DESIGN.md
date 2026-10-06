# AquidneckAI first-release design — version 0.3

Date: 2026-10-06. Task: AQ-024; reconciliation: AQ-025; sourced connection preview: AQ-028. Status: design hypothesis and working isolated prototype, not an application release or reader validation. Authority: the owner's current product/engineering-ownership mandate. [Charter](PROJECT-CHARTER.md) owns durable goals; [state](PROJECT-STATE.md) owns deployed facts. This document defines the intended whole experience and evidence needed to revise it.


## Consolidation decision — AQ-025

This is the **recommended canonical proposal**, maintained only in this document on [draft PR #1](https://github.com/joshuawakefield/aquidneckai/pull/1). It is not integrated into aqai-local-index, finally approved or deployed. Both drafts remain open. Recommend superseding [PR #2](https://github.com/joshuawakefield/aquidneckai/pull/2) as a competing proposal only when the owner decides their disposition; do not merge both document/prototype sets.

| Area | Selected treatment | Reader/evidence/maintenance rationale |
| --- | --- | --- |
| Whole-release brief and authority | PR1 thesis, owner mandate, content gates and explicit production-contract gaps | Covers the release beyond the demo and keeps delegated authority separate from design validation. |
| Prototype implementation | PR1 self-contained HTML, four independent paths, native disclosures, copy fallback and content states | Portable review, no application imports/dependencies, readable without JavaScript; honest unavailable/empty states. Keep one implementation, not a merged React/HTML stack. |
| Practical learning | Adapt PR2's deliberately incorrect handwritten appointment and reveal-review idea into PR1's native disclosure | Readers must identify a concrete factual error before accepting a polished draft; retains PR1's checked prompt and manual-copy fallback. PR2's React component/test code remains in its original commit. |
| Evidence labeling | Adopt PR2's distinction between source publication/update, actual check date and scope of verification | A retrieved contact route is not proof of available participation. No new source checks or dates are invented. |
| Connection demonstration | AQ-028 replaces fictional connection formats with two AQ-022-backed leads from one organization | PR2's FabNewport research establishes a public description/contact route only, not adult/trades/AI/project availability. Preserve it as an AQ-022 lead in PR2 history, not a recommendation or fixture copied into production. |
| Validation | Retain both journals as historical evidence; rerun selected prototype flows and automated accessibility scans | PR2's three component tests/eight axe scans and full baseline are useful prior evidence, but do not prove the consolidated HTML behavior. Neither draft has real reader validation. |

Historical provenance stays recoverable: [PR1 original eb5390d](https://github.com/joshuawakefield/aquidneckai/tree/eb5390d1f0f31040d8f0dbaaac25be67cb8350a6) and [PR2 original c7f4805](https://github.com/joshuawakefield/aquidneckai/tree/c7f4805edb4cdf2dadf53d8d6b3d5a96c8d30b1f). Both independently used AQ-024 and D-027 from base 15362f57. AQ-024 remains the historical design task with branch-qualified references; **AQ-025** is the distinct reconciliation task. PR1 D-027 remains the owner mandate, D-028 the original design hypothesis; **D-029** records this consolidation and PR2's historical D-027 remains explicitly branch-qualified. No original journal or decision is renumbered or erased.

The [AQ-025 journal](journal/2026-10-06-2301Z-design-reconciliation.md) records fresh checks, allowlist and closeout. AQ-022 verification is complete; AQ-028 applies its bounded evidence to this same prototype. No successor or schedule is launched here.

## Product thesis

AquidneckAI helps local people understand consequential technology, put it to practical use, and find relevant people and opportunities nearby, with little routine work from the owner. The first reader is a self-employed trades owner or very small team around Aquidneck Island. Other residents remain welcome; substantial RI, nearby and national/global relevance remains within scope. AI is the first content focus; the longer AI/robotics/autonomy direction does not require widening collection now.

A useful visit ends with a next action the reader understands and can check: try a factual exercise, follow an original source, or investigate a verified local opportunity. A feature count or automated test pass is not proof of benefit. Free reading and original evidence are part of the value proposition; sponsorship follows audience evidence.

## What is known and what is a hypothesis

| Statement | Evidence level | Consequence |
| --- | --- | --- |
| Owner wants practical benefit, accessible AI and local peers/projects | Owner-confirmed G-001/G-002/G-003, D-021 | Organize the release around those outcomes. |
| Existing reader supplies a feed, eight curated resources and three exercises | Source inspected; prior staging evidence; AQ-021 updated one exercise locally | Reuse working data boundaries and reader components. |
| Customer follow-up is a worthwhile first experiment | Owner-derived use case, implemented and tested in AQ-021 | Include it; do not claim it is the most valuable feature or that it saves time. |
| Readers prefer the proposed hierarchy and style | Unvalidated design hypothesis | Test comprehension and task completion before treating the design as settled. |
| A public route to local business peers exists | AQ-022 official source research; AQ-028 recheck of two Chamber pages | Show advertised lunch and conditional referral-group inquiry; places, attendance and benefits remain unknown. |
| Current content is enough for repeat visits or sponsorship | Unknown | Examine available content and gather reader evidence before expansion/revenue work. |

## Release experience

The three paths share one home, consistent navigation and evidence conventions. They are outcomes, not three products or isolated town portals.

| Path | Reader question | Surface and useful next action | Evidence requirement |
| --- | --- | --- | --- |
| Understand | What changed, and why might it matter here? | Concise feed cards, then source-linked detail with facts, local interpretation, uncertainty and dates | Existing editorially published material only; source and exact evidence retained. |
| Use | What can I try in my day-to-day work? | A short practical guide with example inputs, factual-only prompt, review steps and a stopping point | Fictional/public example data; no savings promise, collection, sending or site inference. |
| Connect | Who or what nearby is worth exploring? | Small curated list with purpose, current activity, relevance and public contact route | Verified provider/activity/access and checked date; uncertainty visibly disclosed. |

### Home

- Lead with the promise and a useful first action; do not lead with collector counts or editorial backlog.
- Feature one practical exercise for the first reader, with an understandable situation and clear result.
- Expose the three paths in ordinary language. Retain easy access to learning resources and the published feed.
- Highlight a few genuinely useful published entries, with accurate publication/event dates and local relevance. Prioritize evidence and reader value over volume.
- Distinguish empty, unavailable and loading states. Empty news is not an invitation to generate filler; unavailable data is not evidence that nothing exists.
- Keep past events separated, preserve resource search and avoid mandatory signup or segmentation.

### Story/detail

The prototype uses an illustrative story to demonstrate anatomy, not a reported announcement. Real production content must include a title, concise account, original source, meaningful date, local interpretation labeled as such, unknowns and an actionable next step when justified. Label the original source publication/update date separately from the actual AquidneckAI check date and check scope. Unknown dates stay unknown; a successful retrieval does not prove availability or endorsement. Display corrections/withdrawals truthfully; preserve editorial history. No invented original sources or quotations.

The existing PublishedFeed contract does not yet provide a first-party article route or all of these fields. Implementing that route is a separately scoped follow-up; inspect the schema and existing functions before deciding whether an additive contract is necessary. Until then, original-source links remain the truthful production destination. The prototype hash view is not permission to replace all external links with unsourced articles.

### Practical guide

Use AQ-021's fictional carpentry estimate-request scenario. The prompt is self-contained; no real customer information is needed. Readers use an existing AI tool, inspect factual accuracy, adjust tone or reject the result, and control any eventual sending. Include a visibly handwritten flawed draft, ask the reader to spot its invented appointment, then reveal the correction. Count editing/checking in any later benefit assessment. A copy action is an optional convenience with a manual fallback; copying does not call a model.

Retain three manageable exercises. A dedicated route can evolve from the current expandable details when evidence justifies discoverability and maintenance cost. No automation service or site-hosted model call is required for the first release.

### Connections

AQ-022 researches a bounded candidate list before any recommendation. Prefer peers, collaborators and real projects; courses can support a connection but do not establish one by themselves. Each proposed entry must carry provider identity, source, current activity, actual local relevance, access/cost conditions where known, a checked date and a public route to learn more. Do not publish private contact details or claim a place is available without evidence.

AQ-028 shows two source-backed leads from the Greater Newport Chamber: the October 15 networking lunch and Chamber Connections as inquiry-only context. Public source links are the registration/inquiry destinations; the prototype collects nothing. PPL/FabNewport remain research leads outside these cards, not recommendations. Source publication/update dates remain unknown and distinct from the actual October 6 check date. Description retrieval establishes neither capacity nor participation.

Event status uses America/New_York, independent of the viewer's timezone, and expires at the advertised local end (October 15, 13:00). The source prints EDT and an inconsistent GMT-05:00 label: preserve the local clock and use IANA seasonal rules, visibly disclose the discrepancy, and require organizer confirmation before plans. [NIST's 2026 DST dates](https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst) place October 15 in daylight time. This is a documented display interpretation, not organizer confirmation; no calendar export is offered. For missing times, a future day is date-only, today may already have ended, and only the next local day becomes past. Missing/invalid dates never imply upcoming. Evidence is separately stale at seven local calendar days, a conservative preview threshold; recent retrieval still cannot establish availability. Invalid/future check dates yield unknown freshness. Re-evaluate on load, each second and return to visibility without network or storage. No-JavaScript text leaves date/freshness evaluation unknown.

Production may still need an explicit empty state; calling the connection path validated requires reader evidence. This proposal is neither integrated nor finally approved.

## Visual direction

Chosen engineering/design hypothesis: a calm local editorial guide. Warm off-white background, dark harbor-colored ink, restrained terracotta accents, serif headlines and system-font body text. Generous whitespace, short paragraphs, clear typographic hierarchy and readable mobile cards. No stock robots, gratuitous animation, fake charts or manufactured freshness.

| Token | Prototype value | Purpose |
| --- | --- | --- |
| Background | #f7f5ee | Warm paper-like reading surface |
| Text/primary controls | #102f35 | Strong contrast and restrained identity |
| Secondary text | #455e60 | Readable supporting information |
| Accent | #a44223 | Active focus, emphasis and path labeling |
| Panels | #e6ece4 / #fffef9 | Distinguish supporting content without excessive decoration |
| Headline/body fonts | Georgia / system-ui | Portable, no external font dependency in the prototype |

These values guide the prototype; production reader-home.css is unchanged. Adapt tokens into existing CSS when the next implementation is authorized and scoped. Content requirements survive visual refinements.

Use semantic landmarks/headings, a skip link, keyboard-operable links/controls, visible focus, understandable labels/status updates and reflow. The [W3C page-structure tutorial](https://www.w3.org/WAI/tutorials/page-structure/) and [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/) ground this checklist. Local browser checks cover selected behavior; no full accessibility conformance claim follows from them. A screen-reader walkthrough and contrast audit remain production-release checks.

## Prototype and review

Open [the self-contained prototype](prototypes/first-release/index.html) in a browser, or serve its directory over loopback for testing. It uses no external assets, network API, dependency installation or storage. HTML/CSS/JavaScript stay inside this one concept file; a restrictive content policy blocks connections. JavaScript enhances hash navigation, connection filtering, sample states and prompt copying. Without JavaScript all concept pages remain readable with anchor navigation.

Review paths: home → exercise → checked example; home → story → evidence requirements; home → connections → filter/detail → empty/unavailable states. Desktop, 390px and 320px behavior, reload/back navigation and keyboard focus are recorded in the task journal. The prototype is outside the application build/public tree and is not deployed.

## Acceptance gates

| Gate | Pass evidence | Present limit |
| --- | --- | --- |
| Coherent design | Thesis, three journeys, page anatomy, content requirements, versioned prototype and rationale | Design hypothesis, not reader endorsement |
| Software behavior | Fixture tests, type/build checks for production changes, desktop/mobile interaction checks, selected keyboard/accessibility checks | Prototype evidence cannot substitute for production regression/staging checks |
| Content trust | Editorial approval/original evidence; verified connection activity/access; accurate dates; uncertainty and corrections | Story/exercise remain illustrative; connection source evidence does not establish current availability or reader benefit |
| Reader usefulness | Observe a small first-reader sample trying the journeys; record comprehension, task completion, factual mistakes and checking effort | No recruitment/outreach, real reader sessions or measured benefits occurred here |
| Operational readiness | Manual deployment/rollback plan, auth separation, bounded feed/API behavior, visible exceptions, plan/cap safeguards | Production access, migration application, deployment and apex cutover remain separate |

Proposed formative evaluation: five representative first readers attempt one guide, explain a story's known/unknown claims, and identify whether a connection is actually available. Record where they hesitate and why. An initial target is at least four of five finding the next action without coaching, with no critical misunderstanding of fictional facts or evidence. This is a design team's proposed iteration trigger, not an owner target, representative population estimate or claimed result. Plan and fixture dry-run are authorized now; contacting/recruiting people needs its own authority. If evaluation access is unavailable, mark usefulness unknown and continue independent work.

The release is defined when required behavior and content gates have concrete evidence. A tested design can still change after reader findings. Keep rejected alternatives and revisit reasons; do not call it "final" merely because it looks finished.

## Implementation order and reprioritization

1. AQ-024 design is delivered; AQ-025 consolidates the two open drafts into this recommended proposal on PR1. Preserve both original commits and AQ-021/AQ-003 work. Integration remains separate.
2. Preserve AQ-003's actual remote closeout. Its display default remains unavailable without a safe usage source; AQ-023 is a separate design, not a new provider polling permission.
3. AQ-022 verification and AQ-028 isolated source-backed preview are complete. Next useful bounded work: AQ-010 first-release content/staging/rollback readiness checklist grounded in this proposal and the actual feed contract; no deployment or outreach. Parent owns task selection and launch.
4. New bounded reader implementation derived from this design: improve outcome navigation and guide discoverability using existing components. Keep published feed/source links until detail-route needs are assessed. Assign a stable new AQ-ID at launch; do not preallocate speculative chains.
5. AQ-010: prepare first-release staging/rollback and content checklist; conduct separately authorized staging/release review. Plan formative reader evaluation without initiating outreach.
6. AQ-002 before database/schema-dependent feature work, then AQ-006 if source management is a demonstrated owner-effort bottleneck. Start with offline inventory when live comparison is unavailable.

Promote AQ-004/007/008 when evidence shows source failures, whole-page material or noise prevent useful coverage or inflate cost. Defer AQ-012 until enough related published material exists; AQ-013/AQ-014 until a measured model/platform gap; AQ-015 until audience/sponsor evidence. No existing task is retired without a documented reason. IDs are identifiers, not execution order.

Choose each task by expected reader benefit, owner effort reduced, uncertainty resolved, cost, dependencies and evidence confidence. Prefer a complete useful slice. Stop expanding a slice when its acceptance is met; refetch/reconcile before the next. Avoid polishing a hypothesis while a concrete release blocker remains.
