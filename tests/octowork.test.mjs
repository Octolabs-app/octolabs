import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeJob,assess,compare,letter,safeUrl,foundSkills} from '../octowork/core.mjs';
const cv='Technical writing and documentation for engineering software. I create tutorial materials and help pages for customers. French and English.';
const profiles=[{name:'A',cv,hours:4},{name:'B',cv:'Customer support and bookkeeping for local businesses. I maintain accounting records and respond to customer queries.',hours:2}];
const job=normalizeJob({title:'Technical writing contractor',url:'https://example.com/job?utm_source=x',description:'Technical writing and documentation.',type:'contract',location:'Worldwide',hours:2,remote:true,pay:'USD 100 per task'});
test('candidate match uses provided CV evidence',()=>{assert.equal(compare(job,profiles).winner,0);assert.equal(assess(job,profiles[0]).fit,'Fits work preferences');assert.equal(assess(job,profiles[0]).score,100);});
test('missing profile prevents declaring a winner',()=>assert.equal(compare(job,[profiles[0],{name:'B',cv:''}]).winner,null));
test('full time and excess hours are unsuitable even if contract',()=>{assert.equal(assess({...job,type:'full time contract'},profiles[0]).blocked,true);assert.equal(assess({...job,hours:5},profiles[0]).blocked,true);});
test('remote EU listings do not imply Mauritius eligibility',()=>{assert.equal(assess({...job,location:'EU',hours:null},profiles[0]).fit,'Needs checking');assert.equal(assess({...job,location:'Remote'},profiles[0]).eligible,false);});
test('explicit exclusion overrides worldwide text',()=>{assert.equal(assess({...job,eligibility:'no'},profiles[0]).blocked,true);});
test('unknown hours are never treated as confirmed',()=>assert.equal(assess({...job,hours:null},profiles[0]).hoursOk,false));
test('tie and zero overlap do not pick an ideal candidate',()=>{assert.equal(compare(job,[profiles[0],profiles[0]]).winner,null);assert.equal(compare({...job,title:'Nurse',description:'Clinical care'},profiles).winner,null);});
test('letters contain CV evidence and request missing eligibility',()=>{const draft=letter({...job,location:'Remote',hours:null},profiles[0]);assert.match(draft,/Technical writing and documentation for engineering software/);assert.match(draft,/confirm whether you can engage/);assert.doesNotMatch(draft,/years of experience/);assert.throws(()=>letter(job,{name:'A',cv:''}));});
test('untrusted URL and hours validation',()=>{assert.equal(safeUrl('javascript:alert(1)'),'');assert.throws(()=>normalizeJob({...job,hours:-1}));assert.equal(job.id,'https://example.com/job');assert.deepEqual(foundSkills('scam campaign'),[]);});

