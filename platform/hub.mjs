import {readProgress, activity, utcDay, STORAGE_KEY} from './progress.mjs';
const dailyGames = ['daily-numbers', 'octocross', 'octoflag'];
const labels = {'daily-numbers': "Play today's numbers", octocross: "Play today's crossword", octoflag: "Play today's passport"};
let lastDay;
function render() {
  const now = new Date(), day = utcDay(now), progress = readProgress(), stats = activity(progress.records, now);
  lastDay = day;
  const format = new Intl.DateTimeFormat('en-GB', {weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC'});
  document.querySelectorAll('[data-today-date]').forEach(el => {el.textContent = format.format(now);});
  if (!document.getElementById('daily-completed')) return;
  const done = new Set(progress.records.filter(r => r.period === 'daily' && r.periodKey === day).map(r => r.gameId));
  document.getElementById('daily-completed').textContent = `${dailyGames.filter(id => done.has(id)).length} of ${dailyGames.length}`;
  document.getElementById('streak-count').textContent = stats.streak;
  const week = document.getElementById('activity-week');
  week.replaceChildren(...stats.week.map(({day: date, complete}) => {
    const item = document.createElement('span'); item.className = `activity-day${complete ? ' complete' : ''}${date === day ? ' today' : ''}`;
    item.setAttribute('aria-label', `${date}: ${complete ? 'daily puzzle completed' : 'no daily completion recorded'}${date === day ? ', today' : ''}`);
    const name = document.createElement('span');name.textContent = new Intl.DateTimeFormat('en', {weekday:'narrow', timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
    const circle = document.createElement('b');circle.textContent = new Date(date+'T12:00:00Z').getUTCDate();
    item.append(name, circle);return item;
  }));
  for (const id of dailyGames) {
    const status = document.querySelector(`[data-status="${id}"]`), link = document.querySelector(`[data-play="${id}"]`);
    const started = progress.starts.some(r => r.gameId === id && r.period === 'daily' && r.periodKey === day);
    status.textContent = done.has(id) ? 'Completed today. Nicely done.' : started ? 'Started on this device' : 'Ready when you are';
    status.classList.toggle('done', done.has(id));
    link.textContent = done.has(id) ? 'Play again' : started && id !== 'octoflag' ? 'Continue puzzle' : labels[id];
  }
  const weekly = progress.records.filter(r => r.gameId === 'octocross' && r.period === 'weekly');
  // Existing crossword weekly editions change at Monday 00:00 Mauritius (UTC+4).
  const weekId = Math.floor((now.getTime()+14400000-Date.UTC(2026,9,19))/604800000);
  if (weekly.some(r => r.periodKey === String(weekId) || r.periodKey === `week-${weekId}`)) document.getElementById('weekly-progress').textContent = 'This week, beautifully solved.';
  document.getElementById('progress-storage').textContent = progress.persistent
    ? 'Progress stays in this browser. No account or cross-device sync.'
    : 'Browser storage is unavailable. Progress may be lost when you leave this page.';
}
function countdown() {
  const now = new Date(); if (utcDay(now) !== lastDay) render();
  const el = document.getElementById('daily-countdown'); if (!el) return;
  const remaining = Math.ceil((Date.parse(utcDay(now)+'T00:00:00Z')+86400000-now.getTime())/1000);
  el.textContent = `${Math.floor(remaining/3600)}h ${String(Math.floor(remaining%3600/60)).padStart(2,'0')}m`;
}
document.getElementById('share-daily')?.addEventListener('click', async () => {
  const status = document.getElementById('share-status');
  const url = 'https://octolabs.app/games/';
  const text = `A little challenge. Every day. Play today's puzzles with me at Octolabs Games.`;
  status.replaceChildren();
  try {
    if (navigator.share) {await navigator.share({title:'Octolabs Games',text,url});status.textContent='Share sheet opened.';}
    else {await navigator.clipboard.writeText(`${text}\n${url}`);status.textContent='Link copied. Send a little challenge to your people.';}
  } catch (e) {
    if (e.name === 'AbortError') return;
    status.textContent = 'Copy this link to share:';
    const input = document.createElement('input');input.readOnly=true;input.value=url;input.className='share-fallback';input.setAttribute('aria-label','Link to today’s games');status.append(input);input.focus();input.select();
  }
});
addEventListener('storage', event => {if (event.key === STORAGE_KEY || event.key === null) render();});
addEventListener('octolabs:progress', render);
document.addEventListener('visibilitychange', () => {if (!document.hidden) {render();countdown();}});
render();countdown();if(document.getElementById('daily-countdown'))setInterval(countdown, 10000);
