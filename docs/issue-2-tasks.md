# Issue #2 — Table, Pagination, and Name Search: TDD Plan

## Scope and boundaries

This issue owns the table renderer, the core Name filter, pagination, the
search/page-size/pager controls, and the empty state. It does not fetch data,
own global application state, or implement comparator rules.

The modules accept hero records, column descriptors, and list state, then
return DOM views or new arrays. The application shell owns integration and the
only full-page render loop.

## Completion checklist

- [x] Reuse the module location (`src/`) and native test runner
  (`node --test test/*.test.js`) established by issue #3.
- [x] Define the public contracts:
  - `filterHeroes(heroes, { query })` returns matching heroes without
    mutating the source.
  - `paginateHeroes(heroes, { page, pageSize })` returns
    `{ rows, page, pageCount, totalCount }`.
  - `applySearch`, `applyPageSize`, and `applyPage` return the next list
    state and enforce the reset-to-page-1 and valid-navigation rules.
  - `createTableView({ columns, onSort })` renders rows it is given and
    reports heading activations; it never sorts.
  - `createSearchControl`, `createPageSizeControl`, and
    `createPagerControl` emit user intent through callbacks only.
- [x] Define deterministic search and pagination data alongside the tests
  that consume it.

## Write failing tests first

- [x] `Cat` includes Catwoman; matching ignores case in query and name.
- [x] The query matches anywhere inside the name.
- [x] An empty query keeps every hero and returns a new array.
- [x] No matches produce an empty result, not an error.
- [x] Heroes without a usable name are skipped safely.
- [x] Page metadata, last-page remainders, and the `all` size are correct.
- [x] Out-of-range and invalid page numbers resolve to valid pages.
- [x] Unsupported page sizes fall back to the default of 20.
- [x] Empty results stay on a valid single page.
- [x] Searching and page-size changes reset the page to 1.
- [x] Invalid navigation and unsupported sizes leave state unchanged.
- [x] Filtering and pagination never mutate the source array.

## Implement in small increments

- [x] Case-insensitive Name filtering over the canonical records.
- [x] Pagination with clamped pages and page-size fallback.
- [x] Pure list-state transitions for the controls to dispatch.
- [x] Semantic `<table>` with descriptor-driven headers and cells,
  `aria-sort` output, keyboard-activatable heading buttons, `.images.xs`
  icons with hero-name alt text, lazy image loading, and an empty state.
- [x] Search, page-size, and pager controls with accessible labels and
  disabled states at range edges.

## Verify and hand off

- [x] Run the complete test suite and ensure every test passes.
- [x] Manually verify search, every page size, page navigation, and the
  empty state in a served browser session with the official dataset.
- [x] Commit only issue #2 implementation and tests.
- [x] Share the module APIs with the issue #1 owner for integration and
  confirm the `aria-sort` values match the issue #3 contract.
- [x] After integration, verify the table, pagination, and search entries
  in shared issue #7 in a browser.

## Definition of done

All issue #2 acceptance criteria pass through automated tests or the browser
checks above, the modules preserve their inputs, and the integration team can
wire them into the shell without display logic leaking into data rules.
