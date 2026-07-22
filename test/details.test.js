import test from "node:test";
import assert from "node:assert/strict";

import {
  formatDetailValue,
  getDetailSections,
  getLargeImageSource,
} from "../src/details.js";

const hero = {
  id: 7,
  name: "Alpha",
  images: { lg: "https://example.com/alpha-large.jpg" },
  biography: { fullName: "Alpha Hero", aliases: ["A", "First"], publisher: "Example" },
  appearance: { gender: "Male", race: null },
  powerstats: { intelligence: 80, strength: 0 },
  work: { occupation: "Hero" },
  connections: { relatives: "None" },
};

test("formatDetailValue displays readable values and missing-value fallbacks", () => {
  assert.equal(formatDetailValue("Alpha"), "Alpha");
  assert.equal(formatDetailValue(["A", "First"]), "A, First");
  assert.equal(formatDetailValue(0), "0");

  for (const value of [null, undefined, "", "   ", "-"]) {
    assert.equal(formatDetailValue(value), "Not available");
  }
});

test("getLargeImageSource returns a usable large image URL or null", () => {
  assert.equal(getLargeImageSource(hero), "https://example.com/alpha-large.jpg");
  assert.equal(getLargeImageSource({ images: { lg: "" } }), null);
  assert.equal(getLargeImageSource({}), null);
});

test("getDetailSections prepares every required hero data group", () => {
  assert.deepEqual(getDetailSections(hero), [
    {
      title: "Biography",
      entries: [
        ["Full Name", "Alpha Hero"],
        ["Aliases", "A, First"],
        ["Publisher", "Example"],
      ],
    },
    {
      title: "Appearance",
      entries: [
        ["Gender", "Male"],
        ["Race", "Not available"],
      ],
    },
    {
      title: "Powerstats",
      entries: [
        ["Intelligence", "80"],
        ["Strength", "0"],
      ],
    },
    { title: "Work", entries: [["Occupation", "Hero"]] },
    { title: "Connections", entries: [["Relatives", "None"]] },
  ]);
});
