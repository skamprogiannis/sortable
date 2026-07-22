/**
 * Finds the selected hero in the canonical hero array.
 * Invalid and unknown IDs have no selection.
 *
 * @param {ReadonlyArray<{ id?: number }>} heroes
 * @param {number|null} selectedHeroId
 * @returns {object|null}
 */
function findHeroById(heroes, selectedHeroId) {
  if (!Number.isInteger(selectedHeroId) || selectedHeroId < 1) {
    return null;
  }

  return heroes.find((hero) => hero.id === selectedHeroId) ?? null;
}

export { findHeroById };
