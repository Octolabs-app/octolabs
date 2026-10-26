export const VERSION = 1;
export function utcDay(date = new Date()) { return date.toISOString().slice(0, 10); }
export function dailySeed(date = new Date()) { return `numbers-v1-${utcDay(date)}`; }
export function normalizeSeed(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value) ? value : null;
}
function random(seed) {
  let a = 2166136261;
  for (const char of seed) a = Math.imul(a ^ char.charCodeAt(0), 16777619);
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function calculate(a, op, b) {
  if (![a,b].every(n => Number.isSafeInteger(n) && n > 0)) return null;
  let value;
  if (op === '+') value = a + b;
  else if (op === '-') value = a - b;
  else if (op === '*') value = a * b;
  else if (op === '/') value = a / b;
  else return null;
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
export function initialBoard(tiles) { return tiles.map((value,i) => ({id:`t${i}`,value})); }
export function replay(tiles, steps = []) {
  if (!Array.isArray(tiles) || tiles.length !== 6 || !tiles.every(n => Number.isInteger(n) && n > 0 && n <= 100)) throw new Error('Invalid tiles.');
  if (!Array.isArray(steps) || steps.length > 5) throw new Error('Invalid steps.');
  let board = initialBoard(tiles);
  const history = [];
  for (let i=0;i<steps.length;i++) {
    const step=steps[i];
    if (!step || typeof step.a !== 'string' || typeof step.b !== 'string' || step.a === step.b) throw new Error('Choose two different tiles.');
    const a=board.find(t=>t.id===step.a), b=board.find(t=>t.id===step.b);
    if (!a || !b) throw new Error('A tile was already used.');
    const value=calculate(a.value,step.op,b.value);
    if (value===null) throw new Error('Use positive whole-number results.');
    board=board.filter(t=>t.id!==step.a && t.id!==step.b);
    board.push({id:`n${i}`,value});
    history.push({a:a.value,b:b.value,op:step.op,value});
  }
  return {board,history};
}
export function solved(puzzle, steps) {
  try { return steps.length > 0 && replay(puzzle.tiles,steps).board.some(t=>t.value===puzzle.target); } catch { return false; }
}
export function generate(seed,{attemptLimit=48}={}) {
  if (!normalizeSeed(seed)) throw new Error('Use a seed of 1–80 letters, digits, underscores or hyphens.');
  if(!Number.isInteger(attemptLimit)||attemptLimit<0||attemptLimit>48)throw new Error('Generation attempts must be between 0 and 48.');
  const rng=random(seed), pick=n=>Math.floor(rng()*n);
  const large=[25,50,75,100],first=large.splice(pick(large.length),1)[0];
  const tiles=[first,large[pick(large.length)],1+pick(10),1+pick(10),1+pick(10),1+pick(10)];
  function moves(board,requiredId=null){
    const choices=[];
    for(let a=0;a<board.length;a++)for(let b=0;b<board.length;b++)if(a!==b&&(!requiredId||board[a].id===requiredId||board[b].id===requiredId))for(const op of ['+','-','*','/']){
      const value=calculate(board[a].value,op,board[b].value);
      if(value!==null&&value<=100000)choices.push({a:board[a].id,b:board[b].id,op,value});
    }
    return choices;
  }
  const easy=new Set([...tiles,...moves(initialBoard(tiles)).map(m=>m.value)]);
  const eligible=n=>n>=100&&n<=999&&!tiles.includes(n);
  const apply=(board,move,index)=>[...board.filter(t=>t.id!==move.a&&t.id!==move.b),{id:`n${index}`,value:move.value}];
  const step=({a,b,op})=>({a,b,op});
  // Chained construction makes every saved operation contribute to the target.
  // Prefer 3–5 steps and reject every one-operation starting-tile shortcut.
  let chosen=null;
  for(let attempt=0;attempt<attemptLimit;attempt++) {
    let board=initialBoard(tiles),steps=[];
    for(let depth=0;depth<5;depth++) {
      const choices=moves(board,depth?`n${depth-1}`:null);
      if(!choices.length)break;
      const move=choices[pick(choices.length)];
      steps.push(step(move));
      board=apply(board,move,depth);
      if(depth>=2 && eligible(move.value) && !easy.has(move.value)) {
        chosen={target:move.value,solution:steps.slice()};break;
      }
    }
    if(chosen)break;
  }
  if(!chosen){
    // Bounded exhaustive two-step fallback. Keep a nontrivial candidate when
    // available; the large/small tile sets always permit a valid exact target.
    let fallback=null;
    outer:for(const a of moves(initialBoard(tiles)))for(const b of moves(apply(initialBoard(tiles),a,0),'n0'))if(eligible(b.value)){
      const candidate={target:b.value,solution:[step(a),step(b)]};
      fallback??=candidate;
      if(!easy.has(b.value)){chosen=candidate;break outer;}
    }
    chosen??=fallback;
  }
  if(!chosen)throw new Error('Unable to construct a numbers puzzle.');
  return {version:VERSION,seed,id:`daily-numbers:${seed}`,tiles,...chosen};
}
export function resolveEdition(search, date = new Date()) {
  const params=new URLSearchParams(search), day=utcDay(date), canonical=dailySeed(date);
  const seed=params.get('daily')==='1' ? canonical : normalizeSeed(params.get('seed')) ?? canonical;
  const daily=seed===canonical;
  return {seed,daily,day,puzzleId:`daily-numbers:${seed}`,stream:params.get('stream')==='1'};
}
export function restoreState(puzzle, raw) {
  if(raw?.version!==1 || !Array.isArray(raw.steps))return {steps:[],helped:false};
  try {replay(puzzle.tiles,raw.steps);return {steps:raw.steps.map(({a,b,op})=>({a,b,op})),helped:raw.helped===true};}
  catch{return {steps:[],helped:false};}
}
export function completionRecord(edition,{helped=false,target,steps}){
  // The edition is frozen at load, so a player crossing midnight finishes the
  // puzzle they actually started instead of losing their daily result.
  if(!edition.daily||helped)return null;
  return {gameId:'daily-numbers',puzzleId:edition.puzzleId,period:'daily',periodKey:edition.day,summary:`Reached ${target} in ${steps} calculation${steps===1?'':'s'}`};
}
