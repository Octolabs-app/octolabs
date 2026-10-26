// DOM integration tests using the same pinned Linkedom dependency as crossword CI.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const root=path.join(__dirname,'..');
const arrows=/[←→↗↘↖↙]/;
function dom(game){
 const {document,window}=parseHTML(fs.readFileSync(path.join(root,game,'index.html'),'utf8'));
 let focused;window.HTMLElement.prototype.focus=function(){focused=this;};window.scrollTo=()=>{};
 Object.defineProperty(document,'activeElement',{get:()=>focused||document.body});
 Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this._selectedValue??this.querySelector('option[selected]')?.value??this.querySelector('option')?.value;},set(value){this._selectedValue=String(value);}});
 Object.defineProperty(window.HTMLElement.prototype,'elements',{configurable:true,get(){return this.tagName==='FORM'?Object.fromEntries([...this.querySelectorAll('[name]')].map(el=>[el.getAttribute('name'),el])):undefined;}});
 for(const select of document.querySelectorAll('select'))Object.defineProperty(select,'value',{value:select.querySelector('option[selected]')?.value||select.querySelector('option')?.value,writable:true});
 const stored=new Map(),sharedLinks=[];
 return {document,window,stored,sharedLinks,focused:()=>focused,globals:{document,window,console,URL,URLSearchParams,
  location:{href:`https://octolabs.app/${game}/`,search:''},
  localStorage:{getItem:key=>stored.get(key)??null,setItem:(key,value)=>stored.set(key,value)},
  crypto:{randomUUID:()=> 'fresh-board'},navigator:{clipboard:{writeText:async value=>{sharedLinks.push(value);}}},
  FormData:function(form){return [...form.querySelectorAll('[name]')].map(el=>[el.getAttribute('name'),el.value]);},
  matchMedia:()=>({matches:true}),setInterval:()=>0,clearInterval(){},confirm:()=>true}};
}
function gameLink(container,label){
 const link=[...container.querySelectorAll('a')].find(a=>a.textContent.trim()===label);
 assert.ok(link,`missing named ${label} link`);
 assert.equal(link.getAttribute('href'),'/games/','catalog link must navigate to the dedicated games page');
}
function namedActions(document){
 for(const action of document.querySelectorAll('button,a'))assert.equal(arrows.test(action.textContent),false,`decorative arrow remains in ${action.textContent}`);
}
function focusedHeading(ui){
 const heading=ui.document.querySelector('#main h1');
 assert.equal(ui.focused(),heading,'new screens must focus their current heading');
 assert.equal(heading.getAttribute('tabindex'),'-1','heading is programmatically focusable without adding a tab stop');
 assert.ok(ui.document.contains(ui.focused()),'focus must remain attached to the current screen');
}
async function flagUI(rankedApi=async()=>{throw Error('Casual navigation must not call ranked API');},search=''){
 const ui=dom('octoflag'),engine=await import('../octoflag/engine.mjs');
 const countries=JSON.parse(fs.readFileSync(path.join(root,'octoflag/countries.json'),'utf8'));
 ui.globals.location={href:'https://octolabs.app/octoflag/'+search,search};
 const progress={started:[],completed:[]};
 const source=fs.readFileSync(path.join(root,'octoflag/app.mjs'),'utf8').replace(/^import .*;\n/gm,'');
 const api=await vm.runInNewContext(`(async()=>{${source}\nreturn {start,summary,home,getState:()=>({run,index,questions}),setLanguage:lang=>{settings.lang=lang;}};})()`,{...ui.globals,...engine,
  fetch:async()=>({ok:true,json:async()=>countries}),rankedApi,playerToken:()=> 'test-player',
  recordStarted:value=>progress.started.push(value),recordCompletion:value=>progress.completed.push(value)});
 return {...ui,api,progress};
}
test('OctoFlag casual results preserve scores and bilingual named navigation across replay',async()=>{
 const ui=await flagUI(),{document,api}=ui;gameLink(document.querySelector('header'),'All games');namedActions(document);
 assert.equal(ui.focused(),undefined,'initial async load must not steal focus');
 api.start();
 focusedHeading(ui);
 for(let i=0;i<12;i++){
  const {questions,index}=api.getState(),q=questions[index],correct=q.options.findIndex(o=>o.value===q.correct);
  await document.querySelector(`[data-answer="${correct}"]`).onclick();
  assert.equal(ui.focused(),document.getElementById('next'),'answer feedback leads to the enabled next action');
  await document.getElementById('next').onclick();
  focusedHeading(ui);
 }
 assert.equal(api.getState().run.answers.length,12);assert.equal(api.getState().run.answers.every(a=>a.correct),true);
 gameLink(document.querySelector('.summary'),'All games');namedActions(document);
 const completed=JSON.stringify(api.getState().run),saved=ui.stored.get('octoflag-correct');
 api.setLanguage('fr');api.summary();
 assert.equal(JSON.stringify(api.getState().run),completed,'translation must not modify completed scores');
 assert.equal(ui.stored.get('octoflag-correct'),saved,'summary rerender must not grant progress twice');
 gameLink(document.querySelector('header'),'Tous les jeux');gameLink(document.querySelector('.summary'),'Tous les jeux');namedActions(document);
 document.getElementById('again').onclick();assert.equal(api.getState().index,0);assert.equal(api.getState().run.answers.length,0);
 focusedHeading(ui);
 document.getElementById('back').onclick();focusedHeading(ui);
});

