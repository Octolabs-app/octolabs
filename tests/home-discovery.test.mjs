import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../home.mjs', import.meta.url), 'utf8');

function discovery() {
  const control = (dataset = {}) => ({
    dataset, hidden: false, value: '', attributes: {}, events: {}, focused: false,
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(name, handler) { this.events[name] = handler; },
    focus() { this.focused = true; },
  });
  const filters = ['all', 'solo', 'friends', 'words'].map(filter => control({ filter }));
  const cards = [
    { dataset: { types: 'solo words' }, textContent: 'OctoCross Weekly crossword' },
    { dataset: { types: 'friends' }, textContent: 'OctoQuiz Multiplayer' },
    { dataset: { types: 'solo friends words' }, textContent: 'Letters & Numbers' },
  ];
  const search = control(), reset = control(), results = control();
  const elements = { 'game-search': search, 'game-reset': reset, 'game-results': results };
  vm.runInNewContext(source, { document: {
    querySelectorAll: selector => selector === '[data-filter]' ? filters : cards,
    getElementById: id => elements[id],
  } });
  return { filters, cards, search, reset, results };
}

test('category and case-insensitive search combine without exposing unrelated games', () => {
  const ui = discovery();
  ui.filters[2].events.click();
  ui.search.value = '  LETTERS  ';
  ui.search.events.input();
  assert.deepEqual(ui.cards.map(card => card.hidden), [true, true, false]);
  assert.equal(ui.results.textContent, '1 game to explore');
  assert.equal(ui.filters[2].attributes['aria-pressed'], 'true');
});

test('Clear filters recovers from an empty search, resets category and returns visible focus', () => {
  const ui = discovery();
  assert.equal(ui.reset.hidden, true);
  ui.filters[2].events.click();
  ui.search.value = 'no matching game';
  ui.search.events.input();
  assert.equal(ui.cards.every(card => card.hidden), true);
  assert.equal(ui.reset.hidden, false);
  ui.reset.events.click();
  assert.equal(ui.search.value, '');
  assert.equal(ui.cards.some(card => card.hidden), false);
  assert.equal(ui.filters[0].attributes['aria-pressed'], 'true');
  assert.equal(ui.filters[2].attributes['aria-pressed'], 'false');
  assert.equal(ui.results.textContent, '3 games to explore');
  assert.equal(ui.reset.hidden, true);
  assert.equal(ui.search.focused, true);
});
