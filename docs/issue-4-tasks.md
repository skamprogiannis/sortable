# Issue #4 — Advanced Search and URL State: TDD Plan

## Scope and boundaries

This issue owns advanced search (fields beyond Name, with text and numeric
operators) and restorable URL state. It reuses the column descriptors, the
canonical state defaults, and the page-size list already frozen by issues #1
and #2; it does not fetch data, own the render loop, or re-implement the
comparator internals.

Numeric operators must compare the same normalized values sorting uses. That
normalization lives in issue #3's `sorting.js`; the shared extraction is being
coordinated with the owner before any cross-file edit. Until it lands, the
numeric-filter increment is deferred. The `hero` URL parameter is owned by
issue #5 and is preserved untouched.

## Completion checklist

- [ ] Define the searchable-field / operator model:
  - Text fields expose `include`, `exclude`, and `fuzzy`.
  - Numeric fields expose `equal`, `not-equal`, `greater-than`, and
    `less-than`.
  - Icon (image) is not searchable; every other visible field is.
- [ ] Define the URL contracts:
  - `stateFromUrl(searchParams)` parses and validates `field`, `op`, `q`,
    `page`, `size`, `sort`, `dir`, and preserves `hero`; malformed values
    fall back to the canonical defaults.
  - `stateToUrl(state)` serializes the restorable slice and omits values
    that equal the defaults for shareable URLs.
- [ ] Extend `filterHeroes(heroes, { field, operator, query })` with text
  operators now and numeric operators once shared normalization lands.

## Write failing tests first

- [ ] Text fields advertise exactly `include`, `exclude`, `fuzzy`.
- [ ] Numeric fields advertise exactly `equal`, `not-equal`, `greater-than`,
  `less-than`.
- [ ] Icon is excluded; the searchable set is every other visible column.
- [ ] Field/operator validity accepts good pairs and rejects mismatches.
- [ ] Each field reports a sensible default operator.
- [ ] Empty parameters parse to the canonical default slice.
- [ ] Well-formed parameters parse to the matching state.
- [ ] Unknown field, mismatched operator, non-positive page, unsupported
  size, bad direction, and unknown sort key each fall back to a default.
- [ ] A valid `hero` id survives parsing and serialization untouched.
- [ ] `stateToUrl` omits defaults and emits only changed parameters.
- [ ] `stateFromUrl(stateToUrl(state))` round-trips the restorable slice.

## Implement in small increments

- [ ] Searchable-field and operator model derived from descriptor `kind`.
- [ ] URL parsing with per-parameter validation and default fallbacks.
- [ ] URL serialization that omits defaults and preserves `hero`.
- [ ] Text-operator filtering (`include`, `exclude`, `fuzzy`).
- [ ] Numeric-operator filtering on shared normalized values (after #3
  coordination).
- [ ] Field and operator controls that emit intent through callbacks.

## Verify and hand off

- [ ] Run the complete test suite and ensure every test passes.
- [ ] Confirm the History-API wiring plan with the application owner (#1)
  before editing the render loop.
- [ ] Manually verify advanced search and a copied-URL restore in a served
  browser session with the official dataset.
- [ ] Commit only issue #4 implementation and tests.
- [ ] After integration, verify the advanced-search and URL entries in shared
  issue #7 in a browser.

## Definition of done

Every issue #4 acceptance criterion passes through automated tests or the
browser checks above, the modules preserve their inputs, and URL state round
-trips without display or fetch logic leaking into the data rules.
