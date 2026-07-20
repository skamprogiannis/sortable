import { PAGE_SIZES } from "./pagination.js";

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
  pageSize: 20,
  sortKey: "name",
  sortDirection: "asc",
  selectedHeroId: null,
});

/**
 * Returns the next state after typing in the search box.
 *
 * @param {AppState} currentState
 * @param {string} query
 * @returns {AppState}
 */
function applySearch(currentState, query) {
  return { ...currentState, query, page: 1 };
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
