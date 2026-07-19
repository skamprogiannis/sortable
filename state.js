/**
 * @typedef {object} AppState
 * @property {"loading"|"ready"|"error"} status
 * @property {object[]} heroes
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
  heroes: [],
  field: "name",
  operator: "include",
  query: "",
  page: 1,
  pageSize: 20,
  sortKey: "name",
  sortDirection: "asc",
  selectedHeroId: null,
});

export { INITIAL_STATE };
