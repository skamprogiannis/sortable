import { COLUMNS } from "./columns.js";
import { normalizeValue } from "./normalize.js";

const TEXT_MATCHERS = {
  include: (value, needle) => value.includes(needle),
  exclude: (value, needle) => !value.includes(needle),
  fuzzy: (value, needle) => isSubsequence(needle, value),
};

const NUMBER_MATCHERS = {
  "equal": (value, threshold) => value === threshold,
  "not-equal": (value, threshold) => value !== threshold,
  "greater-than": (value, threshold) => value > threshold,
  "less-than": (value, threshold) => value < threshold,
};

/**
 * Returns the heroes matching the active search field, operator, and query,
 * ignoring case for text. A blank query, unknown field, or unsupported
 * descriptor kind keeps every hero; the source array is never mutated.
 *
 * @param {ReadonlyArray<object>} heroes
 * @param {{ field?: string, operator?: string, query?: string }} filterState
 * @param {ReadonlyArray<{ key: string, kind: string, read: (hero: object) => unknown }>} [columns]
 * @returns {ReadonlyArray<object>}
 */
function filterHeroes(
  heroes,
  { field = "name", operator = "include", query = "" } = {},
  columns = COLUMNS,
) {
  const needle = String(query).trim();

  if (needle === "") {
    return heroes;
  }

  const column = columns.find((candidate) => candidate.key === field);

  if (!column) {
    return heroes;
  }

  if (column.kind === "number") {
    return filterByNumber(heroes, column, operator, needle);
  }

  if (column.kind === "text") {
    return filterByText(heroes, column, operator, needle.toLowerCase());
  }

  return heroes;
}

function filterByText(heroes, column, operator, needle) {
  const match = TEXT_MATCHERS[operator] ?? TEXT_MATCHERS.include;

  return heroes.filter((hero) =>
    match(String(column.read(hero) ?? "").toLowerCase(), needle),
  );
}

function filterByNumber(heroes, column, operator, needle) {
  const threshold = Number(needle);

  if (!Number.isFinite(threshold)) {
    return heroes;
  }

  const match = NUMBER_MATCHERS[operator] ?? NUMBER_MATCHERS.equal;

  return heroes.filter((hero) => {
    const value = normalizeValue(column.read(hero), column);

    // Missing values never satisfy a numeric comparison.
    return value !== null && match(value, threshold);
  });
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
