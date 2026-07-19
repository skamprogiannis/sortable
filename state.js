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
