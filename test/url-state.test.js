import test from "node:test";
import assert from "node:assert/strict";

import { stateFromUrl, stateToUrl } from "../src/url-state.js";

const DEFAULT_SLICE = {
  field: "name",
  operator: "include",
  query: "",
  page: 1,
  pageSize: 20,
  sortKey: "name",
  sortDirection: "asc",
  selectedHeroId: null,
};

test("empty parameters parse to the canonical default slice", () => {
  assert.deepEqual(stateFromUrl(new URLSearchParams()), DEFAULT_SLICE);
});

test("a plain string of parameters is accepted", () => {
  assert.deepEqual(stateFromUrl(""), DEFAULT_SLICE);
});

test("well-formed parameters parse to the matching state", () => {
  const params = new URLSearchParams(
    "field=strength&op=greater-than&q=90&page=3&size=50&sort=power&dir=desc&hero=70",
  );

  assert.deepEqual(stateFromUrl(params), {
    field: "strength",
    operator: "greater-than",
    query: "90",
    page: 3,
    pageSize: 50,
    sortKey: "power",
    sortDirection: "desc",
    selectedHeroId: 70,
  });
});

test("the all page size is preserved as a string", () => {
  assert.equal(stateFromUrl("size=all").pageSize, "all");
});

test("an unknown field falls back to name and normalizes its operator", () => {
  const state = stateFromUrl("field=nope&op=fuzzy");

  assert.equal(state.field, "name");
  assert.equal(state.operator, "fuzzy");
});

test("an operator invalid for its field falls back to the field default", () => {
  assert.equal(stateFromUrl("field=strength&op=fuzzy").operator, "equal");
  assert.equal(stateFromUrl("field=name&op=greater-than").operator, "include");
});

test("non-positive or non-integer pages fall back to page 1", () => {
  for (const raw of ["0", "-2", "2.5", "abc", ""]) {
    assert.equal(stateFromUrl(`page=${raw}`).page, 1);
  }
});

test("unsupported page sizes fall back to the default of 20", () => {
  for (const raw of ["7", "0", "twenty", ""]) {
    assert.equal(stateFromUrl(`size=${raw}`).pageSize, 20);
  }
});

test("unknown sort keys and bad directions fall back to defaults", () => {
  const state = stateFromUrl("sort=nope&dir=sideways");

  assert.equal(state.sortKey, "name");
  assert.equal(state.sortDirection, "asc");
});

test("icon is a valid sort key even though it is not searchable", () => {
  assert.equal(stateFromUrl("sort=icon").sortKey, "icon");
});

test("a malformed hero id resolves to no selection", () => {
  for (const raw of ["0", "-1", "abc", "1.5"]) {
    assert.equal(stateFromUrl(`hero=${raw}`).selectedHeroId, null);
  }
});

test("stateToUrl omits values that equal the defaults", () => {
  assert.equal(stateToUrl(DEFAULT_SLICE).toString(), "");
});

test("stateToUrl emits only the changed parameters", () => {
  const params = stateToUrl({
    ...DEFAULT_SLICE,
    field: "strength",
    operator: "greater-than",
    query: "90",
    page: 3,
  });

  assert.equal(params.get("field"), "strength");
  assert.equal(params.get("op"), "greater-than");
  assert.equal(params.get("q"), "90");
  assert.equal(params.get("page"), "3");
  assert.equal(params.has("size"), false);
  assert.equal(params.has("sort"), false);
});

test("stateToUrl omits an operator that is the field default", () => {
  const params = stateToUrl({ ...DEFAULT_SLICE, field: "strength", operator: "equal" });

  assert.equal(params.get("field"), "strength");
  assert.equal(params.has("op"), false);
});

test("stateToUrl preserves a selected hero id", () => {
  assert.equal(stateToUrl({ ...DEFAULT_SLICE, selectedHeroId: 70 }).get("hero"), "70");
});

test("stateFromUrl round-trips stateToUrl for the restorable slice", () => {
  const state = {
    field: "durability",
    operator: "less-than",
    query: "50",
    page: 4,
    pageSize: "all",
    sortKey: "combat",
    sortDirection: "desc",
    selectedHeroId: 42,
  };

  assert.deepEqual(stateFromUrl(stateToUrl(state)), state);
});
