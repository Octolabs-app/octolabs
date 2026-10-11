import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {questionSet,eliminateOptions,medalFor,progressionFor} from '../octoflag/engine.mjs';

const countries=JSON.parse(readFileSync(new URL('../octoflag/countries.json',import.meta.url)));

test('fifty-fifty preserves the right answer in all quiz modes without mutation',()=>{
 for(const mode of ['tour','flag','find','capital','region'])for(let seed=0;seed<30;seed++){
  const questions=questionSet(countries,{mode,seed});
  for(const question of questions){
   const before=structuredClone(question),removed=eliminateOptions(question,seed);
   assert.equal(removed.length,2);
   assert.equal(new Set(removed).size,2);
   assert.ok(removed.every(value=>value!==question.correct&&question.options.some(option=>option.value===value)));
   assert.equal(question.options.filter(option=>!removed.includes(option.value)).length,2);
   assert.deepEqual(question,before);
   assert.deepEqual(removed,eliminateOptions(question,seed));
  }
 }
});

test('fifty-fifty defaults are stable, support different seeds, and reject unusable choices',()=>{
 const question={id:'lifeline',correct:'a',options:['a','b','c','d'].map(value=>({value}))};
 assert.deepEqual(eliminateOptions(question),eliminateOptions(question));
 const outcomes=new Set(Array.from({length:30},(_,seed)=>eliminateOptions(question,seed).sort().join(',')));
 assert.ok(outcomes.size>1);
 assert.throws(()=>eliminateOptions({...question,options:[{value:'a'},{value:'b'},{value:'b'}]}),RangeError);
});

test('medals reward percentage accuracy across quizzes with different lengths',()=>{
 for(const [correct,total,tier] of [[12,12,'gold'],[11,12,'gold'],[10,12,'silver'],[9,12,'silver'],[8,12,'bronze'],[6,12,'bronze'],[5,12,'explorer'],[0,12,'explorer'],[4,4,'gold'],[3,4,'silver'],[2,4,'bronze'],[1,4,'explorer'],[9,10,'gold'],[8,10,'silver'],[5,10,'bronze']]){
  assert.deepEqual(medalFor(correct,total),{tier});
 }
 assert.deepEqual(medalFor(99,12),{tier:'gold'});
 for(const [correct,total] of [[-1,12],[NaN,12],[1,0],[1,-1],[1,Infinity]])assert.deepEqual(medalFor(correct,total),{tier:'explorer'});
});

test('progression uses lifetime correct answers and advances exactly at each threshold',()=>{
 const thresholds=[0,12,36,72,144,288];
 for(let index=0;index<thresholds.length;index++){
  const total=thresholds[index],result=progressionFor(total);
  assert.equal(result.level,index+1);
  assert.equal(result.nextAt,thresholds[index+1]??null);
  assert.equal(result.progress,index===thresholds.length-1?1:0);
  if(index>0){
   const before=progressionFor(total-1);
   assert.equal(before.level,index);
   assert.equal(before.nextAt,total);
   assert.ok(before.progress>0&&before.progress<1);
  }
 }
 assert.deepEqual(progressionFor(24),{level:2,progress:.5,nextAt:36});
 assert.deepEqual(progressionFor(999),{level:6,progress:1,nextAt:null});
 assert.deepEqual(progressionFor(12.9),progressionFor(12));
 for(const value of [-1,NaN,Infinity])assert.deepEqual(progressionFor(value),{level:1,progress:0,nextAt:12});
});
