// Uses already-collected calendar evidence; never fetches or infers cancellation.
import {database} from './supabase-server.mjs';
const result=await database('rpc/aq_reconcile_calendar_publications',{method:'POST',body:{p_limit:50}});
console.log(JSON.stringify({calendarPublicationReconciliation:result}));
