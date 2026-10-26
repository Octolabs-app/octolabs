import { dayId, dailyCrossword, crosswordProgress } from './engine.mjs';
const $ = id => document.getElementById(id);
let catalog, storageAvailable = true;
function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); }
  catch { storageAvailable = false; return null; }
}
function refresh() {
  const now = new Date(), day = dayId(now);
  $('daily-date').textContent = new Intl.DateTimeFormat('en', { weekday:'long', day:'numeric', month:'long', timeZone:'UTC' }).format(now);
  const flag = read(`octoflag-daily-octoflag-daily-${day}`);
  $('flag-state').textContent = Number.isInteger(flag?.correct) && flag.correct >= 0 && flag.correct <= 12
    ? `Passport complete · ${flag.correct}/12 discoveries` : 'Ready for departure';
  if (catalog) {
    const challenge = dailyCrossword(catalog, now);
    $('cross-play').href = challenge.href;
    $('cross-theme').textContent = challenge.theme.title + ' · A new themed puzzle every day.';
    const progress = crosswordProgress(challenge, read(challenge.key));
    $('cross-state').textContent = progress.complete ? `Complete · ${progress.hints} revealed letters`
      : progress.filled ? `${progress.filled}/${progress.total} squares filled · progress saved` : 'A fresh page, ready for you';
    $('cross-play').textContent = progress.complete ? 'Revisit crossword' : progress.filled ? 'Continue crossword' : 'Play crossword';
  }
  if (!storageAvailable) {
    $('cross-state').textContent = 'Saved progress unavailable in this browser';
    $('flag-state').textContent = 'Saved progress unavailable in this browser';
  }
}
$('share').onclick = async () => {
  const text = `Octolabs · ${dayId()}\nA crossword and a Daily Passport. Play today’s collection with me!\nhttps://octolabs.app/daily/`;
  try { await navigator.clipboard.writeText(text); $('share-status').textContent = 'Collection link copied. Ready to send to a friend.'; }
  catch { $('share-status').textContent = text; }
};
refresh();
try {
  const response = await fetch('/octocross/catalog.json');
  if (!response.ok) throw new Error('Catalog unavailable');
  catalog = await response.json(); refresh();
} catch { $('cross-state').textContent = 'Today’s selection could not load. You can still open OctoCross.'; }
window.addEventListener('pageshow', refresh);
window.addEventListener('focus', refresh);
window.addEventListener('storage', refresh);
setInterval(() => { if (!document.hidden) refresh(); }, 60000);
