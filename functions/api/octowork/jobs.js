// Public provider data only. The /api/octowork path is protected by Cloudflare Access.
const sources=[
 {name:'Remotive',url:'https://remotive.com/api/remote-jobs?limit=200',map:j=>({title:j.title,company:j.company_name,url:j.url,description:j.description,location:j.candidate_required_location,type:j.job_type,pay:j.salary,published:j.publication_date})},
 {name:'Jobicy',url:'https://jobicy.com/api/jobs?count=200',map:j=>({title:j.jobTitle,company:j.companyName,url:j.url,description:j.jobDescription||j.jobExcerpt,location:j.jobGeo,type:(j.jobType||[]).join(' '),pay:j.salaryMin?`${j.salaryCurrency||''} ${j.salaryMin}${j.salaryMax?'–'+j.salaryMax:''} ${j.salaryPeriod||''}`:'',published:j.pubDate})}
];
async function readJSON(response){
 if(!response.ok)throw Error(`HTTP ${response.status}`);
 const reader=response.body.getReader(),chunks=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>12000000)throw Error('Response exceeds size limit');chunks.push(value);}}catch(e){await reader.cancel();throw e;}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw Error('Provider returned invalid JSON');}
}
export async function collectSource(source,fetcher=fetch){
 const data=await readJSON(await fetcher(source.url,{signal:AbortSignal.timeout(18000),headers:{Accept:'application/json'},cf:{cacheTtl:43200,cacheEverything:true}}));
 if(!Array.isArray(data.jobs))throw Error('Provider returned an invalid job list');
 const observed=new Date().toISOString();
 const jobs=data.jobs.slice(0,200).map(source.map).filter(j=>typeof j.title==='string'&&typeof j.url==='string'&&/^https:\/\/(remotive|jobicy)\.com\//.test(j.url)).map(j=>({...j,remote:true,source:source.name,observed,hours:null}));
 return {name:source.name,status:'ok',count:jobs.length,observed,partial:true,jobs};
}
export async function getFeed(fetcher=fetch){
 const results=await Promise.allSettled(sources.map(s=>collectSource(s,fetcher)));
 const statuses=results.map((r,i)=>r.status==='fulfilled'?{...r.value,jobs:undefined}:{name:sources[i].name,status:'unavailable',count:0,error:r.reason?.message||'Request failed'});
 const jobs=results.flatMap(r=>r.status==='fulfilled'?r.value.jobs:[]);
 return {fetched:new Date().toISOString(),jobs,sources:statuses,partial:true};
}
export async function onRequestGet(context){
 const key=new Request(new URL('/api/octowork/jobs?v=2',context.request.url)),cache=globalThis.caches?.default;
 const hit=cache?await cache.match(key):null;if(hit)return hit;
 const data=await getFeed();const ok=data.sources.some(s=>s.status==='ok');
 const response=Response.json(data,{status:ok?200:502,headers:{'Cache-Control':`public, max-age=${ok?43200:600}`,'X-Content-Type-Options':'nosniff'}});
 if(cache)context.waitUntil(cache.put(key,response.clone()));return response;
}
