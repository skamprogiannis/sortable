# Issue #3 — Table Sorting: TDD Plan

## Scope and boundaries

This issue owns pure sorting behaviour and sort-state transitions. It does not
fetch data, render table rows, paginate results, or mutate application state.

The module will accept hero records and column descriptors, then return a new
sorted array. The application shell will later own rendering and state updates.

## Completion checklist

- [ ] Confirm the module location, native test runner, and import conventions
  with the team before adding production code.
- [ ] Define the public contracts:
  - `sortHeroes(heroes, sortState, columns)` returns a sorted copy.
  - `nextSortState(currentSortState, columnKey)` starts a new column at
    ascending and toggles the active column.
  - Header consumers receive `aria-sort` values of `ascending`, `descending`,
    or `none`.
- [ ] Create a small, deterministic hero fixture containing:
  - mixed case text values;
  - numeric powerstats;
  - metric height and weight values;
  - `null`, empty, `-`, `0 cm`, and `0 kg` missing-value cases;
  - duplicate values to verify the Name ascending tie-breaker.

## Write failing tests first

- [ ] `nextSortState` keeps Name ascending as the initial state, starts an
  inactive column ascending, and toggles an active column on repeated use.
- [ ] Text columns sort case-insensitively in ascending and descending order.
- [ ] Sorting returns a new array and leaves the supplied hero array unchanged.
- [ ] Equal values are ordered by Name ascending in either sort direction.
- [ ] Every powerstat is compared numerically, rather than lexicographically.
- [ ] Metric Height and Weight are compared numerically: `75 kg` precedes
  `100 kg` when ascending.
- [ ] Invalid, zero, empty, dash, and null metric values are missing.
- [ ] Missing values remain after all present values in both ascending and
  descending sorts.
- [ ] Image/icon and remaining visible text columns use descriptor readers and
  follow the same text/missing-value rules.
- [ ] The header accessibility helper exposes the expected `aria-sort` value.

## Implement in small increments

- [ ] Add descriptor-driven raw-value reading so sorting is not tied to DOM
  markup or duplicated property paths.
- [ ] Add missing-value detection before applying sort direction.
- [ ] Add numeric normalization for powerstats, metric height, and metric
  weight; return a missing marker for non-finite/unusable values.
- [ ] Add locale-aware, case-insensitive text comparison.
- [ ] Apply sort direction only to present-value comparisons, then apply the
  Name ascending tie-breaker.
- [ ] Keep all helpers side-effect free and document only non-obvious data
  rules.

## Verify and hand off

- [ ] Run the complete test suite and ensure every test passes.
- [ ] Manually inspect the test fixture results for Weight ascending, Place of
  Birth descending, repeated toggle behaviour, and missing values in both
  directions.
- [ ] Check formatting/linting if the shared project configuration includes it.
- [ ] Commit only issue #3 implementation and tests; do not include
  `instructions.txt`.
- [ ] Share the module API and `aria-sort` contract with the issue #1/#2 owners
  for integration.
- [ ] After integration, verify all sorting entries in shared issue #7 in a
  browser.

## Definition of done

All issue #3 acceptance criteria in `issues.md` pass through automated tests,
the module preserves its inputs, and the integration team can wire it into the
table without sorting logic in the renderer.
