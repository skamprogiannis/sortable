import test from "node:test";
import assert from "node:assert/strict";

import {
  defaultOperatorForField,
  isSearchableField,
  isValidOperator,
  operatorsForKind,
  searchableFields,
} from "../src/search-fields.js";

const columns = [
  { key: "icon", label: "Icon", kind: "image" },
  { key: "name", label: "Name", kind: "text" },
  { key: "strength", label: "Strength", kind: "number" },
];

test("text fields advertise include, exclude, and fuzzy", () => {
  assert.deepEqual(operatorsForKind("text"), ["include", "exclude", "fuzzy"]);
});

test("numeric fields advertise equal, not-equal, greater-than, and less-than", () => {
  assert.deepEqual(operatorsForKind("number"), [
    "equal",
    "not-equal",
    "greater-than",
    "less-than",
  ]);
});

test("image and unknown kinds advertise no operators", () => {
  assert.deepEqual(operatorsForKind("image"), []);
  assert.deepEqual(operatorsForKind("mystery"), []);
});

test("searchable fields include supported text and number columns", () => {
  const keys = searchableFields(columns).map((field) => field.key);

  assert.deepEqual(keys, ["name", "strength"]);
});

test("each searchable field carries its label, kind, and operators", () => {
  const [name, strength] = searchableFields(columns);

  assert.deepEqual(name, {
    key: "name",
    label: "Name",
    kind: "text",
    operators: ["include", "exclude", "fuzzy"],
  });
  assert.deepEqual(strength.operators, [
    "equal",
    "not-equal",
    "greater-than",
    "less-than",
  ]);
});

test("only text and numeric fields count as searchable", () => {
  assert.equal(isSearchableField("name", columns), true);
  assert.equal(isSearchableField("strength", columns), true);
  assert.equal(isSearchableField("icon", columns), false);
  assert.equal(isSearchableField("unknown", columns), false);
});

test("operators are valid only for their own field kind", () => {
  assert.equal(isValidOperator("name", "include", columns), true);
  assert.equal(isValidOperator("name", "greater-than", columns), false);
  assert.equal(isValidOperator("strength", "greater-than", columns), true);
  assert.equal(isValidOperator("strength", "fuzzy", columns), false);
  assert.equal(isValidOperator("icon", "include", columns), false);
});

test("each field reports its first operator as the default", () => {
  assert.equal(defaultOperatorForField("name", columns), "include");
  assert.equal(defaultOperatorForField("strength", columns), "equal");
  assert.equal(defaultOperatorForField("icon", columns), null);
});

test("the real descriptors make every visible column except Icon searchable", async () => {
  const { COLUMNS } = await import("../src/columns.js");

  const searchableKeys = searchableFields().map((field) => field.key);
  const nonIconKeys = COLUMNS.filter((column) => column.kind !== "image").map(
    (column) => column.key,
  );

  assert.deepEqual(searchableKeys, nonIconKeys);
  assert.equal(searchableKeys.includes("icon"), false);
});
