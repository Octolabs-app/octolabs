const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {parseHTML}=require('linkedom');
function app(){
 const {document,window}=parseHTML(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'));
 window.HTMLElement.prototype.showModal=function(){this.open=true};
 window.HTMLElement.prototype.close=function(){this.open=false};
 const storage=new Map(),events={};
 const context={document,location:{hash:'',hostname:'octolabs.app'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},console,Intl,Date,Math,URL,Blob,setInterval(){},setTimeout(){},clearTimeout(){},confirm:()=>false,FormData:class{constructor(form){this.data=Array.from(form.querySelectorAll('[name]')).map(e=>[e.name,e.value])}[Symbol.iterator](){return this.data[Symbol.iterator]()}get(k){return this.data.find(([n])=>n===k)?.[1]}},fetch:()=>{throw Error('Unexpected network request')},AbortSignal};
 context.window=context;context.scrollTo=()=>{};context.addEventListener=(n,f)=>{events[n]=f};vm.createContext(context);
 for(const file of ['model.js','app.js','design.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context,{filename:file});
 return {document,context,run:s=>vm.runInContext(s,context),click(selector){const e=document.querySelector(selector);assert.ok(e,selector);e.dispatchEvent(new window.Event('click',{bubbles:true}))},route(name){context.location.hash='#'+name;events.hashchange()}};
}
test('real document retains household anchor through repeated rendering and every route',()=>{
 const a=app();for(const name of ['tasks','kitchen','shopping','routines','departments','household','home','tasks']){a.route(name);assert.ok(a.document.getElementById('house-name'),name);assert.ok(a.document.getElementById('main').textContent.length>100,name)}
 assert.equal(a.run('KEY'),'octohome.v1');
});
test('department SVG click navigates and filters actual DOM',()=>{const a=app();a.click('[data-dept="Cleaning"] svg path');assert.equal(a.context.location.hash,'tasks');assert.ok(a.document.getElementById('task-search'));assert.match(a.document.getElementById('main').textContent,/Take the bins out/)});
test('completion, owner claim, edit and removal undo use real buttons',()=>{
 const a=app();a.route('tasks');a.click('[data-claim="t4"]');assert.equal(a.run("state.tasks.find(t=>t.id==='t4').owner"),'You');a.click('[data-complete="t4"]');assert.equal(a.run("state.tasks.find(t=>t.id==='t4').done"),true);a.click('[data-complete="t4"]');a.click('[data-edit-task="t4"]');assert.ok(a.document.getElementById('modal').open);a.click('[data-delete-chore="t4"]');assert.equal(a.run("state.tasks.some(t=>t.id==='t4')"),false);a.click('[data-design-undo]');assert.equal(a.run("state.tasks.some(t=>t.id==='t4')"),true);
});
test('search filters real chore rows without mutating tasks',()=>{const a=app();a.route('tasks');const input=a.document.getElementById('task-search');input.value='bins';input.dispatchEvent(new a.document.defaultView.Event('input',{bubbles:true}));assert.match(a.document.getElementById('task-groups').textContent,/bins/);assert.doesNotMatch(a.document.getElementById('task-groups').textContent,/Backyard movement/);assert.equal(a.run('state.tasks.length'),4)});
test('meal ingredients deduplicate and groceries toggle on actual DOM',()=>{const a=app();a.route('kitchen');a.click('[data-ingredients]');const count=a.run('state.groceries.length');a.click('[data-ingredients]');assert.equal(a.run('state.groceries.length'),count);a.route('shopping');a.click('[data-buy="g1"]');assert.equal(a.run('state.groceries[0].bought'),true);assert.match(a.document.getElementById('main').textContent,/Winners/)});
test('routine switches persist and undo remains pointer accessible',()=>{const a=app();a.route('routines');a.click('[data-routine]');assert.equal(a.run('state.routines[0].enabled'),false);assert.match(fs.readFileSync(path.join(__dirname,'../design.css'),'utf8'),/#toast\.show\s*\{[^}]*pointer-events:\s*auto/)});
