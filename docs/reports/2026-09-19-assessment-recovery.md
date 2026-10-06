# Assessment recovery — 2026-09-19

Historical report, curated on 2026-10-06. Later work supersedes these source counts, review UI limitations and geographic guard behavior. Read [PROJECT-STATE](../PROJECT-STATE.md) and [architecture](../ARCHITECTURE.md) for current behavior. This is evidence of completed work, not instructions or permission to repeat paid reassessments.

## Incident and correction

The eleven newly added RSS feeds each completed three successful collections, including unattended hosting repeats. No failed collection, stuck lease or duplicate source/URL/content-hash version appeared in that check. There were 134 expanded-source observations and 217 overall. An additional feed run introduced three genuinely new stories; repeated checks were not themselves duplicates.

An earlier report said OpenRouter credit had run out. That was wrong: the key preflight showed $0.97900705 remaining under its $1 cap. The blocked interactive command had encountered a separate Codex usage/approval-review limit. The hosted worker continued independently. See the explicit [September 18 correction](2026-09-18-credit-limited-status.md).

Forty observations were stuck as claimed. One saved model response returned seven decisions for eight inputs; the classifier discarded the entire batch on the count mismatch. Other decisions speculated that local technology/defense stories involved AI without exact evidence; deterministic checks correctly withheld those guesses.

## Recovery and changes

- Recovered eight records from saved responses without inference. Marked 32 unavailable-response records for review, then performed one explicit reassessment of those 32 plus one missing decision using conditional durable claims and preserving earlier reports.
- Five requests cost **$0.003298878**. All 33 reassessed items received valid decisions; no pending observations remained at verification.
- Handled response items independently; malformed, missing or duplicate decisions became review cases. Saved paid responses to the database before interpreting them. Normal cycles did not automatically retry ambiguous paid work.
- Removed image markup from the assessment excerpt, decoded common entities and expanded the bound from 2,500 to 6,000 characters. Rechecked saved decisions deterministically without new inference.
- Added authenticated inspection of observations with candidate/excluded/pending/review filters, readable excerpts, original sources and model/guard reasons. Human overrides were not yet implemented at this date.

Final historical assessment totals: 211 excluded for lack of evidence in supplied excerpts, five candidates (two calendar events and three archive resources), one review case. An excerpt exclusion did not prove the full linked article lacked AI content. The regional review case also reflected the old Island-connection guard; that overly narrow rule was removed in October.

## Verification and deployment

Production build, policy/assessment tests and UI tests passed. The final correction had 13 combined assessment/policy cases passing. Manual staging deployment of [`831b3db3c8a47436e533705f74ad242c3045a1f6`](https://github.com/joshuawakefield/aquidneckai/commit/831b3db3c8a47436e533705f74ad242c3045a1f6) completed at 13:32 UTC / 09:32 EDT.

Live health was 200 with a new hosted cycle at 13:32:04 UTC. Root/private preview required authentication; the public published API returned 200 with two Salve events. Authenticated inspection showed 217 processed, zero pending and one review case with readable excluded-item evidence. Tests/reports were excluded from the runtime-only upload at the time; private raw snapshots remain omitted from this public archive.

Subsequent October work added durable human editorial decisions, broader source collection, bounded database reads and tighter batch limits. Full linked-article enrichment remains a separate capability. The old public apex was preserved throughout.
