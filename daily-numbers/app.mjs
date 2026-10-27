import {generate,replay,calculate,solved,resolveEdition,utcDay,restoreState,completionRecord} from './engine.mjs';
import {recordStarted,recordCompletion} from '/platform/progress.mjs';
const $=id=>document.getElementById(id), labels={'+':'+','-':'−','*':'×','/':'÷'};
const edition=resolveEdition(location.search), puzzle=generate(edition.seed);
const storageKey=`octolabs-numbers-v1:${edition.puzzleId}`;
let steps=[],selected=null,operator=null,helped=false,finished=false,storageOK=true;
const platformRecord={gameId:'daily-numbers',puzzleId:edition.puzzleId,period:'daily',periodKey:edition.day,summary:'Exact target reached'};
try {const restored=restoreState(puzzle,JSON.parse(localStorage.getItem(storageKey)||'null'));steps=restored.steps;helped=restored.helped;finished=solved(puzzle,steps);}catch{storageOK=false;}
function save(){try{localStorage.setItem(storageKey,JSON.stringify({version:1,steps,helped}));}catch{storageOK=false;} $('storage-note').textContent=storageOK?'Progress is saved on this browser. No account needed.':'Browser storage is unavailable. You can still play; progress may not survive a refresh.';}
function start(){if(edition.daily && utcDay()===edition.day)recordStarted(platformRecord);}
function complete(){const record=completionRecord(edition,{helped,target:puzzle.target,steps:steps.length});if(record)recordCompletion(record);}
function say(message){$('status').textContent=message;}
function draw(){
  const focusKey=document.activeElement?.dataset?.control;
  const {board,history}=replay(puzzle.tiles,steps);finished=solved(puzzle,steps);
  $('board').replaceChildren(...board.map(tile=>{const b=document.createElement('button');b.type='button';b.dataset.control=tile.id;b.className='tile';b.textContent=tile.value;b.setAttribute('aria-label',`${tile.value}${tile.id.startsWith('n')?', calculated result':''}`);b.setAttribute('aria-pressed',String(selected===tile.id));b.disabled=finished;b.onclick=()=>choose(tile.id);return b;}));
  $('operators').replaceChildren(...Object.entries(labels).map(([op,label])=>{const b=document.createElement('button');b.type='button';b.dataset.control=`op${op}`;b.textContent=label;b.title=({'+':'Add','-':'Subtract','*':'Multiply','/':'Divide'})[op];b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed',String(operator===op));b.disabled=finished||!selected;b.onclick=()=>{operator=op;draw();say('Choose the second tile.');};return b;}));
  $('history').replaceChildren(...history.map(h=>{const li=document.createElement('li');li.textContent=`${h.a} ${labels[h.op]} ${h.b} = ${h.value}`;return li;}));
  $('solution').disabled=finished;$('undo').disabled=!steps.length;$('reset').disabled=!steps.length&&!selected;
  $('result').hidden=!finished;
  if(finished){complete();$('result-text').textContent=`${puzzle.target} in ${steps.length} calculation${steps.length===1?'':'s'}. ${helped?'Solved with a revealed solution; daily completion is not recorded.':edition.daily?'Your daily puzzle is complete.':'Shared practice puzzle solved.'}`;say('Exact target reached. Well played!');}
  if(focusKey){const replacement=[...document.querySelectorAll('[data-control]')].find(b=>b.dataset.control===focusKey&&!b.disabled);(replacement??$('board').querySelector('button:not(:disabled)')??$('share-result')).focus();}
  save();
}
function choose(id){
  if(finished)return;start();
  if(!selected){selected=id;draw();say('Choose an operation.');return;}
  if(selected===id){selected=null;operator=null;draw();say('Choose a tile to begin.');return;}
  if(!operator){selected=id;draw();say('Choose an operation.');return;}
  const board=replay(puzzle.tiles,steps).board,a=board.find(t=>t.id===selected),b=board.find(t=>t.id===id);
  if(calculate(a.value,operator,b.value)===null){say('That operation needs a positive whole-number result. Try another tile or operation.');return;}
  steps.push({a:selected,b:id,op:operator});selected=null;operator=null;draw();if(!finished)say('Choose another tile to keep going.');
}
$('target').textContent=puzzle.target;$('edition').textContent=edition.daily?'YOUR DAILY BRAIN BREAK':'SHARED PRACTICE';$('date').textContent=edition.daily?`${edition.day} · UTC`:`Seed: ${edition.seed}`;
$('undo').onclick=()=>{steps.pop();selected=null;operator=null;draw();say('Last calculation undone.');};
$('reset').onclick=()=>{steps=[];selected=null;operator=null;draw();say('Puzzle reset. Same tiles, fresh start.');};
$('practice').onclick=()=>{const a=new Uint32Array(2);crypto.getRandomValues(a);location.href=`?seed=practice-${a[0].toString(36)}-${a[1].toString(36)}${edition.stream?'&stream=1':''}`;};
function link(){const url=new URL(location.href);url.search='';url.searchParams.set('seed',edition.seed);return url.href;}
async function copy(text){try{await navigator.clipboard.writeText(text);say('Copied. Your friends will get the same puzzle.');}catch{const field=$('copy-fallback');field.hidden=false;field.value=text;field.focus();field.select();say('Copy the selected text to share this puzzle.');}}
$('share').onclick=()=>copy(`Can you make ${puzzle.target}? Daily Numbers by Octolabs Games. ${link()}`);
$('board-share').onclick=$('share').onclick;
$('share-result').onclick=()=>copy(`Daily Numbers · ${edition.daily?edition.day:'Shared practice'}\nTarget ${puzzle.target} reached in ${steps.length} calculations${helped?' (solution revealed)':''}.\n${link()}`);
$('solution').onclick=()=>{if(finished)return;helped=true;const result=replay(puzzle.tiles,puzzle.solution);$('solution-text').hidden=false;$('solution-text').replaceChildren(...result.history.map(h=>{const p=document.createElement('p');p.textContent=`${h.a} ${labels[h.op]} ${h.b} = ${h.value}`;return p;}));save();if(!finished)say('Solution revealed. You can keep practicing; this will not count as an unassisted daily completion.');};
function stream(on){document.body.classList.toggle('stream',on);$('stream').setAttribute('aria-pressed',String(on));$('stream').textContent=on?'Standard view':'Streamer view';const url=new URL(location.href);if(on)url.searchParams.set('stream','1');else url.searchParams.delete('stream');history.replaceState(null,'',url);}
$('stream').onclick=()=>stream(!document.body.classList.contains('stream'));stream(edition.stream);draw();
