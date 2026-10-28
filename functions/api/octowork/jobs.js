// Only public job data passes through this route. CVs and letters never do.
export async function onRequestGet(context) {
 const key=new Request(new URL('/api/octowork/jobs',context.request.url));
 const cache=globalThis.caches?.default;
 const hit=cache?await cache.match(key):null;if(hit)return hit;
 try {
  const upstream=await fetch('https://remotive.com/api/remote-jobs',{signal:AbortSignal.timeout(18000),redirect:'error',headers:{Accept:'application/json'},cf:{cacheTtl:43200,cacheEverything:true}});
  if(!upstream.ok)throw Error('upstream unavailable');
  const reader=upstream.body.getReader();const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>12000000){await reader.cancel();throw Error('feed too large');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
  const data=JSON.parse(new TextDecoder().decode(bytes));if(!Array.isArray(data.jobs))throw Error('invalid feed');
  const fetched=new Date().toISOString();
  const jobs=data.jobs.filter(j=>typeof j.title==='string'&&typeof j.url==='string'&&j.url.startsWith('https://remotive.com/')).map(j=>({title:j.title,company:j.company_name,url:j.url,description:j.description,location:j.candidate_required_location,type:j.job_type,pay:j.salary,published:j.publication_date,remote:true,source:'Remotive',observed:fetched,hours:null}));
  const response=Response.json({source:'Remotive',fetched,jobs},{headers:{'Cache-Control':'public, max-age=43200','X-Content-Type-Options':'nosniff'}});
  if(cache)context.waitUntil(cache.put(key,response.clone()));return response;
 }catch{return Response.json({error:'Job feed unavailable. Saved jobs are unaffected.'},{status:502,headers:{'Cache-Control':'no-store'}});}
}
