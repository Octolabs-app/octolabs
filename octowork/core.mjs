export const skills = ['technical writing','documentation','video editing','davinci resolve','cam','cad','go2cam','excel','power bi','sql','python','data analysis','data entry','customer support','translation','french','english','wordpress','social media','graphic design','canva','bookkeeping','accounting','virtual assistant','project management','automation','power automate','testing','research','sales','marketing','financial reporting','reconciliation','spss','r programming','statistical analysis','forecasting','dashboards','matlab','simulink','autocad','autodesk inventor','technical support'];
export const plain = value => String(value ?? '').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
export function safeUrl(value) { try { const u=new URL(value); return ['https:','http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; } }
export function canonical(value) { const u=new URL(safeUrl(value)); for(const k of [...u.searchParams.keys()]) if(/^(utm_|ref$|source$)/i.test(k)) u.searchParams.delete(k); u.hash=''; return u.href.replace(/\/$/,''); }
export function foundSkills(text) { const t=plain(text).toLowerCase(); return skills.filter(s=>new RegExp('(^|[^a-z0-9])'+s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z0-9]|$)','i').test(t)); }
export function normalizeJob(input) {
 const url=safeUrl(input.url); if(!url || !plain(input.title)) throw Error('A job title and valid http(s) listing URL are required.');
 const hours= input.hours === '' || input.hours == null ? null : Number(input.hours);
 if(hours!==null && (!Number.isFinite(hours)||hours<=0||hours>24)) throw Error('Hours per day must be between 0 and 24.');
 return {id:canonical(url),url,title:plain(input.title).slice(0,240),company:plain(input.company).slice(0,160),description:plain(input.description).slice(0,40000),location:plain(input.location).slice(0,200),type:plain(input.type).toLowerCase().replaceAll('_',' '),pay:plain(input.pay).slice(0,200),hours,remote:input.remote===true,source:plain(input.source||'Manual import'),published:input.published||null,observed:input.observed||new Date().toISOString(),eligibility:['yes','no'].includes(input.eligibility)?input.eligibility:'unknown'};
}
export function assess(job, profile) {
 const requirements=foundSkills(job.title+' '+job.description), matched=requirements.filter(s=>foundSkills(profile.cv).includes(s));
 const ready=!!profile.name?.trim() && (profile.cv||'').trim().length>=80;
 const location=job.location.toLowerCase();
 // Regions and “remote” alone do not establish country eligibility.
 const country=job.eligibility!=='no' && (job.eligibility==='yes'|| /^(mauritius|worldwide|anywhere in the world|global|anywhere)$/i.test(location.trim()));
 const excluded=job.eligibility==='no';
 const hoursOk=job.hours!==null && job.hours>=1 && job.hours<=Math.min(4,Number(profile.hours)||4);
 const fullTime=/full[ -]?time/i.test(job.type+' '+job.title);
 const flexible=/part[ -]?time|contract|freelance|task|project/.test(job.type);
 const reasons=[]; if(!ready) reasons.push('Add a name and CV before comparing candidates.');
 if(excluded) reasons.push('Listing excludes this candidate’s country.'); else if(!country) reasons.push('Mauritius eligibility needs confirmation.');
 if(!job.remote) reasons.push('Remote arrangement is unconfirmed.');
 if(job.hours===null) reasons.push('Daily hours are not stated.'); else if(!hoursOk) reasons.push('Daily hours fall outside your 1–4 hour limit or availability.');
 if(fullTime) reasons.push('Full-time role: unsuitable for this search.'); else if(!flexible) reasons.push('Part-time or task/contract arrangement needs confirmation.');
 if(!job.pay) reasons.push('Payment amount and terms need confirmation.');
 if(!requirements.length) reasons.push('No supported skill keywords found; review manually.');
 const blocked=excluded||fullTime||(job.hours!==null&&!hoursOk);
 const score=ready && requirements.length ? Math.round(100*matched.length/requirements.length):null;
 return {ready,matched,requirements,score,reasons,blocked,eligible:country,hoursOk,fit:blocked?'Outside criteria':country&&hoursOk&&job.remote&&flexible?'Fits work preferences':'Needs checking'};
}
export function compare(job,profiles) {
 const results=profiles.map(p=>assess(job,p));
 if(results.some(r=>!r.ready)) return {results,winner:null,label:'Add both CVs to compare'};
 if(results.every(r=>r.blocked)) return {results,winner:null,label:'Neither fits the work constraints'};
 const available=results.map((r,i)=>({r,i})).filter(x=>!x.r.blocked&&x.r.score!==null);
 available.sort((a,b)=>b.r.score-a.r.score);
 if(!available.length||available[0].r.score===0) return {results,winner:null,label:'No evidenced skill match'};
 if(available.length>1&&available[0].r.score===available[1].r.score) return {results,winner:null,label:'Similar match — review both'};
 return {results,winner:available[0].i,label:`Stronger keyword match: ${profiles[available[0].i].name}`};
}
export function filterJobs(jobs,{query='',type='flexible',location='all',hours='all'}={}){
 const terms=plain(query).toLowerCase().split(/\s+/).filter(Boolean);
 return jobs.filter(j=>{
  const a=assess(j,{cv:'',hours:4}),haystack=(j.title+' '+j.company+' '+j.description).toLowerCase();
  return terms.every(t=>haystack.includes(t)) && (type==='all'||(!/full[ -]?time/i.test(j.type+' '+j.title)&&(type==='task'?/task|freelance|project/:/part[ -]?time|contract|freelance|task|project/).test(j.type))) && (location==='all'||(location==='local'?/mauritius/i.test(j.location):a.eligible)) && (hours!=='confirmed'||a.hoursOk);
 });
}
export function letter(job,profile) {
 const a=assess(job,profile); if(!a.ready) throw Error('Add a name and at least 80 characters of CV text first.');
 if(a.blocked) throw Error('This opportunity is outside the candidate’s work constraints.');
 const evidence=(profile.cv||'').split(/\n+/).map(x=>x.trim()).filter(x=>x.length>25&&x.length<450&&a.matched.some(s=>foundSkills(x).includes(s))).slice(0,2);
 return `Dear ${job.company?job.company+' hiring team':'Hiring team'},\n\nI am interested in the ${job.title} opportunity. I am based in Mauritius and am seeking remote, part-time or project-based work, with availability of up to ${profile.hours||4} hours per day.\n\n${a.matched.length?'My CV includes experience or skills relevant to this role: '+a.matched.join(', ')+'.':'I would welcome the opportunity to discuss how my background could support this work.'}${evidence.length?'\n\nRelevant details from my CV:\n'+evidence.map(x=>'• '+x).join('\n'):''}\n\n${profile.pitch?.trim()?profile.pitch.trim()+'\n\n':''}I would be happy to discuss the deliverables, timeline and payment terms.${!a.eligible?' Please confirm whether you can engage a contractor based in Mauritius.':''}${job.hours===null?' Please also confirm whether the workload can fit within my daily availability.':''}\n\nThank you for considering my application.\n\nKind regards,\n${profile.name}`;
}
