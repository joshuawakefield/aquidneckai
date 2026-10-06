// Display-only contract. Never fetch provider data or derive lifetime use from trial costs.
// The current summary RPC has no usage snapshot; missing data stays explicitly unknown.
export function inferenceBudget(snapshot) {
 const policy={capUsd:1,reset:'never',stopBelowUsd:0.02,nearLimitUsd:0.10};
 const unknown={...policy,checkedAt:null,usedUsd:null,remainingUsd:null};
 if(!snapshot||typeof snapshot.checkedAt!=='string'||!Number.isFinite(Date.parse(snapshot.checkedAt)))return unknown;
 const {usedUsd,remainingUsd}=snapshot;
 if(!Number.isFinite(usedUsd)||usedUsd<0||!Number.isFinite(remainingUsd)||remainingUsd<0||
   Math.abs(usedUsd+remainingUsd-policy.capUsd)>0.000001)return unknown;
 return {...policy,checkedAt:new Date(snapshot.checkedAt).toISOString(),usedUsd,remainingUsd};
}
