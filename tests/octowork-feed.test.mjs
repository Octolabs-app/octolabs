import test from 'node:test';import assert from 'node:assert/strict';
import {getFeed} from '../functions/api/octowork/jobs.js';
test('one unavailable provider does not break the other provider',async()=>{
 const data=await getFeed(async url=>url.includes('remotive')?new Response('Blocked',{status:503}):Response.json({jobs:[{jobTitle:'Writer',url:'https://jobicy.com/jobs/123-writer',jobType:['contract'],companyName:'Example',jobGeo:'Anywhere'}]}));
 assert.equal(data.jobs.length,1);assert.equal(data.jobs[0].source,'Jobicy');assert.equal(data.jobs[0].hours,null);assert.equal(data.sources[0].status,'unavailable');assert.equal(data.sources[1].status,'ok');
});
test('HTML/error responses are not converted into pretend jobs',async()=>{const data=await getFeed(async()=>new Response('<html>Unavailable</html>'));assert.equal(data.jobs.length,0);assert.ok(data.sources.every(s=>s.status==='unavailable'));});
test('empty feeds are valid and unsafe listing URLs are dropped',async()=>{const data=await getFeed(async url=>Response.json({jobs:url.includes('remotive')?[{title:'Unsafe',url:'javascript:alert(1)'}]:[]}));assert.equal(data.jobs.length,0);assert.ok(data.sources.every(s=>s.status==='ok'));});
