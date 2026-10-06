# Final Dot launch and model-selection preparation

Task ID: AQ-020
Started: 2026-10-06T22:10:00Z (minute precision)
Starting commit: 47c5509f23f8a95e865bf82c4af275c099cd1e3e
Status: launch instructions prepared; Dot scheduling/delegation remains blocked in this chat

## Request

The owner asks how to have the Dot start ongoing work, whether a model router is necessary, and how to avoid using the highest-level model for everything. Help finish Dot setup and start the development loop, within the existing delegated repository authority, subscription limit and live-operation restrictions.

## Changes

Prepared DOT-START with an action message: weekday 9 AM America/New_York schedule, immediate fresh AQ-001 verification, then one serial AQ-021 implementation, and one bounded task per scheduled run. Included non-overlap, plan-limit behavior, context/test/remote closeout, Friday digest and truthful activation evidence. Linked it from handoff/index/operating record; recorded D-022 and current blocker.

## Decisions and rationale

Native model selection where available is sufficient for startup; use the platform default if selection is unavailable. A custom API router introduces separate credentials/cost/retry/evaluation work and does not configure Dot execution. Do not change the production Gemini/OpenRouter assessment path or infer that a subscription supplies API credits. Actual Dot model capability must be reported from its controls.

## Verification

Inspected the complete available tool catalog: no Dot control, scheduling or model-selection tool. Shell and cloud environment draft tools are available, but neither can launch or schedule a Dot. Official Dot task-document retrieval returned HTTP 403; no new UI capability is claimed. node scripts/check-project-memory.mjs --base 47c5509f23f8a95e865bf82c4af275c099cd1e3e passed for 41 Markdown files. git diff --check passed. No messages were sent to a Dot, schedule saved, fresh task launched, model API called or deployment performed by this chat.

## Next steps

Send the prepared DOT-START message to the owner's Dot. Obtain saved trigger/next-run and fresh task/remote evidence; then record actual model-selection capabilities and close AQ-001/AQ-020 only when their criteria pass. AQ-021 is the first product implementation after the startup check. This external capability step cannot be substituted with another run inside the current setup task.
