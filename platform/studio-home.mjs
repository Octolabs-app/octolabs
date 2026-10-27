const worlds = {
numbers:{title:'Make it count.',copy:'Six tiles. One target. A hundred little “what ifs”.',image:'master',alt:'Green Octo with number and letter tiles',href:'/daily-numbers/?daily=1',action:'Play Daily Numbers',tokens:['25','+','75']},
words:{title:'Follow your curiosity.',copy:'One clue leads to another. Find your little moment of genius.',image:'cross',alt:'Purple Octo with a crossword and pencil',href:'/octocross/?daily=1',action:'Play Daily Cross',tokens:['A','?','Z']},
world:{title:'Go a little further.',copy:'Twelve stops. A whole world of “I knew that!”',image:'flag',alt:'Blue Octo with a globe and Mauritius flag',href:'/octoflag/?daily=1',action:'Play Daily Passport',tokens:['N','↗','S']}
};
const root=document.querySelector('.studio-home'),buttons=[...document.querySelectorAll('[data-world]')];
function choose(key){
const w=worlds[key];if(!w)return;root.dataset.world=key;
buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.world===key)));
const img=document.getElementById('hero-octo');img.src='/assets/octo-'+w.image+'.webp';img.alt=w.alt;
document.getElementById('world-title').textContent=w.title;
document.getElementById('world-copy').textContent=w.copy;
const link=document.getElementById('world-play');link.href=w.href;link.textContent=w.action+' ↗';
document.querySelectorAll('.play-token').forEach((t,i)=>t.textContent=w.tokens[i]);
document.getElementById('world-status').textContent=w.action+' selected.';
}
buttons.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.world)));
document.getElementById('surprise').addEventListener('click',()=>{const keys=Object.keys(worlds).filter(k=>k!==root.dataset.world);choose(keys[Math.floor(Math.random()*keys.length)]);});
const preference=matchMedia('(prefers-reduced-motion: reduce)'),motion=document.getElementById('motion-toggle');
function setMotion(paused){root.classList.toggle('motion-paused',paused);motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'Motion off':'Motion on';}
setMotion(preference.matches);motion.addEventListener('click',()=>setMotion(!root.classList.contains('motion-paused')));
preference.addEventListener('change',e=>setMotion(e.matches));
