export const VERSION=1;
export function rng(seed){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function shuffle(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function generate(theme,seed){
 const random=rng(seed),size=19,grid=Array.from({length:size},()=>Array(size).fill(null)),entries=[];
 const inside=(r,c)=>r>=0&&c>=0&&r<size&&c<size;
 const get=(r,c)=>inside(r,c)?grid[r][c]:null;
 function fits(word,r,c,dir,first=false){
  const dr=dir==='down'?1:0,dc=1-dr;
  if(!inside(r,c)||!inside(r+dr*(word.length-1),c+dc*(word.length-1)))return false;
  if(get(r-dr,c-dc)||get(r+dr*word.length,c+dc*word.length))return false;
  let crosses=0;
  for(let i=0;i<word.length;i++){
   const rr=r+dr*i,cc=c+dc*i,cell=get(rr,cc);
   if(cell){if(cell.letter!==word[i]||cell[dir])return false;crosses++;}
   else if(get(rr-dc,cc-dr)||get(rr+dc,cc+dr))return false;
  }
  return first||crosses>0;
 }
 function add(entry,r,c,dir){const dr=dir==='down'?1:0,dc=1-dr;for(let i=0;i<entry.answer.length;i++){const rr=r+dr*i,cc=c+dc*i;grid[rr][cc]??={letter:entry.answer[i]};grid[rr][cc][dir]=true;}entries.push({...entry,r,c,dir});}
 const words=shuffle(theme.entries,random);
 add(words[0],9,Math.floor((size-words[0].answer.length)/2),'across');
 for(let pass=0;pass<2&&entries.length<12;pass++)for(const word of words.slice(1)){
  if(entries.length>=12)break;if(entries.some(e=>e.answer===word.answer))continue;
  const candidates=[];
  for(const base of entries){const dir=base.dir==='across'?'down':'across';for(let i=0;i<base.answer.length;i++)for(let j=0;j<word.answer.length;j++)if(base.answer[i]===word.answer[j]){
   const r=base.r+(base.dir==='down'?i:0)-(dir==='down'?j:0),c=base.c+(base.dir==='across'?i:0)-(dir==='across'?j:0);
   if(fits(word.answer,r,c,dir))candidates.push({r,c,dir});
  }}
  if(candidates.length){const p=candidates[Math.floor(random()*candidates.length)];add(word,p.r,p.c,p.dir);}
 }
 const occupied=grid.flatMap((row,r)=>row.flatMap((cell,c)=>cell?[{r,c}]:[]));
 const minR=Math.min(...occupied.map(p=>p.r)),maxR=Math.max(...occupied.map(p=>p.r)),minC=Math.min(...occupied.map(p=>p.c)),maxC=Math.max(...occupied.map(p=>p.c));
 const cells=grid.slice(minR,maxR+1).map(row=>row.slice(minC,maxC+1).map(cell=>cell?.letter||null));
 entries.forEach(e=>{e.r-=minR;e.c-=minC;});entries.sort((a,b)=>a.r-b.r||a.c-b.c||a.dir.localeCompare(b.dir));
 let number=0,last='';entries.forEach(e=>{const key=`${e.r},${e.c}`;if(key!==last)number++;e.number=number;last=key;e.id=`${number}-${e.dir}`;});
 return {version:VERSION,theme:theme.id,seed,rows:cells.length,cols:cells[0].length,cells,entries};
}
export function entryCells(entry){return Array.from({length:entry.answer.length},(_,i)=>`${entry.r+(entry.dir==='down'?i:0)},${entry.c+(entry.dir==='across'?i:0)}`);}
export function signature(p){return p.cells.map(r=>r.map(c=>c||'#').join('')).join('/');}
// Monday rollover at midnight in Mauritius (UTC+4), independent of player timezone.
export function weekIndex(date=new Date()){return Math.floor((date.getTime()+14400000-Date.UTC(2026,9,19))/604800000);}
export function weeklyPuzzle(catalog,date=new Date()){const w=weekIndex(date),themeIndex=((w%catalog.themes.length)+catalog.themes.length)%catalog.themes.length;const group=catalog.themes[themeIndex];const index=((Math.floor(w/catalog.themes.length)%group.seeds.length)+group.seeds.length)%group.seeds.length;return {themeIndex,index,week:w};}
export function validate(p){
 const errors=[],coverage=new Map(),expected=new Set();
 for(const e of p.entries){const keys=entryCells(e);expected.add(`${e.r},${e.c},${e.dir},${e.answer}`);keys.forEach((key,i)=>{const [r,c]=key.split(',').map(Number);if(p.cells[r]?.[c]!==e.answer[i])errors.push('answer mismatch');const old=coverage.get(key)||[];if(old.some(x=>x.dir===e.dir))errors.push('overlap');old.push(e);coverage.set(key,old);});}
 for(let r=0;r<p.rows;r++)for(let c=0;c<p.cols;c++)if(p.cells[r][c]){
  if(!coverage.has(`${r},${c}`))errors.push('unclued cell');
  for(const dir of ['across','down']){const dr=dir==='down'?1:0,dc=1-dr;if(p.cells[r-dr]?.[c-dc])continue;let word='',rr=r,cc=c;while(p.cells[rr]?.[cc]){word+=p.cells[rr][cc];rr+=dr;cc+=dc;}if(word.length>1&&!expected.has(`${r},${c},${dir},${word}`))errors.push('unclued run');}
 }
 const visited=new Set(),queue=[coverage.keys().next().value];while(queue.length){const key=queue.pop();if(!key||visited.has(key)||!coverage.has(key))continue;visited.add(key);const [r,c]=key.split(',').map(Number);queue.push(`${r+1},${c}`,`${r-1},${c}`,`${r},${c+1}`,`${r},${c-1}`);}
 if(visited.size!==coverage.size)errors.push('disconnected');
 if(new Set(p.entries.map(e=>e.answer)).size!==p.entries.length)errors.push('repeated answer');
 if(p.entries.length<9)errors.push('too few entries');
 return [...new Set(errors)];
}
