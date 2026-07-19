import test from "node:test";
import assert from "node:assert/strict";

import { getAriaSort, nextSortState, sortHeroes } from "../src/sorting.js";
import { columns, heroes } from "./fixtures/heroes.js";

test("a newly selected column starts ascending", () => {
  const currentSortState = { key: "name", direction: "asc" };

  assert.deepEqual(nextSortState(currentSortState, "weight"), {
    key: "weight",
    direction: "asc",
  });
});

test("selecting the active column toggles its direction", () => {
  const currentSortState = { key: "weight", direction: "asc" };

  assert.deepEqual(nextSortState(currentSortState, "weight"), {
    key: "weight",
    direction: "desc",
  });
});

test("sortHeroes sorts text case-insensitively without changing the source array", () => {
  const sourceNames = heroes.map((hero) => hero.name);

  const sortedHeroes = sortHeroes(heroes, { key: "name", direction: "asc" }, columns);

  assert.deepEqual(sortedHeroes.map((hero) => hero.name), ["Alpha", "Atlas", "beta", "Bravo", "zebra"]);
  assert.deepEqual(heroes.map((hero) => hero.name), sourceNames);
  assert.notStrictEqual(sortedHeroes, heroes);
});

test("sortHeroes compares numeric values and resolves equal values by Name ascending", () => {
  const sortedHeroes = sortHeroes(heroes, { key: "strength", direction: "asc" }, columns);

  assert.deepEqual(sortedHeroes.map((hero) => hero.name), [
    "zebra",
    "beta",
    "Alpha",
    "Atlas",
    "Bravo",
  ]);
});

test("sortHeroes keeps the Name ascending tie-breaker when sorting descending", () => {
  const sortedHeroes = sortHeroes(heroes, { key: "strength", direction: "desc" }, columns);

  assert.deepEqual(sortedHeroes.map((hero) => hero.name), [
    "Alpha",
    "Atlas",
    "beta",
    "zebra",
    "Bravo",
  ]);
});

test("sortHeroes keeps missing metric values last in either direction", () => {
  const ascending = sortHeroes(heroes, { key: "weight", direction: "asc" }, columns);
  const descending = sortHeroes(heroes, { key: "weight", direction: "desc" }, columns);

  assert.deepEqual(ascending.map((hero) => hero.name), ["zebra", "Alpha", "Atlas", "beta", "Bravo"]);
  assert.deepEqual(descending.map((hero) => hero.name), ["Alpha", "Atlas", "zebra", "beta", "Bravo"]);
});

test("sortHeroes parses metric height values numerically", () => {
  const sortedHeroes = sortHeroes(heroes, { key: "height", direction: "desc" }, columns);

  assert.deepEqual(sortedHeroes.map((hero) => hero.name), ["Atlas", "Alpha", "zebra", "beta", "Bravo"]);
});

test("sortHeroes sorts text descending while keeping missing values last", () => {
  const sortedHeroes = sortHeroes(heroes, { key: "placeOfBirth", direction: "desc" }, columns);

  assert.deepEqual(sortedHeroes.map((hero) => hero.name), ["zebra", "Alpha", "Atlas", "beta", "Bravo"]);
});

test("getAriaSort identifies the active direction and inactive headers", () => {
  const sortState = { key: "weight", direction: "desc" };

  assert.equal(getAriaSort(sortState, "weight"), "descending");
  assert.equal(getAriaSort(sortState, "name"), "none");
});
