import {newGame,flip,settle} from './engine.mjs';
const $=id=>document.getElementById(id);
const fruits={'🍋':['lemon','citron'],'🍒':['cherries','cerises'],'🍇':['grapes','raisin'],'🥑':['avocado','avocat'],'🍓':['strawberry','fraise'],'🍉':['watermelon','pastèque'],'🍍':['pineapple','ananas'],'🥝':['kiwi','kiwi'],'🍊':['orange','orange'],'🫐':['blueberries','myrtilles'],'🍐':['pear','poire'],'🥥':['coconut','noix de coco']};
const read=(key,fallback)=>{try{return localStorage.getItem(key)||fallback;}catch{return fallback;}};
const write=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
let lang=read('octopairs-language','en')==='fr'?'fr':'en',state=null,seed='',daily=false;
const t=(en,fr)=>lang==='fr'?fr:en;
const query=new URLSearchParams(location.search);
const sharedSeed=query.get('board')?.slice(0,100);
const sharedPairs=Number(query.get('pairs'));
function translate(){document.documentElement.lang=lang;$('board').setAttribute('aria-label',t('Memory cards','Cartes mémoire'));document.querySelector('header nav').setAttribute('aria-label',t('Game navigation','Navigation des jeux'));document.querySelectorAll('[data-en]').forEach(el=>el.textContent=el.dataset[lang]);$('language').textContent=lang==='en'?'FR':'EN';$('language').setAttribute('aria-label',t('Passer en français','Switch to English'));if(state)render();}
$('language').onclick=()=>{lang=lang==='en'?'fr':'en';write('octopairs-language',lang);translate();};
function start(isDaily=false,replay=false){
 daily=isDaily;
 const pairs=isDaily?8:(!replay&&sharedSeed&&[6,8,12].includes(sharedPairs)?sharedPairs:Number($('pairs').value));
 seed=isDaily?'daily-'+new Date().toISOString().slice(0,10):(!replay&&sharedSeed?sharedSeed:crypto.randomUUID());
 state=newGame(seed,pairs,isDaily?1:Number($('players').value));
 $('setup').hidden=true;$('play').hidden=false;$('confirm').hidden=true;$('share-status').textContent='';
 render();$('board').querySelector('button').focus();
}
function render(){
 const two=state.players===2,wait=state.open.length===2;
 $('mode').textContent=daily?t('Daily · Solo','Défi du jour · Solo'):two?t('Pass & play','Duel sur un appareil'):t('Solo practice','Entraînement solo');
 $('moves').textContent=t(`${state.moves} moves`,`${state.moves} essais`);
 let status=two?t(`Player ${state.turn+1} · ${state.scores[0]}–${state.scores[1]} pairs`,`Joueur ${state.turn+1} · ${state.scores[0]}–${state.scores[1]} paires`):t(`${state.matched.length/2} / ${state.cards.length/2} pairs`,`${state.matched.length/2} / ${state.cards.length/2} paires`);
 if(wait&&!state.done)status+=' · '+(state.cards[state.open[0]].symbol===state.cards[state.open[1]].symbol?t('A match! Go again.','Une paire ! Rejouez.'):t('No match. Next turn when ready.','Pas de paire. Tour suivant quand vous êtes prêt.'));
 $('turn').textContent=status;
 const focused=document.activeElement?.dataset?.index;
 $('board').replaceChildren();$('board').classList.toggle('large',state.cards.length===24);
 state.cards.forEach((card,i)=>{
  const matched=state.matched.includes(i),revealed=matched||state.open.includes(i),button=document.createElement('button');
  button.type='button';button.className='card'+(matched?' matched':revealed?' revealed':'');button.textContent=revealed?card.symbol:'8';button.dataset.index=i;
  button.setAttribute('aria-label',t(`Card ${i+1}: `,`Carte ${i+1} : `)+(revealed?fruits[card.symbol][lang==='fr'?1:0]:t('face down','face cachée'))+(matched?t(', matched',', paire trouvée'):''));
  button.disabled=matched||state.open.includes(i)||wait||state.done;
  button.onclick=()=>{state=flip(state,i);render();if(state.done){finish();}else if(state.open.length===2){$('next').focus();}else{const available=[...$('board').children].filter(b=>!b.disabled);(available.find(b=>Number(b.dataset.index)>i)||available[0])?.focus();}};
  $('board').append(button);
 });
 $('next').hidden=!wait||state.done;$('result').hidden=!state.done;
 if(focused!==undefined){const b=$('board').children[Number(focused)];if(b&&!b.disabled)b.focus();}
 if(state.done)resultText();
}
function resultText(){
 const two=state.players===2;
 $('result-title').textContent=two?(state.scores[0]===state.scores[1]?t('A perfect tie.','Une belle égalité.'):t(`Player ${state.scores[0]>state.scores[1]?1:2} wins!`,`Le joueur ${state.scores[0]>state.scores[1]?1:2} gagne !`)):t('All paired up. Nicely done!','Toutes les paires trouvées !');
 let copy=t(`${state.cards.length/2} pairs in ${state.moves} moves.`,`${state.cards.length/2} paires en ${state.moves} essais.`);
 if(two)copy+=t(` Score: ${state.scores[0]}–${state.scores[1]}.`,` Score : ${state.scores[0]}–${state.scores[1]}.`);
 else {const best=Number(read(bestKey(),0));if(best)copy+=t(` Best on this device: ${best} moves.`,` Record sur cet appareil : ${best} essais.`);}
 $('result-copy').textContent=copy;
}
function bestKey(){return 'octopairs-best-'+(daily?seed:state.cards.length);}
function finish(){if(state.players===1){const best=Number(read(bestKey(),0));if(!best||state.moves<best)write(bestKey(),String(state.moves));}resultText();$('result').focus();}
$('next').onclick=()=>{state=settle(state);render();$('board').querySelector('button:not(:disabled)')?.focus();};
$('start').onclick=()=>start();$('daily').onclick=()=>start(true);$('again').onclick=()=>start(daily,true);
function leave(){state=null;$('play').hidden=true;$('setup').hidden=false;$('start').focus();}
$('back').onclick=()=>{if(state.done)leave();else{$('confirm').hidden=false;$('stay').focus();}};
$('leave').onclick=leave;$('stay').onclick=()=>{$('confirm').hidden=true;$('back').focus();};
$('share').onclick=async()=>{const url=new URL(location.href);url.search='';url.searchParams.set('board',seed);url.searchParams.set('pairs',state.cards.length/2);$('share-status').textContent=url.href;try{await navigator.clipboard.writeText(url.href);$('share-status').textContent=t('Board link copied. Same cards, fresh challenge!','Lien copié. Mêmes cartes, nouveau défi !');}catch{$('share-status').textContent=url.href;}};
translate();
if(sharedSeed)$('start').textContent=t('Play shared board','Jouer le plateau partagé');
