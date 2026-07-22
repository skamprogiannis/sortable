import test from "node:test";
import assert from "node:assert/strict";

import { COLUMNS } from "../src/columns.js";
import { filterHeroes } from "../src/filtering.js";

const searchHeroes = [
  { id: 1, name: "Batman" },
  { id: 2, name: "Catwoman" },
  { id: 3, name: "Black Cat" },
  { id: 4, name: "Iron Man" },
  { id: 5, name: "Thor" },
];

test("entering Cat includes Catwoman", () => {
  const names = filterHeroes(searchHeroes, { query: "Cat" }).map((hero) => hero.name);

  assert.deepEqual(names, ["Catwoman", "Black Cat"]);
});

test("matching ignores case in both the query and the name", () => {
  const names = filterHeroes(searchHeroes, { query: "cAt" }).map((hero) => hero.name);

  assert.deepEqual(names, ["Catwoman", "Black Cat"]);
});

test("matches the query anywhere inside the name", () => {
  const names = filterHeroes(searchHeroes, { query: "man" }).map((hero) => hero.name);

  assert.deepEqual(names, ["Batman", "Catwoman", "Iron Man"]);
});

test("an empty query keeps every hero in a new array", () => {
  const result = filterHeroes(searchHeroes, { query: "" });

  assert.deepEqual(result, searchHeroes);
  assert.notStrictEqual(result, searchHeroes);
});

test("returns no rows when nothing matches", () => {
  assert.deepEqual(filterHeroes(searchHeroes, { query: "xyz" }), []);
});

test("skips heroes without a usable name instead of failing", () => {
  const heroes = [{ id: 99, name: null }, ...searchHeroes];

  const names = filterHeroes(heroes, { query: "cat" }).map((hero) => hero.name);

  assert.deepEqual(names, ["Catwoman", "Black Cat"]);
});

test("does not mutate the source array", () => {
  const sourceNames = searchHeroes.map((hero) => hero.name);

  filterHeroes(searchHeroes, { query: "cat" });

  assert.deepEqual(searchHeroes.map((hero) => hero.name), sourceNames);
});

const textColumns = [
  { key: "name", label: "Name", kind: "text", read: (hero) => hero.name },
];

test("the exclude operator keeps heroes that do not contain the query", () => {
  const names = filterHeroes(
    searchHeroes,
    { field: "name", operator: "exclude", query: "man" },
    textColumns,
  ).map((hero) => hero.name);

  assert.deepEqual(names, ["Black Cat", "Thor"]);
});

test("the fuzzy operator matches an ordered subsequence, not just a substring", () => {
  const names = filterHeroes(
    searchHeroes,
    { field: "name", operator: "fuzzy", query: "cn" },
    textColumns,
  ).map((hero) => hero.name);

  assert.deepEqual(names, ["Catwoman"]);
});

test("fuzzy matching ignores case in both directions", () => {
  const names = filterHeroes(
    searchHeroes,
    { field: "name", operator: "fuzzy", query: "BM" },
    textColumns,
  ).map((hero) => hero.name);

  assert.deepEqual(names, ["Batman"]);
});

test("an unknown search field keeps every hero", () => {
  const result = filterHeroes(
    searchHeroes,
    { field: "nope", operator: "include", query: "cat" },
    textColumns,
  );

  assert.deepEqual(result, searchHeroes);
  assert.notStrictEqual(result, searchHeroes);
});

test("unsupported field kinds keep every hero", () => {
  const heroes = [
    { name: "A", icon: "cat.png", mystery: "cat" },
    { name: "B", icon: "dog.png", mystery: "dog" },
  ];
  const columns = [
    { key: "icon", kind: "image", read: (hero) => hero.icon },
    { key: "mystery", kind: "mystery", read: (hero) => hero.mystery },
  ];

  for (const field of ["icon", "mystery"]) {
    const result = filterHeroes(
      heroes,
      { field, operator: "include", query: "cat" },
      columns,
    );

    assert.deepEqual(result, heroes);
    assert.notStrictEqual(result, heroes);
  }
});

test("advanced text search does not mutate the source array", () => {
  const sourceNames = searchHeroes.map((hero) => hero.name);

  filterHeroes(searchHeroes, { field: "name", operator: "exclude", query: "man" }, textColumns);

  assert.deepEqual(searchHeroes.map((hero) => hero.name), sourceNames);
});

const numericColumns = [
  { key: "strength", kind: "number", read: (hero) => hero.strength },
  { key: "weight", kind: "number", read: (hero) => hero.weight },
];

const numericHeroes = [
  { name: "A", strength: 100, weight: "2 tons" },
  { name: "B", strength: 50, weight: "80 kg" },
  { name: "C", strength: 90, weight: "-" },
  { name: "D", strength: null, weight: "0 kg" },
  { name: "E", strength: "-", weight: "120 kg" },
];

function numericSearch(field, operator, query) {
  return filterHeroes(numericHeroes, { field, operator, query }, numericColumns).map(
    (hero) => hero.name,
  );
}

test("greater-than keeps values above the threshold", () => {
  assert.deepEqual(numericSearch("strength", "greater-than", "80"), ["A", "C"]);
});

test("less-than keeps values below the threshold", () => {
  assert.deepEqual(numericSearch("strength", "less-than", "60"), ["B"]);
});

test("equal and not-equal compare against the exact value", () => {
  assert.deepEqual(numericSearch("strength", "equal", "90"), ["C"]);
  assert.deepEqual(numericSearch("strength", "not-equal", "100"), ["B", "C"]);
});

test("missing numeric values never satisfy any comparison", () => {
  assert.deepEqual(numericSearch("strength", "greater-than", "0"), ["A", "B", "C"]);
  assert.deepEqual(numericSearch("strength", "not-equal", "999"), ["A", "B", "C"]);
});

test("numeric filtering uses the shared normalization for unit variants", () => {
  assert.deepEqual(numericSearch("weight", "greater-than", "1000"), ["A"]);
});

test("a non-numeric query on a numeric field keeps every hero", () => {
  const result = filterHeroes(
    numericHeroes,
    { field: "strength", operator: "greater-than", query: "strong" },
    numericColumns,
  );

  assert.deepEqual(result, numericHeroes);
  assert.notStrictEqual(result, numericHeroes);
});

test("real descriptors read representative nested hero fields", () => {
  const heroes = [
    {
      name: "Match",
      biography: {
        fullName: "Bruce Wayne",
        placeOfBirth: "Gotham City",
        alignment: "good",
      },
      powerstats: { strength: 95 },
      appearance: {
        race: "Human",
        height: ["6'2", "188 cm"],
        weight: ["220 lb", "100 kg"],
      },
    },
    {
      name: "Other",
      biography: {
        fullName: "Clark Kent",
        placeOfBirth: "Krypton",
        alignment: "neutral",
      },
      powerstats: { strength: 80 },
      appearance: {
        race: "Kryptonian",
        height: ["6'3", "191 cm"],
        weight: ["235 lb", "107 kg"],
      },
    },
  ];
  const searches = [
    { field: "fullName", operator: "include", query: "bruce" },
    { field: "strength", operator: "greater-than", query: "90" },
    { field: "race", operator: "include", query: "human" },
    { field: "height", operator: "equal", query: "188" },
    { field: "weight", operator: "equal", query: "100" },
    { field: "placeOfBirth", operator: "include", query: "gotham" },
    { field: "alignment", operator: "include", query: "good" },
  ];

  for (const search of searches) {
    const names = filterHeroes(heroes, search, COLUMNS).map((hero) => hero.name);

    assert.deepEqual(names, ["Match"]);
  }
});
