import test from "node:test";
import assert from "node:assert/strict";

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

test("advanced text search does not mutate the source array", () => {
  const sourceNames = searchHeroes.map((hero) => hero.name);

  filterHeroes(searchHeroes, { field: "name", operator: "exclude", query: "man" }, textColumns);

  assert.deepEqual(searchHeroes.map((hero) => hero.name), sourceNames);
});
