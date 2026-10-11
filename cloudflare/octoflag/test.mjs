import {after, before, beforeEach, test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash, randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {questionSet, scoreAnswer} from '../../octoflag/engine.mjs';

const ORIGIN='https://octolabs.app';
const countries=JSON.parse(await readFile(new URL('../../octoflag/countries.json',import.meta.url),'utf8'));
const hash=value=>createHash('sha256').update(value).digest('hex');
let runtime,db;

before(async()=>{
 const bundle=await build({entryPoints:[fileURLToPath(new URL('./worker.mjs',import.meta.url))],bundle:true,format:'esm',write:false,logLevel:'silent'});
 runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-10-07',d1Databases:{DB:'octoflag-tests'}}));
 db=await runtime.getD1Database('DB');
 // Only the isolated Miniflare D1 database is changed by these tests.
 const migration=await readFile(new URL('./migrations/0001_rankings.sql',import.meta.url),'utf8');
 await db.batch(migration.split(';').map(s=>s.trim()).filter(Boolean).map(sql=>db.prepare(sql)));
});
after(async()=>{await runtime?.dispose();});
beforeEach(async()=>{await db.batch([db.prepare('DELETE FROM ranked_runs'),db.prepare('DELETE FROM daily_scores')]);});

async function post(route,body,headers={}){
 const response=await runtime.dispatchFetch(`${ORIGIN}/octoflag/api/${route}`,{method:'POST',headers:{Origin:ORIGIN,'Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
 return {status:response.status,data:await response.json()};
}
async function get(route){
 const response=await runtime.dispatchFetch(`${ORIGIN}/octoflag/api/${route}`);
 return {status:response.status,data:await response.json()};
}
async function start(playerToken=randomUUID(),lang='en'){
 const result=await post('start',{playerToken,lang});
 assert.equal(result.status,200,JSON.stringify(result.data));
 return {...result.data,playerToken};
}
function questions(run,lang='en'){
 return questionSet(countries,{seed:`ranked-v1-${run.day}`,mode:'tour',level:'expert',region:'all',lang,count:12});
}
function assertPublicQuestion(q,expected){
 assert.equal(q.id,expected.id);
 assert.equal(q.type,expected.type);
 assert.equal(q.prompt,expected.prompt);
 assert.equal('correct' in q,false);
 assert.equal('correctValue' in q,false);
 const allowed=expected.type==='flag'?['code']:expected.type==='find'?['fr','name']:['code','fr','name'];
 assert.deepEqual(Object.keys(q.country).sort(),allowed.sort());
 assert.equal('capital' in q.country,false);
 assert.equal('region' in q.country,false);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options.map(o=>o.value)).size,4);
 for(const option of q.options){
  assert.equal('correct' in option,false);
  assert.equal('isCorrect' in option,false);
  if(expected.type!=='find')assert.equal('code' in option,false);
 }
}
async function finish(run,{allCorrect=true,lang='en'}={}){
 const expected=questions(run,lang);
 let current=run,last;
 for(let index=0;index<expected.length;index++){
  assert.equal(current.index,index);
  assertPublicQuestion(current.question,expected[index]);
  const value=allCorrect?expected[index].correct:expected[index].options.find(o=>o.value!==expected[index].correct).value;
  last=await post('answer',{token:run.token,index,value,score:999999999});
  assert.equal(last.status,200,JSON.stringify(last.data));
  assert.equal(last.data.correct,allCorrect);
  assert.equal(last.data.index,index);
  assert.equal(last.data.complete,index===expected.length-1);
  if(index<expected.length-1){
   const next=await post('next',{token:run.token,index:index+1});
   assert.equal(next.status,200,JSON.stringify(next.data));
   current=next.data;
  }
 }
 return last.data;
}

test('start sends a minimal question, random private token and no answer key',async()=>{
 const run=await start();
 assert.equal(run.index,0);
 assert.equal(run.total,12);
 assert.equal(run.complete,false);
 assert.ok(run.deadline>run.serverNow);
 assert.ok(run.deadline-run.serverNow<=15000);
 assert.deepEqual(run.snapshot,{score:0,streak:0,bestStreak:0,correct:0,elapsed:0});
 assert.notEqual(run.token,run.playerToken);
 assertPublicQuestion(run.question,questions(run)[0]);
 const stored=await db.prepare('SELECT id,player FROM ranked_runs').first();
 assert.equal(stored.id,hash(run.token));
 assert.equal(stored.player,hash(run.playerToken));
});

test('mutations reject other origins, missing identity and malformed or oversized JSON',async()=>{
 const identity={playerToken:randomUUID()};
 assert.equal((await post('start',identity,{Origin:'https://attacker.example'})).status,403);
 assert.equal((await post('start',identity,{Origin:''})).status,403);
 assert.equal((await post('start',{})).status,400);
 assert.equal((await post('start',{playerToken:'guess'})).status,400);
 for(const malformed of ['{','null','[]','false','{"playerToken":"'+randomUUID()+'","padding":"'+'x'.repeat(5000)+'"}']){
  assert.equal((await post('start',malformed)).status,400);
 }
 assert.equal((await post('start',identity,{'Content-Type':'text/plain'})).status,400);
 assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM ranked_runs').first()).count,0);
});

test('a score cannot be submitted before the server has accepted all twelve answers',async()=>{
 const run=await start();
 const submission=await post('submit',{token:run.token,playerToken:run.playerToken,nickname:'Injected Winner',score:999999999,correct:12});
 assert.equal(submission.status,409);
 assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM daily_scores').first()).count,0);
 assert.equal((await post('answer',{token:'a'.repeat(36),index:0,value:questions(run)[0].correct})).status,410);
 assert.equal((await post('next',{token:randomUUID(),index:0})).status,410);
});

test('concurrent answers lock once, retries restore that result and do not add points',async()=>{
 const run=await start(),q=questions(run)[0];
 const results=await Promise.all(Array.from({length:8},()=>post('answer',{token:run.token,index:0,value:q.correct})));
 assert.ok(results.some(r=>r.status===200));
 assert.ok(results.every(r=>[200,409].includes(r.status)),JSON.stringify(results));
 const row=await db.prepare('SELECT * FROM ranked_runs WHERE id=?').bind(hash(run.token)).first();
 assert.equal(row.idx,1);
 assert.equal(row.score,100);
 assert.equal(row.correct,1);
 assert.equal(JSON.parse(row.answers).length,1);
 const retry=await post('answer',{token:run.token,index:0,value:q.options.find(o=>o.value!==q.correct).value});
 assert.equal(retry.status,200);
 assert.equal(retry.data.correct,true);
 assert.equal(retry.data.correctValue,q.correct);
 assert.equal(retry.data.snapshot.score,100);
 assert.equal((await post('answer',{token:run.token,index:1,value:questions(run)[1].correct})).status,409);
 assert.equal((await post('answer',{token:run.token,index:8,value:'invalid'})).status,409);
});

test('next never renews an active deadline, including concurrent requests',async()=>{
 const run=await start(),first=await post('next',{token:run.token,index:0});
 assert.equal(first.status,200);
 assert.equal(first.data.deadline,run.deadline);
 await post('answer',{token:run.token,index:0,value:questions(run)[0].correct});
 const nexts=await Promise.all(Array.from({length:5},()=>post('next',{token:run.token,index:1})));
 assert.ok(nexts.every(r=>r.status===200));
 assert.equal(new Set(nexts.map(r=>r.data.deadline)).size,1);
 const controlledDeadline=Date.now()+2500;
 await db.prepare('UPDATE ranked_runs SET deadline=? WHERE id=?').bind(controlledDeadline,hash(run.token)).run();
 const restored=await post('next',{token:run.token,index:1});
 assert.equal(restored.data.deadline,controlledDeadline);
 assert.equal((await post('next',{token:run.token,index:0})).status,409);
});

test('expired answers are locked as wrong even with the correct value',async()=>{
 const run=await start();
 await db.prepare('UPDATE ranked_runs SET deadline=? WHERE id=?').bind(Date.now()-2000,hash(run.token)).run();
 const answer=await post('answer',{token:run.token,index:0,value:questions(run)[0].correct});
 assert.equal(answer.status,200);
 assert.equal(answer.data.correct,false);
 assert.equal(answer.data.timedOut,true);
 assert.equal(answer.data.points,0);
 assert.equal(answer.data.snapshot.elapsed,15000);
 const row=await db.prepare('SELECT answers FROM ranked_runs WHERE id=?').bind(hash(run.token)).first();
 assert.equal(JSON.parse(row.answers)[0].value,null);
});

test('restoring an active question reports current server time and keeps an elapsed deadline',async()=>{
 const run=await start(),pastDeadline=Date.now()-2000;
 await db.prepare('UPDATE ranked_runs SET deadline=? WHERE id=?').bind(pastDeadline,hash(run.token)).run();
 const requestedAt=Date.now(),restored=await post('next',{token:run.token,index:0}),receivedAt=Date.now();
 assert.equal(restored.status,200);
 assert.equal(restored.data.deadline,pastDeadline);
 assert.equal(restored.data.index,0);
 assert.ok(restored.data.serverNow>=requestedAt);
 assert.ok(restored.data.serverNow<=receivedAt);
 assert.ok(restored.data.serverNow>run.serverNow);
 assert.ok(restored.data.deadline-restored.data.serverNow<=-2000);
});

test('a full French daily sprint submits only calculated scores and requires its private owner',async()=>{
 const run=await start(randomUUID(),'fr'),summary=await finish(run,{lang:'fr'});
 let expectedScore=0,streak=0;
 for(let index=0;index<12;index++){const s=scoreAnswer(true,streak);expectedScore+=s.points;streak=s.streak;}
 assert.equal(summary.snapshot.score,expectedScore);
 assert.equal(summary.snapshot.correct,12);
 assert.equal(summary.snapshot.bestStreak,12);
 assert.equal((await post('submit',{token:run.token,playerToken:randomUUID(),nickname:'Other player'})).status,403);
 for(const nickname of ['a','x'.repeat(21),'<script>','Alice\u200bBob']){
  assert.equal((await post('submit',{token:run.token,playerToken:run.playerToken,nickname})).status,400);
 }
 const submitted=await post('submit',{token:run.token,playerToken:run.playerToken,nickname:'  Ａｌｅｘ　 Ｒｏｓｅ  ',score:999999999,correct:999,elapsed:-1});
 assert.equal(submitted.status,200);
 assert.equal(submitted.data.best,expectedScore);
 assert.equal(submitted.data.rank,1);
 const board=await get('leaderboard');
 assert.equal(board.status,200);
 assert.equal(board.data.entries.length,1);
 assert.deepEqual(Object.keys(board.data.entries[0]).sort(),['correct','days','elapsed','nickname','rank','score']);
 assert.equal(board.data.entries[0].nickname,'Alex Rose');
 assert.equal(board.data.entries[0].score,expectedScore);
 assert.equal(board.data.entries[0].correct,12);
 const completed=await post('next',{token:run.token,index:12});
 assert.equal(completed.status,200);
 assert.equal(completed.data.complete,true);
 assert.equal('question' in completed.data,false);
});

test('one player has only one daily best; replay and lower scores cannot replace it',async()=>{
 const playerToken=randomUUID(),first=await start(playerToken);
 const completed=await finish(first);
 assert.equal((await post('submit',{token:first.token,playerToken,nickname:'First Name'})).status,200);
 // Reposting one run is idempotent, even with a forged client score.
 assert.equal((await post('submit',{token:first.token,playerToken,nickname:'Second Name',score:999999999})).data.best,completed.snapshot.score);
 const worse=await start(playerToken);
 await finish(worse,{allCorrect:false});
 const replay=await post('submit',{token:worse.token,playerToken,nickname:'Worse Name',score:999999999});
 assert.equal(replay.status,200);
 assert.equal(replay.data.best,completed.snapshot.score);
 const rows=(await db.prepare('SELECT * FROM daily_scores').all()).results;
 assert.equal(rows.length,1);
 assert.equal(rows[0].nickname,'First Name');
 assert.equal(rows[0].score,completed.snapshot.score);
});

test('today and seven-day boards aggregate real D1 rows, exclude old/future data and sort score then elapsed',async()=>{
 const today=new Date().toISOString().slice(0,10),dayAgo=n=>new Date(Date.now()-n*86400000).toISOString().slice(0,10);
 const rows=[
  [today,'p1','Alice today',500,4,6000,1],
  [dayAgo(1),'p1','Alice yesterday',600,5,7000,2],
  [dayAgo(6),'p2','Bob',1100,9,14000,3],
  [today,'p3','Carol',500,4,5000,4],
  [dayAgo(7),'p4','Too old',99999,12,1,5],
  [dayAgo(-1),'p5','In the future',99999,12,1,6]
 ];
 await db.batch(rows.map(row=>db.prepare('INSERT INTO daily_scores(day,player,nickname,score,correct,elapsed,created) VALUES(?,?,?,?,?,?,?)').bind(...row)));
 const daily=(await get('leaderboard?period=today')).data;
 assert.equal(daily.from,today);
 assert.deepEqual(daily.entries.map(r=>[r.rank,r.nickname,r.score,r.days]),[[1,'Carol',500,1],[2,'Alice today',500,1]]);
 const weekly=(await get('leaderboard?period=week')).data;
 assert.equal(weekly.from,dayAgo(6));
 assert.deepEqual(weekly.entries.map(r=>[r.rank,r.nickname,r.score,r.days]),[[1,'Alice today',1100,2],[2,'Bob',1100,1],[3,'Carol',500,1]]);
 assert.equal(weekly.entries[0].correct,9);
 assert.equal(weekly.entries[0].elapsed,13000);
 assert.equal(JSON.stringify(weekly).includes('p1'),false);
});

test('expired private runs return 410 and leaderboard reads remain public',async()=>{
 const run=await start();
 await db.prepare('UPDATE ranked_runs SET expires=? WHERE id=?').bind(Date.now()-1,hash(run.token)).run();
 assert.equal((await post('next',{token:run.token,index:0})).status,410);
 assert.equal((await post('answer',{token:run.token,index:0,value:questions(run)[0].correct})).status,410);
 assert.equal((await get('leaderboard?period=week')).status,200);
 assert.equal((await get('health')).data.version,'ranked-v1');
});

test('submitted rank agrees with the visible board when score and elapsed time tie',async()=>{
 const run=await start(),completed=await finish(run);
 await db.prepare('INSERT INTO daily_scores(day,player,nickname,score,correct,elapsed,created) VALUES(?,?,?,?,?,?,?)').bind(run.day,'earlier-player','Earlier explorer',completed.snapshot.score,12,completed.snapshot.elapsed,Date.now()-1000).run();
 const submitted=await post('submit',{token:run.token,playerToken:run.playerToken,nickname:'Later explorer'});
 assert.equal(submitted.status,200);
 assert.equal(submitted.data.rank,2);
 const board=(await get('leaderboard')).data.entries;
 assert.equal(board.find(row=>row.nickname==='Later explorer').rank,submitted.data.rank);
 assert.equal(board[0].nickname,'Earlier explorer');
});
