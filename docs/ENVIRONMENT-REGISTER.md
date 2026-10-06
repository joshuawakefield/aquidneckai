# Environment and access register

Updated: 2026-10-06. Public-safe capability and plan metadata only. Keep credentials, account identifiers, cookies, .env values, vault references and private exports out of Git. Actual secrets belong in approved environment/secret settings. Read [ARCHITECTURE](ARCHITECTURE.md) for runtime design and [PROJECT-STATE](PROJECT-STATE.md) for current application evidence.

## Dated evidence

| Component | Plan or intended use | Last evidence and capability | Limits or next check |
|---|---|---|---|
| ChatGPT subscription | Owner reports $100 Pro plan; AquidneckAI is the only current project | 2026-10-06 interview response; owner-reported plan context only. Billing and remaining usage not inspected. | Stay within existing plan/platform limits. No credit purchase, overage, cap increase or inference/API allowance inferred. Quota monitoring is not configured or available here. |
| GitHub development | joshuawakefield/aquidneckai, aqai-local-index | 2026-10-06: HTTPS fetch/push and exact remote verification succeeded for continuity updates through 0cd0d5a5e91527cbb8c0e8cea3f73e2440f3ccbc. | GitHub API access returned Forbidden in that task; native Git access worked. Test each required operation. main remains the older public site. |
| Codex Cloud | AquidneckAI development; Only me; package-manager networking | 2026-10-06: owner UI publication/visibility and independent setup recorded in PROJECT-STATE/CLOUD-HANDOFF. Node 22.23.3, Python 3.12.14; baseline passed at b9e49bd52a712e3d49bbdaa342293caab9c592ee. | No service secrets or runtime variables configured at that observation. Fresh restored-task verification remains AQ-001; refresh dependency preparation after changes. |
| Dot | Context reader and possible task coordinator | 2026-10-06: repository journal records environment discovery and canonical-document reading. | No recurring development schedule recorded; discovery is not proof of a restored coding task or a schedule. |
| Supabase | Free plan; runtime records | 2026-10-06: canonical architecture/state document the plan and server-side use. No live access check in this interview task. | Cloud development has no service binding. Migration history is unreconciled; no blanket database push. |
| OpenRouter | Runtime assessment with Gemini 2.5 Flash Lite | 2026-10-06 20:19 UTC historical usage snapshot in operating-cost report; $1 non-resetting key cap. No new inference/access check. | Keep price/call/recovery safeguards. Historical balance is not current balance or permission to spend. |
| Spaceship Hyperlift staging | Existing hosting; recorded $6.48/month | 2026-10-06 historical staging verification at b34b14e11e2fb7403afddef1fc4004a078620449, recorded in PROJECT-STATE. | Manual deployments; no deployment credentials available in this cloud setup. Charges are dated, not a current invoice. |
| Netlify apex/DNS | Existing older public aquidneckai.com | 2026-10-06 canonical state records preserved public apex and separate staging. No direct live recheck in this task. | No DNS/apex cutover authorized. Record exact verification when a later task checks it. |

## Update procedure

When an interaction changes a plan, access requirement or environment, update this table and a dated journal entry: what changed, who/what supplied the evidence, verification date, capability actually tested, limits and next action. Update ARCHITECTURE or PROJECT-STATE only when their current facts also change. Record requirements and presence/status; never secret values or credential-file contents.

Before dependent work, inspect existing binding metadata and variable names/presence safely, then perform the narrow authorized operation. Reuse platform HTTPS Git authentication; absent token variables do not establish missing Git access. Separate configured access, directly tested access, expired/failed access and unknown access. An authorization restriction survives the availability of credentials.

No reauthentication, account purchase, cap change, deployment, production query or permission expansion is implied by maintaining this register. Ask for the precise missing prerequisite only after independent work and existing-access checks.
