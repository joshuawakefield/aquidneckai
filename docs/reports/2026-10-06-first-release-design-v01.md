# AquidneckAI first-release design brief — v0.1

Date: 2026-10-06. Task: AQ-024. **Proposed design, implemented as an isolated local prototype; not approved final branding, measured reader validation, staging or public release.** Builds on [AQ-011](2026-10-06-trades-reader-journey.md), [charter outcomes](../PROJECT-CHARTER.md) and AQ-021’s fictional customer exercise.

## The product decision

Make the first release a short path from curiosity to a checked action and a credible local connection. “Understand / Use / Connect” is the proposed information structure, not an owner-approved slogan. Lead with a recognizable customer-work problem for a self-employed trades owner; leave room for the curious neighbor and the future AI/robotics/autonomy hub. The hero’s “Less mystery. More possibility.” is testable draft copy, not a promise of financial improvement.

Start here because AQ-001 established restoration and AQ-003 exposed operational uncertainty, while AQ-021 supplied a useful isolated exercise. Those pieces do not yet explain what a reader should do next. A concrete journey makes future choices assessable: does this ticket help a reader understand evidence, complete a controlled experiment, or identify a credible connection? More collection volume alone does not answer that question.

## What someone can accomplish

| Step | Reader result | Evidence / guardrail |
|---|---|---|
| Overview | Recognize a small task after a day on the job; choose a guided start or jump to practice. | One lead action, three equally discoverable journey links; no fabricated feed or “latest” claim. |
| Understand | See a source summary, open the original, distinguish editorial application from source claims. | SBA resource reused from the existing static record; source-updated and checked dates separately labeled, no fresh verification claimed. |
| Use | Compare fictional facts with a deliberately flawed sample; identify an invented appointment; inspect a corrected version and decide whether the method helps. | AQ-021 gate-repair facts; both outputs explicitly handwritten, no model request, customer input or sending. Include checking time when judging usefulness. |
| Connect | Evaluate a local project’s relevance and limits; optionally open its public contact page. | Official description and route verified by public-page retrieval. Adult participation, costs, available projects, AI activity and introductions remain unknown. Preview/cancel makes the handoff explicit. |

These are prototype capabilities. They do not prove that readers find the journey useful or that a connection occurs. A reader may decline AI or decide this local project is not a fit; those are valid outcomes.

## Information hierarchy and visual direction

Reuse the reader’s cream background, dark evergreen text, serif headings and simple rules. This suggests a local editorial guide, with calm encouragement rather than a software dashboard. System fonts keep this preview independent of font services. No stock testimonials, generated community photographs, fabricated impact numbers or ornamental technology graphics.

The overview gives the trades-owner situation first, one primary source-led action and a direct practice shortcut. Three short cards expose the entire path. A restrained “Beyond the next job” section preserves the broader robotics/autonomy direction without pretending there is verified content for every topic. The first prototype does not replace the existing published feed/archive; eventual integration must retain those capabilities and truthful empty/error states.

Detail pages use a readable main column and an evidence sidebar. On mobile the content comes first and evidence follows, while crucial fiction/unknown labels remain beside the relevant action. Typography is at least 16px for body content, with smaller metadata; controls use visible keyboard focus and 44px button/navigation height. Links announce external/new-tab behavior. All steps remain directly accessible; there is no mandatory onboarding funnel, hidden menu, login or irreversible action. Browser back, reload and explicit return/cancel paths work without local storage.

Tradeoffs: the mobile detail is long; keeping uncertainty visible is more valuable than compressing it into a tooltip. The source-led default helps explain trust but delays practice by one step, so a direct practice link stays visible. A real community project with limited fit is more honest than a fictional perfect match; it is insufficient to claim the peer-network goal is solved. Reusing current visual language saves scope but is not a brand exploration. Plain static content is cheap to maintain here; production freshness needs an explicit editorial process.

## Content and freshness contract

Every future content detail should name the original source, source publication/update date when known, date AquidneckAI actually checked it, and whether the displayed statement is a source fact, editorial interpretation, fictional example or unresolved claim. Never substitute retrieval time for publication time. Show the scope of a check: opening a contact page verifies the route’s presence, not a reply, opening, endorsement or booked meeting.

For release integration, date-sensitive opportunities require an actual current check before recommendation. Missing or failed evidence should say unavailable/unverified, with the original route only if still defensible; never imply a successful refresh. Past events stay in the archive; cancellation and withdrawal remain explicit. Static guides retain dated checks and recheck notes rather than inventing a universal “fresh” badge. These rules are design requirements, not a new backend contract or implemented freshness scheduler.

