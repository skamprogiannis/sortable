/**
 * Returns the heroes whose Name contains the query, ignoring case.
 * An empty query keeps every hero. The source array is never mutated.
 *
 * @param {ReadonlyArray<object>} heroes
 * @param {{ query: string }} filterState
 * @returns {object[]}
 */
function filterHeroes(heroes, { query }) {
  const needle = (query ?? "").toLowerCase();

  return heroes.filter((hero) => (hero.name ?? "").toLowerCase().includes(needle));
}

export { filterHeroes };
