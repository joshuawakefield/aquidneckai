# First trades-owner reader journey and usefulness plan

Date: 2026-10-06. Task: AQ-011. Evidence: owner interview, [charter](../PROJECT-CHARTER.md), local source inspection of [ReaderHome](../../src/pages/ReaderHome.tsx), [resource data](../../src/data/reader-resources.ts) and existing reader tests. No live services, interviews with customers, tracking or outreach were used.

## Confirmed need

First reader: an Island blue-collar owner who is self-employed or has a very small team. Desired result: regain time/freedom from customer acquisition, retention and reactivation administration. Preferred local connections: peers, collaborators and local projects. These are owner-confirmed preferences; specific trade, revenue target and reader skill level were not supplied.

## Current baseline from local implementation

The replacement reader has eight static resources and three expandable experiments. Resources cover general AI training, business support and research. Experiments cover drafting an announcement, explaining repeated information and understanding an announcement. The practice section asks readers to use public or fictional information; the reader tests cover resource search/reset, feed empty/error states, past-event separation and expandable examples without customer-input collection.

No current static experiment walks a trades owner through customer follow-up. No verified local peer/collaboration/project directory is implemented. Existing state/university calendars can support learning, but do not establish actual peer connections. Resource checked dates come from repository metadata (October 5), not a new live verification. Current benefit, repeat readership, time saved and owner maintenance time have not been measured.

## Proposed first journey

1. Recognize the situation: a solo trades owner has an inbound request or unsent quote follow-up after a busy workday. This is an illustrative situation, not a newly interviewed customer.
2. Find a short exercise using fictional facts: customer asked for an estimate; known scope/date supplied; no price or availability promised unless present in the facts.
3. Generate a brief follow-up draft using a reader's existing AI tool. No model call, customer upload or tool subscription is added to AquidneckAI.
4. Check what is known, remove invented claims, correct the tone and decide whether to send manually. The exercise should also allow the reader to conclude AI was not helpful.
5. Compare drafting/checking effort with the usual approach. Offer a useful next step for customer updates/returning-customer check-ins without promising conversion or automated follow-through.
6. Discover a real local peer/project connection through a source-backed route when one is verified. Keep that companion item open until activity, location/relevance, checked date and permitted public contact path are established.

Proposed prompt: "Using only these fictional facts, draft a short, friendly follow-up about a requested estimate. Ask for any missing detail needed to progress. Do not invent a price, appointment, guarantee or prior conversation. List uncertain details separately. Leave sending to me."

## Minimal evidence plan

| Outcome | Evidence to gather | Interpretation and boundary |
|---|---|---|
| G-001: practical benefit | Optional before/after minutes to draft **and check** one comparable message; number of corrections; whether the final result was usable. | Count verification time, including slower/unsuccessful attempts. This is a proposed measure, not measured savings or proof of more customers. |
| G-002: AI understanding | Can a reader explain the input, identify an invented detail and decide when to edit/reject the draft? | Use a short fictional scenario and observe completion. No real customer data needed. |
| G-003: local connection | Can a reader identify a relevant active peer/project and a genuine route to connect? Record unavailable/uncertain cases. | Clicking a calendar or viewing a card does not prove a meeting or collaboration happened. Actual outcome is unknown until reported. |
| Repeat usefulness | Optional self-report of trying the exercise again and what changed. | No analytics service, identity tracking or attribution claim added. Collection remains proposed. |
| Owner effort | Time spent checking/updating the example, validating a connection and resolving misunderstandings. | Log aggregate task effort with date/scope. Do not assume the current site is maintenance-free. |

Start with an offline walkthrough and fictional examples. Any later reader recruitment, feedback collection or outreach needs its own scoped task and current authority; no people have been contacted. Retain only anonymized/aggregate findings in GitHub; no customer names, contact lists or message histories.

## Acceptance criteria for next implementation

- AQ-021 adds a plain-language customer follow-up experiment to the existing reader structure, with fictional facts, a factual-only draft prompt and a human-check step. Preserve three manageable examples and existing resource/feed behavior.
- Focused frontend tests verify the exercise is discoverable, carries no unsupported price/availability guarantee and does not collect/send customer input or add inference requests. Run scoped frontend checks and the relevant build/type checks; keep deployment status separate.
- Track the local connection gap as F09/AQ-022. Research a bounded candidate list using public evidence before any resource change; record explicit unknown/unavailable status rather than inventing a network.

AQ-011 completes the definition and current-implementation baseline. User testing, measured savings, implementation and live deployment remain separate evidence levels and open tasks.