Representative evidence:

- SBA: existing `sba-ai-small-business` record in [reader-resources](../../src/data/reader-resources.ts), source updated 2025-02-14 / checked 2026-10-05. Prototype explicitly says it was not rechecked. [Original guide](https://legacy.sba.gov/business-guide/manage-your-business/ai-small-business). No direct quotation or new product claim.
- Practice: [AQ-021 implementation](../../src/pages/ReaderHome.tsx), fictional wooden gate request. The Friday promise is a deliberately incorrect handwritten example and immediately reviewable; the corrected text removes it. Neither is claimed to be AI output.
- Connection: [FabNewport homepage](https://fabnewport.org/) and [official contact page](https://fabnewport.org/contact/) retrieved October 6. Homepage describes year-round local learning programs; contact page supplies a public inquiry route. No page update date was shown. Search results were irrelevant and ignored; Innovate Newport retrieval failed, so no claim was made from it. No external forms submitted, personal contacts copied, source enrollment or outreach performed. Recheck before production inclusion; this is not an endorsement or proof of an active AI collaboration.

## Non-goals and isolation

No app-wide rewrite, new service/dependency, public chatbot, customer-data collection, generated message/inference integration, account system, notifications, sponsorship inventory, source enrollment, content publication or hosting change. Budget telemetry remains AQ-003’s explicit unknown production contract; its numeric examples are fixture-only and unrelated to this reader proposal.

The prototype is a separate HTML/React entry under `prototypes/first-release/`. Production `src/App.tsx`, live routes and reader data are untouched. The normal production build does not include this HTML entry. It is not a security boundary if someone chooses to expose the development server; bind loopback only. No Site was created or published.

## How this becomes a release decision

There is no timeless “final design.” Freeze a reviewed **v1 release candidate** when its bounded outcomes and evidence are satisfactory; revise with observed reader failures. This v0.1 is the agent’s proposed coherent starting point under delegated judgment.

Before calling it validated, use an independently authorized small walkthrough with three to five representative solo/small-team trades owners, using fictional data. Proposed decision gate: each can find a useful task, distinguish interpretation from evidence, reject the invented appointment, and explain what the connection check does and does not establish, without moderator rescue. Record failures, effort including checking, whether they would try again, and anonymous limitations. Do not interpret a tiny sample as population-level proof or claim savings without comparable measurements. No recruitment or feedback collection occurred here.

Review the resulting evidence with the owner for a v1 scope/design decision. If readers cannot distinguish fiction from a real action, or source checks from opportunity availability, fix that before integration. If the first scenario does not match real customer work, change the scenario before adding more features. AQ-010 launch/rollback/access checks and separate deployment authorization remain required even after design review.

## Recommended order from here

| Order | Existing task | Why it advances the proposed release |
|---|---|---|
| 1 | AQ-022 | Strongest missing reader outcome: verify a genuinely suitable peer/collaborator/project route and expose limitations. Use this prototype’s evidence format; do not equate the FabNewport inquiry route with a solved peer network. Bounded public research can proceed while the draft design awaits review. |
| 2 | AQ-002 (offline inventory first) | Establish migration/recovery confidence before adding durable editorial or connection metadata. No live comparison without authorized read access. |
| 3 | AQ-010 | Convert the reviewed journey into concrete release/access/rollback checks; preserve existing feed/archive states and verify chosen routes. Design integration and any reader study need their own bounded task; do not wholesale copy the prototype over live routes. |
| 4 | AQ-023 | Design an honest usage snapshot source so eventual operation is maintainable; no provider polling or cap change. This supports reliability, not reader value by itself. |
| Later | AQ-007/AQ-008, then AQ-012 | Improve evidence quality/noise where coverage actually blocks usefulness; add an arc only when enough related published material exists. |

AQ-011 and AQ-021 are foundations already delivered, not tasks to repeat. AQ-006 source CRUD, AQ-013 routing, AQ-014 platform alternatives and AQ-015 sponsorship do not become launch priorities merely because they are available tickets. Parent owns next selection and launch; this child creates no successor or schedule.

## Local review and evidence

From the repository with Node 22 and installed dependencies: `npm run dev -- --host 127.0.0.1`, then open `http://127.0.0.1:8080/prototypes/first-release/`. Hash routes: `#/`, `#/evidence`, `#/practice`, `#/connect`. The [prototype README](../../prototypes/first-release/README.md) records checks and standalone build instructions. [Task journal](../journal/2026-10-06-2248Z-first-release-design.md) owns exact test, screenshot and remote closeout results and limitations.
