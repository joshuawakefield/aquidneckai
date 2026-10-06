import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sourceEligible} from './source-readiness.mjs';
const source={runtime_enabled:true,verification_status:'feed_parsed',definition:{monitor_enabled:true,monitor_mode:'rss'}};
test('a runtime flag alone never approves collection',()=>{
 assert.equal(sourceEligible({runtime_enabled:true,verification_status:'imported_unverified'}),false);
 assert.equal(sourceEligible({...source,verification_status:'imported_unverified'}),false);
 assert.equal(sourceEligible({...source,definition:{monitor_enabled:false,monitor_mode:'rss'}}),false);
 assert.equal(sourceEligible({...source,runtime_enabled:false}),false);
});
test('approval must match a supported monitoring method',()=>{
 assert.equal(sourceEligible(source),true);
 assert.equal(sourceEligible({...source,verification_status:'api_parsed'}),false);
 assert.equal(sourceEligible({...source,verification_status:'api_parsed',definition:{monitor_enabled:true,monitor_mode:'calendar'}}),true);
});
