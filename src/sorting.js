/**
 * Returns the next sort state after a table heading is activated.
 *
 * @param {{ key: string, direction: "asc" | "desc" }} currentSortState
 * @param {string} columnKey
 * @returns {{ key: string, direction: "asc" | "desc" }}
 */
export function nextSortState(currentSortState, columnKey) {
  if (currentSortState.key !== columnKey) {
    return { key: columnKey, direction: "asc" };
  }

  return {
    key: columnKey,
    direction: currentSortState.direction === "asc" ? "desc" : "asc",
  };
}

/**
 * Returns the WAI-ARIA sort state for a table heading.
 *
 * @param {{ key: string, direction: "asc" | "desc" }} sortState
 * @param {string} columnKey
 * @returns {"ascending" | "descending" | "none"}
 */
export function getAriaSort(sortState, columnKey) {
  if (sortState.key !== columnKey) {
    return "none";
  }

  return sortState.direction === "desc" ? "descending" : "ascending";
}

/**
 * Returns a sorted copy of heroes using the requested column descriptor.
 *
 * @param {object[]} heroes
 * @param {{ key: string, direction: "asc" | "desc" }} sortState
 * @param {{ key: string, kind: "image" | "number" | "text", read: (hero: object) => unknown }[]} columns
 * @returns {object[]}
 */
export function sortHeroes(heroes, sortState, columns) {
  const column = columns.find(({ key }) => key === sortState.key);
  const nameColumn = columns.find(({ key }) => key === "name");

  if (!column) {
    throw new Error(`Unknown sort column: ${sortState.key}`);
  }

  const direction = sortState.direction === "desc" ? -1 : 1;

  return [...heroes].sort((firstHero, secondHero) => {
    const firstValue = normalizeValue(column.read(firstHero), column);
    const secondValue = normalizeValue(column.read(secondHero), column);
    const missingComparison = compareMissingValues(firstValue, secondValue);

    if (missingComparison !== 0) {
      return missingComparison;
    }

    if (firstValue !== null) {
      const comparison = comparePresentValues(column, firstValue, secondValue);

      if (comparison !== 0) {
        return comparison * direction;
      }
    }

    return compareText(readName(firstHero, nameColumn), readName(secondHero, nameColumn));
  });
}

function compareMissingValues(firstValue, secondValue) {
  // Missing values are always placed last, before sort direction is considered.
  if (firstValue === null || secondValue === null) {
    if (firstValue === secondValue) {
      return 0;
    }

    return firstValue === null ? 1 : -1;
  }

  return 0;
}

function comparePresentValues(column, firstValue, secondValue) {
  // Numeric columns use numeric subtraction; all other visible values use text order.
  if (column.kind === "number") {
    return firstValue - secondValue;
  }

  return compareText(firstValue, secondValue);
}

function normalizeValue(rawValue, column) {
  // Convert each raw API value into a comparable value, or the shared missing marker.
  if (isMissing(rawValue, column)) {
    return null;
  }

  if (column.kind !== "number") {
    return String(rawValue).trim();
  }

  const numericValue = normalizeNumber(rawValue, column);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeNumber(rawValue, column) {
  if (typeof rawValue === "number") {
    return rawValue;
  }

  const normalizedValue = String(rawValue).trim().replaceAll(",", "");
  const numericValue = Number.parseFloat(normalizedValue);

  if (column.key === "weight" && normalizedValue.endsWith("tons")) {
    return numericValue * 1000;
  }

  if (column.key === "height" && normalizedValue.endsWith("meters")) {
    return numericValue * 100;
  }

  return numericValue;
}

function isMissing(value, column) {
  // Columns may define extra missing cases, while common API placeholders work everywhere.
  if (column.isMissing?.(value)) {
    return true;
  }

  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();

  return normalizedValue === "" || normalizedValue === "-" || normalizedValue === "0 cm" || normalizedValue === "0 kg";
}

function readName(hero, nameColumn) {
  // Name ascending makes otherwise equal records deterministic.
  return nameColumn ? nameColumn.read(hero) : hero.name;
}

function compareText(firstValue, secondValue) {
  // Ignore case so names such as "Alpha" and "alpha" sort together naturally.
  return String(firstValue).localeCompare(String(secondValue), undefined, { sensitivity: "base" });
}
