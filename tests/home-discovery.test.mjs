import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const { parseHTML } = require('linkedom');
const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('home.mjs', root), 'utf8');
const readPage = path => parseHTML(readFileSync(new URL(path, root), 'utf8'));

function discovery() {
  const { document, window } = readPage('games/index.html');
  let focused;
  window.HTMLElement.prototype.focus = function () { focused = this; };
  vm.runInNewContext(source, { document });
  return {
    document,
    filters: [...document.querySelectorAll('[data-filter]')],
    cards: [...document.querySelectorAll('.game-card')],
    search: document.getElementById('game-search'),
    reset: document.getElementById('game-reset'),
    results: document.getElementById('game-results'),
    click: element => element.dispatchEvent(new window.Event('click')),
    input: element => element.dispatchEvent(new window.Event('input')),
    focused: () => focused,
  };
}

test('catalog category and case-insensitive search combine against the real game cards', () => {
  const ui = discovery();
  assert.equal(ui.cards.length, 5);
  ui.click(ui.filters.find(button => button.dataset.filter === 'friends'));
  ui.search.value = '  LETTERS  ';
  ui.input(ui.search);
  const visible = ui.cards.filter(card => !card.hidden);
  assert.equal(visible.length, 1);
  assert.match(visible[0].textContent, /Letters/);
  assert.equal(ui.results.textContent, '1 game to explore');
  assert.equal(ui.filters.find(button => button.dataset.filter === 'friends').getAttribute('aria-pressed'), 'true');
});

test('catalog Clear filters recovers the five games and returns focus to search', () => {
  const ui = discovery();
  assert.equal(ui.reset.hidden, true);
  ui.click(ui.filters.find(button => button.dataset.filter === 'friends'));
  ui.search.value = 'no matching game';
  ui.input(ui.search);
  assert.equal(ui.cards.every(card => card.hidden), true);
  assert.equal(ui.reset.hidden, false);
  ui.click(ui.reset);
  assert.equal(ui.search.value, '');
  assert.equal(ui.cards.every(card => !card.hidden), true);
  assert.equal(ui.filters.find(button => button.dataset.filter === 'all').getAttribute('aria-pressed'), 'true');
  assert.equal(ui.filters.find(button => button.dataset.filter === 'friends').getAttribute('aria-pressed'), 'false');
  assert.equal(ui.results.textContent, '5 games to explore');
  assert.equal(ui.reset.hidden, true);
  assert.equal(ui.focused(), ui.search);
});

test('separate pages expose unique headings, canonical URLs, working navigation and legacy destinations', () => {
  const paths = ['index.html', 'games/index.html', 'studio/index.html', 'android/index.html'];
  const canonical = new Set();
  for (const path of paths) {
    const { document } = readPage(path);
    assert.equal(document.querySelectorAll('h1').length, 1, path + ' needs one clear page heading');
    const url = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    assert.ok(url?.startsWith('https://octolabs.app/'), path + ' needs a production canonical URL');
    assert.equal(canonical.has(url), false, path + ' reuses another page canonical URL');
    canonical.add(url);
    const nav = document.querySelector('nav[aria-label="Main navigation"]');
    assert.ok(nav, path + ' needs shared navigation');
    for (const route of ['/games/', '/studio/', '/android/']) {
      assert.ok(nav.querySelector('a[href="' + route + '"]'), path + ' does not link to ' + route);
    }
    if (path !== 'index.html') {
      const route = '/' + path.split('/')[0] + '/';
      assert.equal(nav.querySelector('a[href="' + route + '"]').getAttribute('aria-current'), 'page');
    }
    for (const link of document.querySelectorAll('a[href^="/"]')) {
      const href = link.getAttribute('href');
      const pathname = href.split(/[?#]/)[0];
      if (pathname === '/letters-and-numbers/') continue; // Existing Worker-backed route.
      const file = pathname.endsWith('/') ? pathname + 'index.html' : pathname;
      assert.ok(existsSync(new URL('.' + file, root)), path + ' links to missing local destination ' + href);
    }
    const hasCatalogScript = [...document.querySelectorAll('script[src]')].some(script => script.getAttribute('src').split('?')[0] === '/home.mjs');
    assert.equal(hasCatalogScript, path === 'games/index.html', path + ' loads catalog JS without controls');
  }
  const { document: home } = readPage('index.html');
  assert.equal(home.querySelector('#game-search'), null, 'full filtering belongs on games subpage');
  assert.equal(home.querySelectorAll('.game-card').length, 0, 'full catalog cards should leave homepage');
  for (const id of ['games', 'studio', 'android']) {
    assert.ok(home.getElementById(id), 'old /#' + id + ' links need a useful destination');
  }
});
