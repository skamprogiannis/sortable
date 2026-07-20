import test from "node:test";
import assert from "node:assert/strict";

import { getAriaSort, nextSortState, sortHeroes } from "../src/sorting.js";

const columns = [
  { key: "name", kind: "text", read: (hero) => hero.name },
  { key: "strength", kind: "number", read: (hero) => hero.powerstats.strength },
  { key: "height", kind: "number", read: (hero) => hero.appearance.height[1] },
  { key: "weight", kind: "number", read: (hero) => hero.appearance.weight[1] },
  { key: "placeOfBirth", kind: "text", read: (hero) => hero.biography.placeOfBirth },
];

const heroes = [
  {
    id: 1,
    name: "zebra",
    powerstats: { strength: 9 },
    appearance: { height: ["5'9", "175 cm"], weight: ["165 lb", "75 kg"] },
    biography: { placeOfBirth: "Zurich" },
  },
  {
    id: 2,
    name: "Alpha",
    powerstats: { strength: 100 },
    appearance: { height: ["6'0", "183 cm"], weight: ["220 lb", "100 kg"] },
    biography: { placeOfBirth: "Athens" },
  },
  {
    id: 3,
    name: "beta",
    powerstats: { strength: 11 },
    appearance: { height: ["-", "0 cm"], weight: ["-", "0 kg"] },
    biography: { placeOfBirth: "-" },
  },
  {
    id: 4,
    name: "Bravo",
    powerstats: { strength: null },
    appearance: { height: ["-", ""], weight: ["-", null] },
    biography: { placeOfBirth: null },
  },
  {
    id: 5,
    name: "Atlas",
    powerstats: { strength: 100 },
    appearance: { height: ["6'2", "188 cm"], weight: ["220 lb", "100 kg"] },
    biography: { placeOfBirth: "Athens" },
  },
];

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

test("sortHeroes converts metric tons to kilograms", () => {
  const weightedHeroes = [
    { name: "Two Tons", appearance: { weight: ["", "2 tons"] } },
    { name: "Fourteen Kilograms", appearance: { weight: ["", "14 kg"] } },
    { name: "Nine Thousand Tons", appearance: { weight: ["", "9,000 tons"] } },
    { name: "One Hundred Kilograms", appearance: { weight: ["", "100 kg"] } },
  ];

  const sortedHeroes = sortHeroes(weightedHeroes, { key: "weight", direction: "asc" }, columns);

  assert.deepEqual(sortedHeroes.map((hero) => hero.name), [
    "Fourteen Kilograms",
    "One Hundred Kilograms",
    "Two Tons",
    "Nine Thousand Tons",
  ]);
});

test("sortHeroes parses metric height values numerically", () => {
  const sortedHeroes = sortHeroes(heroes, { key: "height", direction: "desc" }, columns);

  assert.deepEqual(sortedHeroes.map((hero) => hero.name), ["Atlas", "Alpha", "zebra", "beta", "Bravo"]);
});

test("sortHeroes converts metric meters to centimetres", () => {
  const measuredHeroes = [
    { name: "Thirty Metres", appearance: { height: ["", "30.5 meters"] } },
    { name: "Nine Hundred Centimetres", appearance: { height: ["", "975 cm"] } },
  ];

  const sortedHeroes = sortHeroes(measuredHeroes, { key: "height", direction: "asc" }, columns);

  assert.deepEqual(sortedHeroes.map((hero) => hero.name), [
    "Nine Hundred Centimetres",
    "Thirty Metres",
  ]);
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
