import countries from '../../octoflag/countries.json';
import {questionSet,scoreAnswer} from '../../octoflag/engine.mjs';

const PREFIX='/octoflag/api/',VERSION='ranked-v1';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const error=(message,status=400)=>json({ok:false,error:message},status);
const dayOf=now=>new Date(now).toISOString().slice(0,10);
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const validToken=v=>typeof v==='string'&&/^[a-zA-Z0-9-]{32,80}$/.test(v);
const publicQuestion=q=>({id:q.id,type:q.type,prompt:q.prompt,country:q.type==='flag'?{code:q.country.code}:{name:q.country.name,fr:q.country.fr,...(q.type!=='find'?{code:q.country.code}:{})},options:q.options.map(({code,...o})=>({...o,...(q.type==='find'?{code}:{})}))});
const scoreState=r=>({score:r.score,streak:r.streak,bestStreak:r.best_streak,correct:r.correct,elapsed:r.elapsed});
export function cleanNickname(v){
 if(typeof v!=='string')return null;
 const name=v.normalize('NFKC').replace(/\s+/gu,' ').trim();
 return name.length>=2&&name.length<=20&&/^[\p{L}\p{M}\p{N} ._-]+$/u.test(name)?name:null;
}
async function readBody(request){
 if(!request.headers.get('content-type')?.includes('application/json'))throw Error('Use JSON.');
 const reader=request.body?.getReader();if(!reader)throw Error('Missing request.');
 let bytes=0,chunks=[];while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>4096){await reader.cancel();throw Error('Request too large.');}chunks.push(value);}
 const all=new Uint8Array(bytes);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.length;}return JSON.parse(new TextDecoder().decode(all));
}
async function getRun(env,token,now){
 if(!validToken(token))return null;
 return env.DB.prepare('SELECT * FROM ranked_runs WHERE id=? AND expires>?').bind(await hash(token),now).first();
}
function responseFor(r){
 const qs=JSON.parse(r.questions);return {ok:true,day:r.day,index:r.idx,total:qs.length,complete:r.idx===qs.length,deadline:r.deadline,serverNow:Date.now(),snapshot:scoreState(r),...(r.idx<qs.length?{question:publicQuestion(qs[r.idx])}:{})};
}
async function leaderboard(env,period,now){
 const today=dayOf(now),week=dayOf(now-6*86400000);
 // The weekly display name comes from the latest submitted day, not an arbitrary grouped row.
 const stmt=period==='week'?env.DB.prepare(`SELECT (SELECT d.nickname FROM daily_scores d WHERE d.player=s.player AND d.day>=? AND d.day<=? ORDER BY d.day DESC LIMIT 1) AS nickname,SUM(s.score) AS score,SUM(s.correct) AS correct,SUM(s.elapsed) AS elapsed,COUNT(*) AS days FROM daily_scores s WHERE s.day>=? AND s.day<=? GROUP BY s.player ORDER BY score DESC,elapsed ASC,MIN(s.created) ASC LIMIT 50`).bind(week,today,week,today):env.DB.prepare('SELECT nickname,score,correct,elapsed,1 AS days FROM daily_scores WHERE day=? ORDER BY score DESC,elapsed ASC,created ASC LIMIT 50').bind(today);
 const rows=(await stmt.all()).results;
 return json({ok:true,period,day:today,from:period==='week'?week:today,entries:rows.map((r,i)=>({...r,rank:i+1}))});
}
export default {
 async fetch(request,env){
  const url=new URL(request.url),now=Date.now();
  if(!url.pathname.startsWith(PREFIX))return error('Not found.',404);
  const route=url.pathname.slice(PREFIX.length);
  if(request.method==='GET'&&route==='health')return json({ok:true,version:VERSION});
  if(request.method==='GET'&&route==='leaderboard'){
   try{return await leaderboard(env,url.searchParams.get('period')==='week'?'week':'today',now);}catch{console.error(JSON.stringify({event:'leaderboard_error'}));return error('The leaderboard is taking a break. Try again shortly.',503);}
  }
  if(request.method!=='POST')return error('Method not allowed.',405);
  const origin=request.headers.get('origin');
  if(!['https://octolabs.app','https://www.octolabs.app',env.LOCAL_ORIGIN].filter(Boolean).includes(origin))return error(env.LOCAL_ORIGIN?'Unexpected local origin: '+origin:'This request must come from Octolabs.',403);
  const ip=request.headers.get('CF-Connecting-IP')??'local';
  if(env.API_LIMIT&&!(await env.API_LIMIT.limit({key:ip})).success)return error('A few too many requests. Please wait a moment.',429);
  let body;try{body=await readBody(request);if(!body||typeof body!=='object'||Array.isArray(body))throw Error();}catch{return error('Invalid request.');}
  try{
   if(route==='start'){
    if(env.START_LIMIT&&!(await env.START_LIMIT.limit({key:ip})).success)return error('Please wait a minute before starting another sprint.',429);
    if(!validToken(body.playerToken))return error('Missing player identity.');
    const token=crypto.randomUUID(),id=await hash(token),player=await hash(body.playerToken),day=dayOf(now),lang=body.lang==='fr'?'fr':'en';
    const questions=questionSet(countries,{seed:VERSION+'-'+day,mode:'tour',level:'expert',region:'all',lang,count:12});
    const r={id,player,day,questions:JSON.stringify(questions),answers:'[]',idx:0,deadline:now+15000,score:0,streak:0,best_streak:0,correct:0,elapsed:0,expires:now+1800000};
    await env.DB.prepare('INSERT INTO ranked_runs(id,player,day,questions,deadline,expires) VALUES(?,?,?,?,?,?)').bind(id,player,day,r.questions,r.deadline,r.expires).run();
    return json({...responseFor(r),token});
   }
   const r=await getRun(env,body.token,now);if(!r)return error('This sprint expired. Start a new one.',410);
   const qs=JSON.parse(r.questions),answers=JSON.parse(r.answers);
   if(route==='answer'){
    if(!Number.isInteger(body.index))return error('Missing question number.');
    if(body.index===r.idx-1&&answers.at(-1))return json({ok:true,...answers.at(-1).result,snapshot:scoreState(r),complete:r.idx===qs.length});
    if(body.index!==r.idx||r.idx>=qs.length||r.deadline===0)return error('That answer is already locked.',409);
    const q=qs[r.idx];if(body.value!==null&&!q.options.some(o=>o.value===body.value))return error('Choose one of the four answers.');
    const accepted=now<=r.deadline+1000,correct=accepted&&body.value===q.correct,s=scoreAnswer(correct,r.streak),elapsed=Math.min(15000,Math.max(0,now-(r.deadline-15000)));
    const result={value:accepted?body.value:null,correct,correctValue:q.correct,points:s.points,country:q.country,index:r.idx,timedOut:!accepted||body.value===null};
    answers.push({value:accepted?body.value:null,result});
    const next={...r,idx:r.idx+1,deadline:0,answers:JSON.stringify(answers),score:r.score+s.points,streak:s.streak,best_streak:Math.max(r.best_streak,s.streak),correct:r.correct+Number(correct),elapsed:r.elapsed+elapsed};
    const updated=await env.DB.prepare('UPDATE ranked_runs SET idx=?,deadline=0,answers=?,score=?,streak=?,best_streak=?,correct=?,elapsed=? WHERE id=? AND idx=? AND deadline=? RETURNING id').bind(next.idx,next.answers,next.score,next.streak,next.best_streak,next.correct,next.elapsed,r.id,r.idx,r.deadline).first();
    if(!updated)return error('That answer is already locked. Retry to restore it.',409);
    return json({ok:true,...result,snapshot:scoreState(next),complete:next.idx===qs.length});
   }
   if(route==='next'){
    if(body.index!==r.idx)return error('Refresh the current question.',409);
    if(r.idx>=qs.length)return json(responseFor(r));
    if(r.deadline===0){const updated=await env.DB.prepare('UPDATE ranked_runs SET deadline=? WHERE id=? AND idx=? AND deadline=0 RETURNING deadline').bind(now+15000,r.id,r.idx).first();r.deadline=updated?.deadline??(await getRun(env,body.token,now)).deadline;}
    return json(responseFor(r));
   }
   if(route==='submit'){
    if(r.idx!==qs.length)return error('Complete the sprint before posting a score.',409);
    if(!validToken(body.playerToken)||await hash(body.playerToken)!==r.player)return error('This is not your score.',403);
    const nickname=cleanNickname(body.nickname);if(!nickname)return error('Use a nickname of 2–20 letters or numbers.');
    // Accept only server-calculated values. A replay cannot overwrite a better daily score.
    await env.DB.batch([
     env.DB.prepare(`INSERT INTO daily_scores(day,player,nickname,score,correct,elapsed,created) VALUES(?,?,?,?,?,?,?) ON CONFLICT(day,player) DO UPDATE SET nickname=excluded.nickname,score=excluded.score,correct=excluded.correct,elapsed=excluded.elapsed,created=excluded.created WHERE excluded.score>daily_scores.score OR (excluded.score=daily_scores.score AND excluded.elapsed<daily_scores.elapsed)`).bind(r.day,r.player,nickname,r.score,r.correct,r.elapsed,now),
     env.DB.prepare('UPDATE ranked_runs SET submitted=1 WHERE id=?').bind(r.id)
    ]);
    const best=await env.DB.prepare('SELECT score,elapsed,created FROM daily_scores WHERE day=? AND player=?').bind(r.day,r.player).first();
    const rank=await env.DB.prepare('SELECT COUNT(*)+1 AS rank FROM daily_scores WHERE day=? AND (score>? OR (score=? AND elapsed<?) OR (score=? AND elapsed=? AND created<?))').bind(r.day,best.score,best.score,best.elapsed,best.score,best.elapsed,best.created).first('rank');
    return json({ok:true,rank,day:r.day,best:best.score});
   }
   return error('Not found.',404);
  }catch{console.error(JSON.stringify({event:'ranked_request_error',route}));return error('Connection interrupted. Try that step again.',503);}
 },
 async scheduled(_controller,env,ctx){ctx.waitUntil(env.DB.batch([env.DB.prepare('DELETE FROM ranked_runs WHERE expires<?').bind(Date.now()),env.DB.prepare('DELETE FROM daily_scores WHERE day<?').bind(dayOf(Date.now()-90*86400000))]));}
};
