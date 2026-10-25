const filters = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('.game-card')];
const search = document.getElementById('game-search');
const results = document.getElementById('game-results');
const reset = document.getElementById('game-reset');
let filter = 'all';

function apply() {
  let count = 0;
  const query = search.value.trim().toLowerCase();
  for (const card of cards) {
    const match = (filter === 'all' || card.dataset.types.split(' ').includes(filter))
      && card.textContent.toLowerCase().includes(query);
    card.hidden = !match;
    if (match) count++;
  }
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  reset.hidden = filter === 'all' && !search.value;
  results.textContent = count
    ? `${count} ${count === 1 ? 'game' : 'games'} to explore`
    : 'No games match. Clear filters to see all games.';
}

filters.forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  apply();
}));
search.addEventListener('input', apply);
reset.addEventListener('click', () => {
  filter = 'all';
  search.value = '';
  apply();
  // The reset button becomes hidden; return focus to a useful visible control.
  search.focus();
});
apply();
