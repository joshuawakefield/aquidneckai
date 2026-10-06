# AquidneckAI first-release design — version 0.1

Date: 2026-10-06. Task: AQ-024. Status: design hypothesis and working isolated prototype, not an application release or reader validation. Authority: the owner's current product/engineering-ownership mandate. [Charter](PROJECT-CHARTER.md) owns durable goals; [state](PROJECT-STATE.md) owns deployed facts. This document defines the intended whole experience and evidence needed to revise it.

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
| A real local connection can be recommended | Not yet established by AQ-022 | Show an honest empty state until verified evidence exists. |
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

The prototype uses an illustrative story to demonstrate anatomy, not a reported announcement. Real production content must include a title, concise account, original source, meaningful date, local interpretation labeled as such, unknowns and an actionable next step when justified. Display corrections/withdrawals truthfully; preserve editorial history. No invented original sources or quotations.

The existing PublishedFeed contract does not yet provide a first-party article route or all of these fields. Implementing that route is a separately scoped follow-up; inspect the schema and existing functions before deciding whether an additive contract is necessary. Until then, original-source links remain the truthful production destination. The prototype hash view is not permission to replace all external links with unsourced articles.

### Practical guide

Use AQ-021's fictional carpentry estimate-request scenario. The prompt is self-contained; no real customer information is needed. Readers use an existing AI tool, inspect factual accuracy, adjust tone or reject the result, and control any eventual sending. Count editing/checking in any later benefit assessment. A copy action is an optional convenience with a manual fallback; copying does not call a model.

Retain three manageable exercises. A dedicated route can evolve from the current expandable details when evidence justifies discoverability and maintenance cost. No automation service or site-hosted model call is required for the first release.

### Connections

AQ-022 researches a bounded candidate list before any recommendation. Prefer peers, collaborators and real projects; courses can support a connection but do not establish one by themselves. Each proposed entry must carry provider identity, source, current activity, actual local relevance, access/cost conditions where known, a checked date and a public route to learn more. Do not publish private contact details or claim a place is available without evidence.

The prototype's three entries are fictional format examples. They must never become production seed data. Production may launch with an explicit "No verified listings yet" state; calling the connection path validated requires a real usable recommendation and reader evidence.

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
| Content trust | Editorial approval/original evidence; verified connection activity/access; accurate dates; uncertainty and corrections | Prototype examples count as zero verified stories or connections |
| Reader usefulness | Observe a small first-reader sample trying the journeys; record comprehension, task completion, factual mistakes and checking effort | No recruitment/outreach, real reader sessions or measured benefits occurred here |
| Operational readiness | Manual deployment/rollback plan, auth separation, bounded feed/API behavior, visible exceptions, plan/cap safeguards | Production access, migration application, deployment and apex cutover remain separate |

Proposed formative evaluation: five representative first readers attempt one guide, explain a story's known/unknown claims, and identify whether a connection is actually available. Record where they hesitate and why. An initial target is at least four of five finding the next action without coaching, with no critical misunderstanding of fictional facts or evidence. This is a design team's proposed iteration trigger, not an owner target, representative population estimate or claimed result. Plan and fixture dry-run are authorized now; contacting/recruiting people needs its own authority. If evaluation access is unavailable, mark usefulness unknown and continue independent work.

The release is defined when required behavior and content gates have concrete evidence. A tested design can still change after reader findings. Keep rejected alternatives and revisit reasons; do not call it "final" merely because it looks finished.

## Implementation order and reprioritization

1. AQ-024 (this task): establish design/specification/prototype and owner mandate in an isolated draft PR. Preserve AQ-021/AQ-003 work.
2. Reconcile AQ-003's actual remote closeout. Its display default remains unavailable without a safe usage source; AQ-023 is a separate design, not a new provider polling permission.
3. AQ-022: verify whether a real peer/project path exists. In parallel with ordinary coordinator planning, inspect content/readiness needs from authorized evidence; any development child remains serial.
4. New bounded reader implementation derived from this design: improve outcome navigation and guide discoverability using existing components. Keep published feed/source links until detail-route needs are assessed. Assign a stable new AQ-ID at launch; do not preallocate speculative chains.
5. AQ-010: prepare first-release staging/rollback and content checklist; conduct separately authorized staging/release review. Plan formative reader evaluation without initiating outreach.
6. AQ-002 before database/schema-dependent feature work, then AQ-006 if source management is a demonstrated owner-effort bottleneck. Start with offline inventory when live comparison is unavailable.

Promote AQ-004/007/008 when evidence shows source failures, whole-page material or noise prevent useful coverage or inflate cost. Defer AQ-012 until enough related published material exists; AQ-013/AQ-014 until a measured model/platform gap; AQ-015 until audience/sponsor evidence. No existing task is retired without a documented reason. IDs are identifiers, not execution order.

Choose each task by expected reader benefit, owner effort reduced, uncertainty resolved, cost, dependencies and evidence confidence. Prefer a complete useful slice. Stop expanding a slice when its acceptance is met; refetch/reconcile before the next. Avoid polishing a hypothesis while a concrete release blocker remains.
