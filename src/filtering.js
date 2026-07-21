import { COLUMNS } from "./columns.js";

const TEXT_MATCHERS = {
  include: (value, needle) => value.includes(needle),
  exclude: (value, needle) => !value.includes(needle),
  fuzzy: (value, needle) => isSubsequence(needle, value),
};

/**
 * Returns the heroes matching the active search field, operator, and query,
 * ignoring case for text. A blank query keeps every hero and an unknown
 * field is a no-op; the source array is never mutated.
 *
 * @param {ReadonlyArray<object>} heroes
 * @param {{ field?: string, operator?: string, query?: string }} filterState
 * @param {ReadonlyArray<{ key: string, kind: string, read: (hero: object) => unknown }>} [columns]
 * @returns {object[]}
 */
function filterHeroes(heroes, { field = "name", operator = "include", query = "" } = {}, columns = COLUMNS) {
  const needle = String(query).trim();

  if (needle === "") {
    return [...heroes];
  }

  const column = columns.find((candidate) => candidate.key === field);

  if (!column) {
    return [...heroes];
  }

  if (column.kind === "number") {
    return [...heroes]; // Numeric operators are added in the next increment.
  }

  return filterByText(heroes, column, operator, needle.toLowerCase());
}

function filterByText(heroes, column, operator, needle) {
  const match = TEXT_MATCHERS[operator] ?? TEXT_MATCHERS.include;

  return heroes.filter((hero) =>
    match(String(column.read(hero) ?? "").toLowerCase(), needle),
  );
}

function isSubsequence(needle, value) {
  let index = 0;

  for (const character of value) {
    if (index >= needle.length) {
      break;
    }

    if (character === needle[index]) {
      index += 1;
    }
  }

  return index === needle.length;
}

export { filterHeroes };
