import { COLUMNS } from "./columns.js";
import { PAGE_SIZES } from "./pagination.js";
import { INITIAL_STATE } from "./state.js";
import {
  defaultOperatorForField,
  isSearchableField,
  isValidOperator,
} from "./search-fields.js";

/**
 * Parses and validates the restorable list/detail state from the URL.
 * Each parameter falls back to its canonical default when missing or
 * malformed. The `hero` parameter owned by issue #5 is validated and
 * represented as `selectedHeroId`.
 *
 * @param {URLSearchParams|string} searchParams
 * @returns {{
 *   field: string, operator: string, query: string, page: number,
 *   pageSize: 10|20|50|100|"all", sortKey: string,
 *   sortDirection: "asc"|"desc", selectedHeroId: number|null
 * }}
 */
function stateFromUrl(searchParams) {
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams ?? "");

  const field = isSearchableField(params.get("field"))
    ? params.get("field")
    : INITIAL_STATE.field;
  const operator = isValidOperator(field, params.get("op"))
    ? params.get("op")
    : defaultOperatorForField(field);

  return {
    field,
    operator,
    query: params.get("q") ?? INITIAL_STATE.query,
    page: parsePage(params.get("page")),
    pageSize: parsePageSize(params.get("size")),
    sortKey: isColumnKey(params.get("sort"))
      ? params.get("sort")
      : INITIAL_STATE.sortKey,
    sortDirection: parseDirection(params.get("dir")),
    selectedHeroId: parseHeroId(params.get("hero")),
  };
}

/**
 * Serializes the restorable slice of state, omitting values that equal
 * the defaults so shared URLs stay clean. A selected hero ID is serialized.
 *
 * @param {{
 *   field?: string, operator?: string, query?: string, page?: number,
 *   pageSize?: 10|20|50|100|"all", sortKey?: string,
 *   sortDirection?: "asc"|"desc", selectedHeroId?: number|null
 * }} state
 * @returns {URLSearchParams}
 */
function stateToUrl(state) {
  const params = new URLSearchParams();
  const field = state.field ?? INITIAL_STATE.field;
  const operator = state.operator ?? defaultOperatorForField(field);

  if (field !== INITIAL_STATE.field) {
    params.set("field", field);
  }

  if (operator !== defaultOperatorForField(field)) {
    params.set("op", operator);
  }

  if (state.query) {
    params.set("q", state.query);
  }

  if (state.page !== undefined && state.page !== INITIAL_STATE.page) {
    params.set("page", String(state.page));
  }

  if (state.pageSize !== undefined && state.pageSize !== INITIAL_STATE.pageSize) {
    params.set("size", String(state.pageSize));
  }

  if (state.sortKey !== undefined && state.sortKey !== INITIAL_STATE.sortKey) {
    params.set("sort", state.sortKey);
  }

  if (
    state.sortDirection !== undefined &&
    state.sortDirection !== INITIAL_STATE.sortDirection
  ) {
    params.set("dir", state.sortDirection);
  }

  if (state.selectedHeroId !== undefined && state.selectedHeroId !== null) {
    params.set("hero", String(state.selectedHeroId));
  }

  return params;
}

function isColumnKey(key) {
  return COLUMNS.some((column) => column.key === key);
}

function parsePage(raw) {
  const page = Number(raw);

  return Number.isInteger(page) && page >= 1 ? page : INITIAL_STATE.page;
}

function parsePageSize(raw) {
  if (raw === "all") {
    return "all";
  }

  const size = Number(raw);

  return PAGE_SIZES.includes(size) ? size : INITIAL_STATE.pageSize;
}

function parseDirection(raw) {
  return raw === "asc" || raw === "desc" ? raw : INITIAL_STATE.sortDirection;
}

function parseHeroId(raw) {
  if (raw === null) {
    return INITIAL_STATE.selectedHeroId;
  }

  const heroId = Number(raw);

  return Number.isInteger(heroId) && heroId >= 1
    ? heroId
    : INITIAL_STATE.selectedHeroId;
}

export { stateFromUrl, stateToUrl };