test('OctoFlag setup language and study rerenders preserve an operable focus target',async()=>{
 const ui=await flagUI(),{document}=ui;
 document.querySelector('[data-action=setup]').onclick();focusedHeading(ui);
 const language=document.querySelector('#setup [name=lang]');language.value='fr';language.focus();language.onchange();
 assert.equal(ui.focused(),document.querySelector('#setup [name=lang]'),'language change must restore the replacement select');
 assert.equal(document.documentElement.lang,'fr');
 document.getElementById('back').onclick();focusedHeading(ui);
 document.querySelector('[data-action=study]').onclick();focusedHeading(ui);
 document.getElementById('flip').onclick();
 assert.equal(ui.focused(),document.getElementById('flip'),'reveal retains its replacement action');
 assert.ok(document.contains(ui.focused()));
 document.getElementById('study-next').onclick();
 assert.equal(ui.focused(),document.getElementById('study-next'),'another country retains its replacement action');
 assert.ok(document.contains(ui.focused()));
});

test('OctoFlag leaderboard async content updates do not steal focus from period tabs',async()=>{
 const responses=[];
 const ui=await flagUI(()=>new Promise(resolve=>responses.push(resolve))),{document}=ui;
 const initial=document.querySelector('[data-action=leaderboard]').onclick();focusedHeading(ui);
 responses.shift()({entries:[]});await initial;
 focusedHeading(ui);
 const week=document.getElementById('board-week');week.focus();const request=week.onclick();
 assert.equal(ui.focused(),document.getElementById('board-week'));
 const retained=ui.focused();responses.shift()({entries:[]});await request;
 assert.equal(ui.focused(),retained,'network response must not move focus again');
 assert.ok(document.contains(retained));
});


test('OctoFlag direct daily records only a fully completed passport and does not double-count translated results',async()=>{
 const ui=await flagUI(undefined,'?daily=1'),{document,api,progress}=ui;
 const initial=api.getState();
 assert.equal(initial.run.daily,true,'catalog daily link must launch the actual daily edition');
 assert.equal(initial.questions.length,12);assert.equal(initial.run.total,12);
 assert.equal(initial.run.opts.mode,'tour');assert.equal(initial.run.opts.level,'expert');
 assert.equal(initial.run.opts.region,'all');assert.equal(initial.run.opts.players,1);
 assert.equal(progress.started.length,1);assert.equal(progress.completed.length,0);
 const day=initial.run.seed.match(/\d{4}-\d{2}-\d{2}$/)[0];
 assert.equal(progress.started[0].periodKey,day);assert.equal(progress.started[0].gameId,'octoflag');
 for(let i=0;i<12;i++){
  const {questions,index}=api.getState(),q=questions[index],correct=q.options.findIndex(o=>o.value===q.correct);
  await document.querySelector('[data-answer="'+correct+'"]').onclick();
  assert.equal(progress.completed.length,0,'an answered question is not yet a completed results screen');
  await document.getElementById('next').onclick();
 }
 assert.equal(progress.completed.length,1);
 assert.equal(progress.completed[0].puzzleId,initial.run.seed);
 assert.equal(progress.completed[0].periodKey,day);
 assert.equal(progress.completed[0].summary,'12/12 correct');
 api.setLanguage('fr');api.summary();api.summary();
 assert.equal(progress.completed.length,1,'translation and repeated results must not duplicate completion');
 gameLink(document.querySelector('.summary'),'Tous les jeux');
});

test('OctoFlag shared and casual rounds do not create daily passport starts',async()=>{
 const ui=await flagUI(undefined,'?challenge=octoflag-daily-2026-10-26'),{document,api,progress}=ui;
 document.getElementById('play-challenge').onclick();
 assert.equal(api.getState().run.daily,false);assert.equal(progress.started.length,0);
 api.start(false);assert.equal(progress.started.length,0);assert.equal(progress.completed.length,0);
});


test('OctoFlag dated daily shares keep their edition and progress date',async()=>{
 const ui=await flagUI(undefined,'?daily=1&day=2024-02-29&lang=fr'),{document,api,progress}=ui;
 assert.equal(api.getState().run.seed,'octoflag-daily-2024-02-29');
 assert.equal(progress.started[0].periodKey,'2024-02-29');
 assert.match(document.getElementById('question-context').textContent,/2024-02-29/);
 for(let i=0;i<12;i++){
  const {questions,index}=api.getState(),q=questions[index],correct=q.options.findIndex(o=>o.value===q.correct);
  await document.querySelector('[data-answer="'+correct+'"]').onclick();
  await document.getElementById('next').onclick();
 }
 await document.getElementById('share').onclick();
 const shared=new URL(ui.sharedLinks.at(-1));
 assert.equal(shared.searchParams.get('daily'),'1');assert.equal(shared.searchParams.get('day'),'2024-02-29');
 assert.equal(shared.searchParams.get('lang'),'fr');assert.equal(shared.searchParams.has('challenge'),false);
 assert.equal(progress.completed[0].periodKey,'2024-02-29');
 document.getElementById('again').onclick();assert.equal(api.getState().run.seed,'octoflag-daily-2024-02-29');
});

test('OctoFlag rejects impossible and malformed edition dates',async()=>{
 for(const day of ['2025-02-29','2026-02-30','2026-13-01','bad','2026-1-01']){
  const ui=await flagUI(undefined,'?daily=1&day='+day);
  assert.equal(ui.api.getState().run.daily,true);
  assert.notEqual(ui.progress.started[0].periodKey,day);
  assert.equal(ui.api.getState().questions.length,12);
 }
});
