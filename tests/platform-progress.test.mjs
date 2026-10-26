import test from 'node:test';
import assert from 'node:assert/strict';
import {recordStarted,recordCompletion,readProgress,activity,STORAGE_KEY} from '../platform/progress.mjs';
const storage = () => {const values = new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};};
const edition = (day='2026-10-26', extra={}) => ({gameId:'daily-numbers',puzzleId:`numbers-v1-${day}`,period:'daily',periodKey:day,summary:'Solved in 4 steps',...extra});
test('starting is not completing; replays and two tabs count one edition',()=>{
  const s=storage();recordStarted(edition(),s);
  assert.equal(readProgress(s).records.length,0);
  assert.equal(recordCompletion(edition(),s).added,true);
  assert.equal(recordCompletion(edition(),s).added,false);
  assert.equal(readProgress(s).records.length,1);
  assert.equal(readProgress(s).starts.length,1);
});
test('UTC edition frozen at start is retained after midnight; future editions do not inflate streak',()=>{
  const s=storage();recordCompletion(edition('2026-10-25'),s);recordCompletion(edition('2026-10-26'),s);recordCompletion(edition('2026-11-01'),s);
  const atMidnight=activity(readProgress(s).records,new Date('2026-10-27T00:00:01Z'));
  assert.equal(atMidnight.streak,2);assert.equal(atMidnight.activeDays,2);
  assert.equal(atMidnight.week.at(-1).complete,false);
});
test('multiple games on one day count one activity day and weekly solves cannot extend a streak',()=>{
  const s=storage();recordCompletion(edition(),s);
  recordCompletion(edition('2026-10-26',{gameId:'octocross',puzzleId:'cross-v1-1'}),s);
  recordCompletion(edition('2026-10-26',{period:'weekly',periodKey:'week-1',puzzleId:'weekly-v1-1'}),s);
  const records=readProgress(s).records;
  assert.equal(activity(records,new Date('2026-10-26T12:00:00Z')).activeDays,1);
  assert.equal(activity(records,new Date('2026-10-28T12:00:00Z')).streak,0);
});
test('invalid dates, unrecognized games and corrupt entries cannot create progress',()=>{
  const s=storage();
  for(const extra of [{gameId:'octopairs'},{periodKey:'2026-02-30'},{puzzleId:'<script>'},{period:'free'}])assert.equal(recordCompletion(edition('2026-10-26',extra),s).added,false);
  s.setItem(STORAGE_KEY,JSON.stringify({version:1,records:[{...edition(),at:123},null,{}],starts:[]}));
  assert.equal(readProgress(s).records.length,1);
});
test('storage failure never blocks gameplay or falsely claims a persistent save',()=>{
  const s={getItem:()=>null,setItem(){throw Error('quota');}};
  const result=recordCompletion(edition(),s);assert.equal(result.added,true);assert.equal(result.saved,false);
  assert.equal(readProgress(s).persistent,false);
  assert.equal(readProgress(s).records.length,1,'a failed disk write must preserve session progress');
  const blocked={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};
  assert.equal(readProgress(blocked).persistent,false);
  assert.doesNotThrow(()=>recordStarted(edition(),blocked));
});
