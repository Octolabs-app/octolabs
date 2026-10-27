import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dailyCrossword, dayId, crosswordProgress } from '../daily/engine.mjs';
import { generate, validate } from '../octocross/engine.mjs';
const catalog = JSON.parse(readFileSync(new URL('../octocross/catalog.json', import.meta.url)));
test('daily selection is shared across timezones and changes at UTC midnight', () => {
  const a = dailyCrossword(catalog, new Date('2026-10-26T23:59:59Z'));
  const b = dailyCrossword(catalog, new Date('2026-10-27T03:59:59+04:00'));
  assert.equal(a.href, b.href);
  assert.notEqual(a.href, dailyCrossword(catalog, new Date('2026-10-27T00:00:00Z')).href);
  assert.equal(dayId(new Date('2026-10-27T03:59:59+04:00')), '2026-10-26');
});
test('one year of daily links selects valid catalog puzzles', () => {
  const links = new Set();
  for (let n=0;n<366;n++) {
    const challenge = dailyCrossword(catalog, new Date(Date.UTC(2026,9,26+n)));
    assert.deepEqual(validate(generate(challenge.theme, challenge.seed)), []);
    assert.ok(!links.has(challenge.href)); links.add(challenge.href);
  }
});
test('completion is verified from answers, not a stale finished flag; hints remain visible', () => {
  const challenge = dailyCrossword(catalog, new Date('2026-10-26T12:00Z'));
  assert.equal(crosswordProgress(challenge, {finished:true}).complete, false);
  assert.equal(crosswordProgress(challenge, null).filled, 0);
  const letters = {};
  generate(challenge.theme, challenge.seed).cells.forEach((row,r)=>row.forEach((v,c)=>{if(v)letters[`${r},${c}`]=v;}));
  assert.equal(crosswordProgress(challenge, {letters,hints:3}).complete, true);
  assert.equal(crosswordProgress(challenge, {letters,hints:3}).hints, 3);
  delete letters[Object.keys(letters)[0]];
  assert.equal(crosswordProgress(challenge, {letters}).complete, false);
});
