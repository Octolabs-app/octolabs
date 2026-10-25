// DOM integration checks. Reproducible setup (CI uses the same pinned version):
// npm install --prefix /tmp/octolabs-dom --ignore-scripts --no-audit --no-fund linkedom@0.18.13
// NODE_PATH=/tmp/octolabs-dom/node_modules node --test tests/octocross-ui.cjs
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const root=path.join(__dirname,'..');
async function setup(){
 const {document,window}=parseHTML(fs.readFileSync(path.join(root,'octocross/index.html'),'utf8'));
 let focused;
 window.HTMLElement.prototype.focus=function(){focused=this;};
 window.HTMLElement.prototype.scrollIntoView=function(){};
 document.getElementById('win').showModal=function(){};
 document.getElementById('win').close=function(){};
 // Linkedom has no select value setter; model the native selected value for this test.
 for(const select of document.querySelectorAll('select'))Object.defineProperty(select,'value',{value:'',writable:true});
 const engine=await import('../octocross/engine.mjs'),{themes}=await import('../octocross/themes.mjs');
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'octocross/catalog.json'),'utf8'));
 const stored=new Map();
 const context=vm.createContext({document,window,console,URL,URLSearchParams,themes,...engine,
  location:{href:'https://octolabs.app/octocross/?theme='+themes[0].id+'&puzzle=1'},history:{replaceState(){}},
  localStorage:{getItem:key=>stored.get(key),setItem:(key,value)=>stored.set(key,value)},
  navigator:{clipboard:{writeText:async()=>{}}},setInterval(){},fetch:async()=>({ok:true,json:async()=>catalog})});
 const source=fs.readFileSync(path.join(root,'octocross/app.mjs'),'utf8').replace(/^import .*;\n/gm,'');
 const api=await vm.runInContext(`(async()=>{${source}\nreturn {select,put,load,entryCells,getState:()=>({selected,puzzle,letters,errors,checked,position,paused,saveKey})};})()`,context);
 return {document,api,getFocused:()=>focused};
}
test('answer text cannot leak to another clue, while same-entry movement preserves a draft',async()=>{
 const {document,api}=await setup(),{puzzle,selected}=api.getState();
 const other=puzzle.entries.find(e=>e.id!==selected.id&&e.answer.length===selected.answer.length)||puzzle.entries[1];
 document.getElementById('answer').value='EXAMPLE';api.select(selected,1);
 assert.equal(document.getElementById('answer').value,'EXAMPLE');
 api.select(other);assert.equal(document.getElementById('answer').value,'');
 assert.match(document.getElementById('answer-label').textContent,new RegExp(String(other.number)));
 document.getElementById('fill').onclick();assert.equal(Object.keys(api.getState().letters).length,0);
});
test('clear and undo restore shared letters and validation states; later edits invalidate undo',async()=>{
 const {document,api,getFocused}=await setup();const state=api.getState(),keys=api.entryCells(state.selected);
 keys.forEach((key,i)=>state.letters[key]=state.selected.answer[i]);state.errors.add(keys[0]);state.checked.add(keys[1]);
 const before=JSON.stringify(state.letters);document.getElementById('clear').onclick();
 assert.equal(keys.some(key=>api.getState().letters[key]),false);assert.equal(document.getElementById('undo-clear').hidden,false);
 document.getElementById('undo-clear').onclick();assert.equal(JSON.stringify(api.getState().letters),before);
 assert.equal(getFocused().classList.contains('selected'),true);
 assert.equal(getFocused().getAttribute('aria-label').includes('Row '),true);
 assert.equal(api.getState().errors.has(keys[0]),true);assert.equal(api.getState().checked.has(keys[1]),true);
 document.getElementById('clear').onclick();api.put('Z');assert.equal(document.getElementById('undo-clear').hidden,true);
 const changed=JSON.stringify(api.getState().letters);document.getElementById('undo-clear').onclick();assert.equal(JSON.stringify(api.getState().letters),changed);
});
test('clue buttons wrap in entry order and pause prevents navigation; puzzle load discards undo',async()=>{
 const {document,api}=await setup();const first=api.getState().puzzle.entries[0],last=api.getState().puzzle.entries.at(-1);
 document.getElementById('previous-clue').onclick();assert.equal(api.getState().selected.id,last.id);
 document.getElementById('next-clue').onclick();assert.equal(api.getState().selected.id,first.id);
 document.getElementById('pause').onclick();document.getElementById('next-clue').onclick();assert.equal(api.getState().selected.id,first.id);
 document.getElementById('resume').onclick();api.put('A');document.getElementById('clear').onclick();assert.equal(document.getElementById('undo-clear').hidden,false);
 api.load(0,1);assert.equal(document.getElementById('undo-clear').hidden,true);
});
