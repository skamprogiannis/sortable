# Issue #3 — Table Sorting: TDD Plan

## Scope and boundaries

This issue owns pure sorting behaviour and sort-state transitions. It does not
fetch data, render table rows, paginate results, or mutate application state.

The module accepts hero records and column descriptors, then returns a new
sorted array. The application shell owns rendering and state updates.

## Completion checklist

- [x] Confirm the module location, native test runner, and import conventions
  with the team before adding production code.
- [x] Define the public contracts:
  - `sortHeroes(heroes, sortState, columns)` returns a sorted copy.
  - `nextSortState(currentSortState, columnKey)` starts a new column at
    ascending and toggles the active column.
  - Header consumers receive `aria-sort` values of `ascending`, `descending`,
    or `none`.
- [x] Create a small, deterministic hero fixture containing:
  - mixed case text values;
  - numeric powerstats;
  - metric height and weight values;
  - `null`, empty, `-`, `0 cm`, and `0 kg` missing-value cases;
  - duplicate values to verify the Name ascending tie-breaker.

## Write failing tests first

- [x] `nextSortState` keeps Name ascending as the initial state, starts an
  inactive column ascending, and toggles an active column on repeated use.
- [x] Text columns sort case-insensitively in ascending and descending order.
- [x] Sorting returns a new array and leaves the supplied hero array unchanged.
- [x] Equal values are ordered by Name ascending in either sort direction.
- [x] Every powerstat is compared numerically, rather than lexicographically.
- [x] Metric Height and Weight are compared numerically: `75 kg` precedes
  `100 kg` when ascending.
- [x] Invalid, zero, empty, dash, and null metric values are missing.
- [x] Missing values remain after all present values in both ascending and
  descending sorts.
- [x] Image/icon and remaining visible text columns use descriptor readers and
  follow the same text/missing-value rules.
- [x] The header accessibility helper exposes the expected `aria-sort` value.

## Implement in small increments

- [x] Add descriptor-driven raw-value reading so sorting is not tied to DOM
  markup or duplicated property paths.
- [x] Add missing-value detection before applying sort direction.
- [x] Add numeric normalization for powerstats, metric height, and metric
  weight; return a missing marker for non-finite/unusable values.
- [x] Add locale-aware, case-insensitive text comparison.
- [x] Apply sort direction only to present-value comparisons, then apply the
  Name ascending tie-breaker.
- [x] Keep all helpers side-effect free and document only non-obvious data
  rules.

## Verify and hand off

- [x] Run the complete test suite and ensure every test passes.
- [x] Manually inspect the test fixture results for Weight ascending, Place of
  Birth descending, repeated toggle behaviour, and missing values in both
  directions.
- [x] Confirm no shared formatting or lint configuration exists.
- [x] Commit only issue #3 implementation and tests; do not include
  `instructions.txt`.
- [x] Share the module API and `aria-sort` contract with the issue #1/#2 owners
  for integration.
- [x] After integration, verify all sorting entries in shared issue #7 in a
  browser.

## Definition of done

All Gitea issue #3 acceptance criteria pass through automated tests,
the module preserves its inputs, and the integration team can wire it into the
table without sorting logic in the renderer.
