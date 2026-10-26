import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyCrossword,editionDate} from '../octocross/daily.mjs';
import {readFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../octocross/catalog.json',import.meta.url),'utf8'));
test('daily crossword is the same worldwide and rolls at UTC midnight',()=>{
  const a=dailyCrossword(catalog,new Date('2026-10-26T00:01:00Z'));
  assert.deepEqual(a,dailyCrossword(catalog,new Date('2026-10-26T23:59:59Z')));
  assert.deepEqual(a,dailyCrossword(catalog,new Date('2026-10-26T04:01:00+04:00')));
  assert.notDeepEqual(a,dailyCrossword(catalog,new Date('2026-10-27T00:00:00Z')));
});
test('eight themes rotate without repeating a grid over 10000 daily editions',()=>{
  const seen=new Set(),themes=new Set();
  for(let i=0;i<10000;i++){
    const d=dailyCrossword(catalog,new Date(Date.UTC(2026,9,26)+i*86400000));
    const key=`${d.themeIndex}:${d.index}`;assert.equal(seen.has(key),false);seen.add(key);themes.add(d.themeIndex);
    assert.ok(d.index>=0&&d.index<catalog.themes[d.themeIndex].seeds.length);
  }
  assert.equal(themes.size,8);
});
test('shared edition dates validate real calendar days and reject malformed links',()=>{
  assert.equal(editionDate('2026-02-30'),null);assert.equal(editionDate('anything'),null);
  assert.equal(editionDate(null),null);assert.equal(editionDate('2028-02-29').toISOString(),'2028-02-29T00:00:00.000Z');
});
