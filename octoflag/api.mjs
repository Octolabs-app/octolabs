const API='/octoflag/api/';
let identity;
export function playerToken(){
 if(identity)return identity;
 try{identity=localStorage.getItem('octoflag-player');if(!/^[a-zA-Z0-9-]{32,80}$/.test(identity??''))identity=crypto.randomUUID();localStorage.setItem('octoflag-player',identity);}catch{identity=crypto.randomUUID();}
 return identity;
}
export async function rankedApi(route,body){
 const started=performance.now();
 const response=await fetch(API+route,{method:body?'POST':'GET',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)});
 let data;try{data=await response.json();}catch{throw Error('The leaderboard is temporarily unavailable. Please try again.');}
 if(!response.ok||!data.ok)throw Error(data.error??'Connection interrupted. Please try again.');
 if(Number.isFinite(data.deadline)&&Number.isFinite(data.serverNow))data.remainingMs=Math.max(0,data.deadline-data.serverNow-(performance.now()-started)/2);
 return data;
}
