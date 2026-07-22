import test from "node:test";
import assert from "node:assert/strict";

import { findHeroById } from "../src/hero-selection.js";

const heroes = Object.freeze([
  { id: 7, name: "Alpha" },
  { id: 42, name: "Bravo" },
]);

test("findHeroById returns the hero with the selected ID", () => {
  assert.equal(findHeroById(heroes, 42), heroes[1]);
});

test("findHeroById returns null for an unknown or invalid selection", () => {
  for (const selectedHeroId of [null, undefined, 0, -1, 7.5, "42", 99]) {
    assert.equal(findHeroById(heroes, selectedHeroId), null);
  }
});

test("findHeroById does not change the canonical hero array", () => {
  const source = [...heroes];

  findHeroById(heroes, 7);

  assert.deepEqual(heroes, source);
});
