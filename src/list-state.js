import { PAGE_SIZES } from "./pagination.js";

/**
 * Returns the next list state after typing in the search box.
 * Filtering always returns to the first page.
 *
 * @param {object} listState
 * @param {string} query
 * @returns {object}
 */
export function applySearch(listState, query) {
  return { ...listState, query, page: 1 };
}

/**
 * Returns the next list state after picking a page size.
 * A size change returns to the first page; unsupported sizes are ignored.
 *
 * @param {object} listState
 * @param {10|20|50|100|"all"} pageSize
 * @returns {object}
 */
export function applyPageSize(listState, pageSize) {
  if (!PAGE_SIZES.includes(pageSize)) {
    return { ...listState };
  }

  return { ...listState, pageSize, page: 1 };
}

/**
 * Returns the next list state after a page navigation.
 * Navigation outside the valid range is ignored.
 *
 * @param {object} listState
 * @param {number} page
 * @param {number} pageCount
 * @returns {object}
 */
export function applyPage(listState, page, pageCount) {
  if (!Number.isInteger(page) || page < 1 || page > pageCount) {
    return { ...listState };
  }

  return { ...listState, page };
}
