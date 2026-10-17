export const SYMBOLS = ['🍋','🍒','🍇','🥑','🍓','🍉','🍍','🥝','🍊','🫐','🍐','🥥'];
export function deckFor(seed, pairs=8) {
  if (![6,8,12].includes(pairs)) throw new RangeError('Choose 6, 8 or 12 pairs');
  let h=2166136261;
  for (const c of String(seed)) h=Math.imul(h^c.charCodeAt(0),16777619);
  const random=()=>{h+=0x6D2B79F5;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};
  const cards=SYMBOLS.slice(0,pairs).flatMap((symbol,pair)=>[{id:pair*2,symbol},{id:pair*2+1,symbol}]);
  for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
  return cards;
}
export function newGame(seed,pairs=8,players=1){
  if (![1,2].includes(players)) throw new RangeError('Choose one or two players');
  return {cards:deckFor(seed,pairs),players,turn:0,scores:[0,0],open:[],matched:[],moves:0,done:false};
}
export function flip(state,index){
  if(state.done||state.open.length===2||!Number.isInteger(index)||index<0||index>=state.cards.length||state.open.includes(index)||state.matched.includes(index))return state;
  const open=[...state.open,index];
  if(open.length===1)return {...state,open};
  const match=state.cards[open[0]].symbol===state.cards[open[1]].symbol;
  const matched=match?[...state.matched,...open]:state.matched;
  const scores=[...state.scores];if(match)scores[state.turn]++;
  return {...state,open,matched,scores,moves:state.moves+1,done:matched.length===state.cards.length};
}
export function settle(state){
  if(state.open.length!==2)return state;
  const match=state.cards[state.open[0]].symbol===state.cards[state.open[1]].symbol;
  return {...state,open:[],turn:match?state.turn:(state.turn+1)%state.players};
}
