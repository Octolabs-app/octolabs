import { generate } from '../octocross/engine.mjs';
import { themes } from '../octocross/themes.mjs';
export const dayId = (now = new Date()) => now.toISOString().slice(0, 10);
export function dailyCrossword(catalog, now = new Date()) {
  const day = Math.floor(now.getTime() / 86400000);
  const themeIndex = ((day % catalog.themes.length) + catalog.themes.length) % catalog.themes.length;
  const group = catalog.themes[themeIndex];
  const index = ((Math.floor(day / catalog.themes.length) % group.seeds.length) + group.seeds.length) % group.seeds.length;
  const theme = themes[themeIndex], seed = group.seeds[index];
  return { theme, seed, key: `octocross-v1-${theme.id}-${seed}`, href: `/octocross/?theme=${encodeURIComponent(theme.id)}&puzzle=${index + 1}` };
}
export function crosswordProgress(challenge, saved) {
  const puzzle = generate(challenge.theme, challenge.seed);
  let total = 0, filled = 0, correct = 0;
  puzzle.cells.forEach((row, r) => row.forEach((letter, c) => {
    if (!letter) return;
    total++;
    const answer = saved?.letters?.[`${r},${c}`];
    if (/^[A-Z]$/.test(answer || '')) filled++;
    if (answer === letter) correct++;
  }));
  const hints = Number.isSafeInteger(saved?.hints) && saved.hints >= 0 ? saved.hints : 0;
  return { complete: correct === total, filled, total, hints };
}
