// Personal device progress only. No network requests, accounts or public scores.
export const STORAGE_KEY = 'octolabs-progress-v1';
const LIMIT = 400;
const games = new Set(['octocross', 'octoflag', 'letters-numbers', 'daily-numbers']);
let memory = {version: 1, records: [], starts: []};
const failedStores = new WeakSet();
export function utcDay(date = new Date()) { return date.toISOString().slice(0, 10); }
function validDay(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value + 'T00:00:00Z'))
    && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
}
function valid(record) {
  return record && games.has(record.gameId) && ['daily', 'weekly'].includes(record.period)
    && typeof record.puzzleId === 'string' && /^[a-zA-Z0-9_:.\-]{1,140}$/.test(record.puzzleId)
    && typeof record.periodKey === 'string' && /^[a-zA-Z0-9_:.\-]{1,80}$/.test(record.periodKey)
    && (record.period !== 'daily' || validDay(record.periodKey))
    && Number.isFinite(record.at) && record.at > 0;
}
export function editionKey(record) { return [record.gameId, record.period, record.periodKey, record.puzzleId].join('|'); }
function clean(records) {
  const seen = new Set();
  return (Array.isArray(records) ? records : []).filter(valid).filter(record => {
    const key = editionKey(record);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(-LIMIT).map(({gameId, puzzleId, period, periodKey, at, summary}) => ({
    gameId, puzzleId, period, periodKey, at,
    summary: typeof summary === 'string' ? summary.slice(0, 180) : '',
  }));
}
export function readProgress(storage = defaultStorage()) {
  if (!storage) return {...memory, persistent: false};
  if (failedStores.has(storage)) return {...memory, persistent: false};
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.version === 1) memory = {version: 1, records: clean(parsed.records), starts: clean(parsed.starts)};
    else if (!raw) memory = {version: 1, records: [], starts: []};
    return {...memory, persistent: Boolean(storage)};
  } catch { return {...memory, persistent: false}; }
}
function record(kind, input, storage) {
  const current = readProgress(storage);
  const entry = {...input, at: Date.now()};
  if (!valid(entry)) return {saved: false, added: false};
  const list = current[kind];
  if (list.some(value => editionKey(value) === editionKey(entry))) return {saved: current.persistent, added: false};
  memory = {version: 1, records: current.records, starts: current.starts, [kind]: clean([...list, entry])};
  let saved = false;
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(memory)); saved = Boolean(storage);
    if (storage) failedStores.delete(storage);
  } catch { if (storage && typeof storage === 'object') failedStores.add(storage); }
  try { globalThis.dispatchEvent?.(new CustomEvent('octolabs:progress', {detail: {gameId: entry.gameId}})); } catch {}
  return {saved, added: true};
}
// Resolve storage inside try: even accessing localStorage can throw in restricted browsers.
function defaultStorage() { try { return globalThis.localStorage; } catch { return undefined; } }
export function recordStarted(input, storage = defaultStorage()) { return record('starts', input, storage); }
export function recordCompletion(input, storage = defaultStorage()) { return record('records', input, storage); }
export function activity(records, date = new Date()) {
  const today = utcDay(date);
  const days = new Set(clean(records).filter(r => r.period === 'daily' && r.periodKey <= today).map(r => r.periodKey));
  const before = (day, n) => utcDay(new Date(Date.parse(day + 'T00:00:00Z') - n * 86400000));
  let cursor = days.has(today) ? today : before(today, 1), streak = 0;
  while (days.has(cursor)) { streak++; cursor = before(cursor, 1); }
  const week = Array.from({length: 7}, (_, i) => { const day = before(today, 6 - i); return {day, complete: days.has(day)}; });
  return {today, streak, activeDays: week.filter(d => d.complete).length, week};
}
