import test from 'node:test';
import assert from 'node:assert/strict';
import {explicitCalendarCancellation} from './calendar-signals.mjs';
test('first-seen cancelled/postponed calendar titles cannot pass automatic publication',()=>{
 for(const title of ['Cancelled: AI workshop','CANCELED — AI workshop','Postponed AI lecture','AI workshop (Cancelled)','AI workshop — Postponed'])assert.equal(explicitCalendarCancellation(title),true,title);
});
test('ordinary AI titles and incidental cancelled prose remain eligible for other evidence checks',()=>{
 for(const title of ['AI workshop','How AI handles cancelled appointments','Rescheduled AI workshop','Cancel culture and AI','Postponedness is not a status'])assert.equal(explicitCalendarCancellation(title),false,title);
});
