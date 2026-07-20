import test from "node:test";
import assert from "node:assert/strict";

import { applyPage, applyPageSize, applySearch } from "../state.js";

const listState = Object.freeze({ query: "", page: 4, pageSize: 20 });

test("searching stores the query and returns to the first page", () => {
  assert.deepEqual(applySearch(listState, "cat"), {
    query: "cat",
    page: 1,
    pageSize: 20,
  });
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
  assert.notStrictEqual(applySearch(listState, ""), listState);
  assert.notStrictEqual(applyPageSize(listState, 7), listState);
  assert.notStrictEqual(applyPage(listState, 99, 10), listState);
});
