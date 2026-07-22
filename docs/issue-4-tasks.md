# Issue #4 — Advanced Search and URL State: TDD Plan

## Scope and boundaries

This issue owns advanced search (fields beyond Name, with text and numeric
operators) and restorable URL state. It reuses the column descriptors, the
canonical state defaults, and the page-size list already frozen by issues #1
and #2; it does not fetch data, own the render loop, or re-implement the
comparator internals.

Numeric operators must compare the same normalized values sorting uses. That
normalization was extracted into `src/normalize.js` (exporting only
`normalizeValue`) with the owner's agreement, and both sorting and filtering
now depend on it. The `hero` URL parameter is owned by issue #5 and is
validated and round-tripped as `selectedHeroId`.

## Completion checklist

- [x] Define the searchable-field / operator model:
  - Text fields expose `include`, `exclude`, and `fuzzy`.
  - Numeric fields expose `equal`, `not-equal`, `greater-than`, and
    `less-than`.
  - Icon (image) is not searchable; every other visible field is.
- [x] Define the URL contracts:
  - `stateFromUrl(searchParams)` parses and validates `field`, `op`, `q`,
    `page`, `size`, `sort`, `dir`, and validates `hero` as `selectedHeroId`;
    malformed values fall back to the canonical defaults.
  - `stateToUrl(state)` serializes the restorable slice and omits values
    that equal the defaults for shareable URLs.
- [x] Extend `filterHeroes(heroes, { field, operator, query })` with text and
  numeric operators over the shared normalization.

## Write failing tests first

- [x] Text fields advertise exactly `include`, `exclude`, `fuzzy`.
- [x] Numeric fields advertise exactly `equal`, `not-equal`, `greater-than`,
  `less-than`.
- [x] Icon is excluded; the searchable set is every other visible column.
- [x] Field/operator validity accepts good pairs and rejects mismatches.
- [x] Each field reports a sensible default operator.
- [x] Empty parameters parse to the canonical default slice.
- [x] Well-formed parameters parse to the matching state.
- [x] Unknown field, mismatched operator, non-positive page, unsupported
  size, bad direction, and unknown sort key each fall back to a default.
- [x] A valid `hero` ID round-trips through parsing and serialization.
- [x] `stateToUrl` omits defaults and emits only changed parameters.
- [x] `stateFromUrl(stateToUrl(state))` round-trips the restorable slice.

## Implement in small increments

- [x] Searchable-field and operator model derived from descriptor `kind`.
- [x] URL parsing with per-parameter validation and default fallbacks.
- [x] URL serialization that omits defaults and emits `selectedHeroId` as
  `hero`.
- [x] Text-operator filtering (`include`, `exclude`, `fuzzy`).
- [x] Numeric-operator filtering on shared normalized values.
- [x] Field and operator controls that emit intent through callbacks.

## Verify and hand off

- [x] Run the complete test suite and ensure every test passes.
- [x] Confirm the History-API wiring plan with the application owner (#1)
  before editing the render loop.
- [x] Manually verify advanced search and a copied-URL restore in a served
  browser session with the official dataset.
- [x] Commit only issue #4 implementation and tests.
- [x] After integration, verify the advanced-search and URL entries in shared
  issue #7 in a browser.

## Definition of done

Every issue #4 acceptance criterion passes through automated tests or the
browser checks above, the modules preserve their inputs, and URL state
round-trips without display or fetch logic leaking into the data rules.
