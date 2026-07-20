import test from "node:test";
import assert from "node:assert/strict";

import { paginateHeroes } from "../src/pagination.js";

const pagedHeroes = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  name: `Hero ${String(index + 1).padStart(2, "0")}`,
}));

test("returns the requested page with metadata", () => {
  const view = paginateHeroes(pagedHeroes, { page: 2, pageSize: 10 });

  assert.equal(view.page, 2);
  assert.equal(view.pageCount, 3);
  assert.equal(view.totalCount, 25);
  assert.deepEqual(
    view.rows.map((hero) => hero.name),
    pagedHeroes.slice(10, 20).map((hero) => hero.name),
  );
});

test("the last page keeps only the remaining rows", () => {
  const view = paginateHeroes(pagedHeroes, { page: 3, pageSize: 10 });

  assert.equal(view.rows.length, 5);
  assert.equal(view.rows[4].name, "Hero 25");
});

test("'all' shows every row on a single page", () => {
  const view = paginateHeroes(pagedHeroes, { page: 1, pageSize: "all" });

  assert.equal(view.rows.length, 25);
  assert.equal(view.pageCount, 1);
});

test("pages beyond the last resolve to the last page", () => {
  const view = paginateHeroes(pagedHeroes, { page: 99, pageSize: 10 });

  assert.equal(view.page, 3);
  assert.equal(view.rows[0].name, "Hero 21");
});

test("invalid page numbers resolve to the first page", () => {
  for (const page of [0, -3, 1.5, Number.NaN, undefined]) {
    const view = paginateHeroes(pagedHeroes, { page, pageSize: 10 });

    assert.equal(view.page, 1);
    assert.equal(view.rows[0].name, "Hero 01");
  }
});

test("unsupported page sizes fall back to the default of 20", () => {
  const view = paginateHeroes(pagedHeroes, { page: 1, pageSize: 7 });

  assert.equal(view.rows.length, 20);
  assert.equal(view.pageCount, 2);
});

test("empty results stay on a valid single page", () => {
  const view = paginateHeroes([], { page: 4, pageSize: 20 });

  assert.deepEqual(view, { rows: [], page: 1, pageCount: 1, totalCount: 0 });
});

test("does not mutate the source array", () => {
  const sourceNames = pagedHeroes.map((hero) => hero.name);

  paginateHeroes(pagedHeroes, { page: 2, pageSize: 10 });

  assert.deepEqual(pagedHeroes.map((hero) => hero.name), sourceNames);
});
