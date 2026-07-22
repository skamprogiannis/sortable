import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from "./pagination.js";

/**
 * @typedef {object} AppState
 * @property {"loading"|"ready"|"error"} status
 * @property {ReadonlyArray<object>} heroes
 * @property {string} field
 * @property {string} operator
 * @property {string} query
 * @property {number} page
 * @property {10|20|50|100|"all"} pageSize
 * @property {string} sortKey
 * @property {"asc"|"desc"} sortDirection
 * @property {number|null} selectedHeroId
 */

/** @type {Readonly<AppState>} */
const INITIAL_STATE = Object.freeze({
  status: "loading",
  heroes: Object.freeze([]),
  field: "name",
  operator: "include",
  query: "",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  sortKey: "name",
  sortDirection: "asc",
  selectedHeroId: null,
});

/**
 * Returns the next state for an active field, operator, and query.
 *
 * @param {AppState} currentState
 * @param {{ field: string, operator: string, query: string }} search
 * @returns {AppState}
 */
function applySearch(currentState, { field, operator, query }) {
  return { ...currentState, field, operator, query, page: 1 };
}

/**
 * Returns the next state after selecting a supported page size.
 *
 * @param {AppState} currentState
 * @param {10|20|50|100|"all"} pageSize
 * @returns {AppState}
 */
function applyPageSize(currentState, pageSize) {
  if (!PAGE_SIZES.includes(pageSize)) {
    return { ...currentState };
  }

  return { ...currentState, pageSize, page: 1 };
}

/**
 * Returns the next state for a valid client-side page.
 *
 * @param {AppState} currentState
 * @param {number} page
 * @param {number} pageCount
 * @returns {AppState}
 */
function applyPage(currentState, page, pageCount) {
  if (!Number.isInteger(page) || page < 1 || page > pageCount) {
    return { ...currentState };
  }

  return { ...currentState, page };
}

export { applyPage, applyPageSize, applySearch, INITIAL_STATE };
