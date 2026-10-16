
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function app(){
 const elements=new Map(),handlers={};
 function element(id){if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',value:'',classList:{toggle(){},add(){},remove(){}},insertAdjacentHTML(_p,v){this.innerHTML+=v},showModal(){this.open=true},close(){this.open=false},focus(){},querySelector(){return {disabled:false}}});return elements.get(id)}
 const body=element('body');body.insertAdjacentHTML=()=>{};
 const document={body,getElementById:element,querySelector:element,addEventListener(n,f){(handlers[n]??=[]).push(f)}};
 const storage=new Map();const context={document,location:{hash:'',hostname:'octolabs.app'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},console,Intl,Date,Math,URL,Blob,setInterval(){},setTimeout(){},clearTimeout(){},confirm:()=>false,FormData:class{},fetch:()=>{throw Error('Unexpected network request')},AbortSignal};
 context.window=context;context.scrollTo=()=>{};context.addEventListener=()=>{};
 vm.createContext(context);
 for(const file of ['model.js','app.js','design.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context,{filename:file});
 return {context,elements,handlers,run:code=>vm.runInContext(code,context)};
}
test('the redesign boots over the existing app and preserves household storage key',()=>{
 const a=app();assert.match(a.elements.get('main').innerHTML,/Make room/);assert.match(a.elements.get('nav').innerHTML,/Meal planner/);assert.equal(a.run('KEY'),'octohome.v1');
});
test('every main screen renders without a runtime exception',()=>{
 const a=app();
 for(const name of ['home','tasks','kitchen','shopping','routines','departments','household']){a.run('go('+JSON.stringify(name)+')');const html=a.elements.get('main').innerHTML;assert.ok(html.length>100,name);assert.ok(!html.includes('[object Object]'),name)}
});
test('chore search filters the displayed results without changing saved tasks',()=>{
 const a=app();a.run("go('tasks')");
 const before=a.run('state.tasks.length');
 for(const f of a.handlers.input||[])f({target:{id:'task-search',value:'bins'}});
 const html=a.elements.get('task-groups').innerHTML;assert.match(html,/Take the bins out/);assert.ok(!html.includes('Backyard movement'));assert.equal(a.run('state.tasks.length'),before);
});
test('chore completion and undo update shared model through the existing handler',()=>{
 const a=app();a.run("go('tasks')");
 const event={target:{closest:()=>({dataset:{complete:'t4'}})}};
 for(const f of a.handlers.click)f(event);
 assert.equal(a.run("state.tasks.find(t=>t.id==='t4').done"),true);
 assert.match(a.elements.get('main').innerHTML,/Completed/);
 for(const f of a.handlers.click)f(event);
 assert.equal(a.run("state.tasks.find(t=>t.id==='t4').done"),false);
});
test('shopping distinguishes estimates and exposes store lookup',()=>{
 const a=app();a.run("go('shopping')");const html=a.elements.get('main').innerHTML;assert.match(html,/Your estimate/);assert.match(html,/Find supermarket prices/);for(const store of ['Winners','Super U','Intermart','NuPrix'])assert.ok(html.includes(store));
});
test('editing a source price clears the imported-price claim',()=>{
 const a=app();a.run("state.groceries[0].source='Winners';state.groceries[0].sourceUrl='https://winners.mu/product';state.groceries[0].checkedAt=new Date().toISOString();state.groceries[0].priceCurrency='MUR'");
 const event={target:{closest:()=>({dataset:{editGrocery:'g1'}})}};
 for(const f of a.handlers.click)f(event);
 assert.equal(typeof a.elements.get('modal-form').onsubmit,'function');
 assert.ok(a.run('state.groceries[0].source')==='Winners');
});
