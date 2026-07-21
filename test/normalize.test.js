import test from "node:test";
import assert from "node:assert/strict";

import { normalizeValue } from "../src/normalize.js";

const numberColumn = { key: "strength", kind: "number" };
const heightColumn = { key: "height", kind: "number" };
const weightColumn = { key: "weight", kind: "number" };
const textColumn = { key: "name", kind: "text" };

test("numeric values pass through as finite numbers", () => {
  assert.equal(normalizeValue(85, numberColumn), 85);
  assert.equal(normalizeValue("100", numberColumn), 100);
  assert.equal(normalizeValue("1,200", numberColumn), 1200);
});

test("weight in tons is normalized to kilograms", () => {
  assert.equal(normalizeValue("2 tons", weightColumn), 2000);
});

test("height in meters is normalized to centimetres", () => {
  assert.equal(normalizeValue("2 meters", heightColumn), 200);
});

test("missing markers normalize to null", () => {
  for (const missing of [null, undefined, "", "-", "0 cm"]) {
    assert.equal(normalizeValue(missing, heightColumn), null);
  }

  assert.equal(normalizeValue("0 kg", weightColumn), null);
});

test("unparseable numeric values become null, never zero", () => {
  assert.equal(normalizeValue("unknown", numberColumn), null);
});

test("text values are returned trimmed", () => {
  assert.equal(normalizeValue("  Batman  ", textColumn), "Batman");
});

test("a column missing predicate takes precedence", () => {
  const column = { key: "strength", kind: "number", isMissing: (value) => value === 0 };

  assert.equal(normalizeValue(0, column), null);
});
