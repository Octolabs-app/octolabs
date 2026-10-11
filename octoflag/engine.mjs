export const REGIONS=['Africa','Americas','Asia','Europe','Oceania'];
const EXPLORER=new Set('mu fr gb us ca br ar mx au nz fj pg ws to jp cn in kr za eg ma ke ng de it es pt gr ch se no fi dk nl be ie pl tr ru ua th vn id my sg ph sa ae il cl pe co cu jm is np pk bd lk tn gh sn et tz mg sc bw zm zw cr pa'.split(' '));
export function rng(seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>{h+=0x6D2B79F5;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
export function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function countryName(c,lang){return lang==='fr'?c.fr:c.name;}
export function questionSet(countries,{seed,mode='tour',region='all',level='explorer',lang='en',count=12}={}){
 const random=rng(seed??Date.now()),capitalOK=c=>c.capital.length===1&&!['id','il'].includes(c.code);
 let pool=countries.filter(c=>(region==='all'||c.region===region)&&(level==='expert'||EXPLORER.has(c.code))&&(mode!=='capital'||capitalOK(c)));
 if(pool.length<4)throw Error('Choose a larger region or Explorer / World.');
 const chosen=shuffle(pool,random).slice(0,Math.min(count,pool.length));
 return chosen.map((country,i)=>{
  let type=mode==='tour'?['flag','find','capital','region'][i%4]:mode;
  if(type==='capital'&&!capitalOK(country))type='flag';
  let options,correct,prompt;
  if(type==='region'){
   correct=country.region;options=shuffle([correct,...shuffle(REGIONS.filter(r=>r!==correct),random).slice(0,3)],random).map(value=>({value,kind:'region'}));prompt=lang==='fr'?`Dans quelle région se trouve ${countryName(country,lang)} ?`:`Which world region is ${countryName(country,lang)} in?`;
  }else{
   let others=pool.filter(c=>c.code!==country.code&&(type!=='capital'||capitalOK(c)&&c.capital[0]!==country.capital[0]));
   if(others.length<3)others=countries.filter(c=>c.code!==country.code&&(type!=='capital'||capitalOK(c)&&c.capital[0]!==country.capital[0]));
   const picks=shuffle([country,...shuffle(others,random).slice(0,3)],random);
   options=picks.map(c=>({value:type==='capital'?c.capital[0]:c.code,label:type==='capital'?c.capital[0]:countryName(c,lang),code:c.code,kind:type==='find'?'flag':'text'}));correct=type==='capital'?country.capital[0]:country.code;
   prompt=type==='flag'?(lang==='fr'?'À quel pays appartient ce drapeau ?':'Which country flies this flag?'):type==='find'?(lang==='fr'?`Trouvez le drapeau de ${countryName(country,lang)}.`:`Find the flag of ${countryName(country,lang)}.`):(lang==='fr'?`Quelle est la capitale de ${countryName(country,lang)} ?`:`What is the capital of ${countryName(country,lang)}?`);
  }
  return {id:`${i}-${country.code}-${type}`,country,type,prompt,options,correct};
 });
}
export function scoreAnswer(correct,streak){const next=correct?streak+1:0;return {streak:next,points:correct?100+Math.min(5,next-1)*10:0};}
export function recordAnswer(state,question,value){if(state.answers.some(a=>a.id===question.id))return state;const correct=value===question.correct,s=scoreAnswer(correct,state.streak);return {...state,score:state.score+s.points,streak:s.streak,bestStreak:Math.max(state.bestStreak,s.streak),answers:[...state.answers,{id:question.id,value,correct,points:s.points,country:question.country.code}]};}
export function dailySeed(now=new Date()){return 'octoflag-daily-'+now.toISOString().slice(0,10);}
