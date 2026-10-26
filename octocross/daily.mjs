export function dailyCrossword(catalog, date = new Date()) {
  if (!catalog?.themes?.length || catalog.themes.some(g => !Array.isArray(g.seeds) || !g.seeds.length)) throw new Error('Invalid crossword catalog');
  const day = date.toISOString().slice(0, 10);
  const ordinal = Math.floor(Date.parse(day + 'T00:00:00Z') / 86400000);
  const themeIndex = ((ordinal % catalog.themes.length) + catalog.themes.length) % catalog.themes.length;
  const group = catalog.themes[themeIndex];
  const index = ((Math.floor(ordinal / catalog.themes.length) % group.seeds.length) + group.seeds.length) % group.seeds.length;
  return {themeIndex, index, day};
}
export function editionDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}
