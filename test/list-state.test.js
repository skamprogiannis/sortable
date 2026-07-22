import test from "node:test";
import assert from "node:assert/strict";

import {
  applyHeroSelection,
  applyPage,
  applyPageSize,
  applySearch,
} from "../src/state.js";

const listState = Object.freeze({ query: "", page: 4, pageSize: 20 });
const searchState = Object.freeze({
  ...listState,
  field: "name",
  operator: "include",
});

test("searching stores its field, operator, and query and returns to page 1", () => {
  assert.deepEqual(
    applySearch(searchState, {
      field: "strength",
      operator: "greater-than",
      query: "90",
    }),
    {
      query: "90",
      page: 1,
      pageSize: 20,
      field: "strength",
      operator: "greater-than",
    },
  );
});

test("searching preserves unrelated state", () => {
  assert.deepEqual(
    applySearch(
      { ...searchState, sortKey: "weight" },
      { field: "name", operator: "fuzzy", query: "btmn" },
    ),
    {
      query: "btmn",
      page: 1,
      pageSize: 20,
      field: "name",
      operator: "fuzzy",
      sortKey: "weight",
    },
  );
});

test("changing the page size returns to the first page", () => {
  assert.deepEqual(applyPageSize(listState, 50), {
    query: "",
    page: 1,
    pageSize: 50,
  });
});

test("unsupported page sizes leave the state unchanged", () => {
  for (const pageSize of [7, "20", 0, null]) {
    assert.deepEqual(applyPageSize(listState, pageSize), listState);
  }
});

test("navigating to a valid page stores it", () => {
  assert.deepEqual(applyPage(listState, 5, 10), {
    query: "",
    page: 5,
    pageSize: 20,
  });
});

test("navigation outside the valid range is ignored", () => {
  for (const page of [0, 11, 2.5, Number.NaN]) {
    assert.deepEqual(applyPage(listState, page, 10), listState);
  }
});

test("transitions return new state objects", () => {
  assert.notStrictEqual(
    applySearch(searchState, {
      field: "name",
      operator: "include",
      query: "",
    }),
    searchState,
  );
  assert.notStrictEqual(applyPageSize(listState, 7), listState);
  assert.notStrictEqual(applyPage(listState, 99, 10), listState);
});

test("selecting or clearing a hero preserves the list state", () => {
  const state = {
    ...searchState,
    page: 3,
    sortKey: "weight",
    sortDirection: "desc",
    selectedHeroId: null,
  };

  assert.deepEqual(applyHeroSelection(state, 42), {
    ...state,
    selectedHeroId: 42,
  });
  assert.deepEqual(applyHeroSelection(state, null), state);
  assert.notStrictEqual(applyHeroSelection(state, 42), state);
});
