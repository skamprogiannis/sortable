# Sortable Codebase Guide

This is the maintainer and audit briefing for Sortable. Read it with
[the architecture](architecture.md) for the original team contracts and
[the PRD](PRD.md) for the requirements being implemented.

## One-minute explanation

Sortable is a static, framework-free browser application for exploring the
Superhero API's complete dataset. On startup it fetches the remote JSON once,
keeps that array in memory, and derives the visible table from it:

```text
canonical heroes -> filter -> sort -> paginate -> render
```

The application has one owner for mutable state: [src/app.js](../src/app.js).
Every other feature module either:

- transforms data without changing it;
- returns a new state object; or
- renders DOM from inputs and reports user intent through a callback.

That separation is the central design decision. It makes the data behavior
testable with Node's built-in test runner and prevents the DOM, a renderer, or
the URL from becoming a competing source of truth.

## What happens when the page loads

1. [index.html](../index.html) supplies only the `#app` shell and an announced
   loading indicator, then loads [src/app.js](../src/app.js) as an ES module.
2. `initApp()` calls `loadHeroes()`, which fetches the fixed Superhero API URL,
   rejects non-OK responses, verifies that decoded JSON is an array, and
   freezes the top-level array.
3. On success, `app.js` combines the initial state, fetched heroes, and
   validated URL state. On failure it replaces the loading UI with a user-safe
   error message and logs the underlying error to the console.
4. `renderApp()` creates the controls, table, pager, and native `<dialog>`
   once. Their event listeners remain in place.
5. `renderList()` recomputes the entire derived view, updates those reusable
   views, renders the selected hero if any, and normalizes the URL with
   `history.replaceState`.

The application must be served over HTTP because browser module and fetch
behavior is not intended to run from a `file:` URL. There is no build step and
no npm dependency; `npm test` invokes Node directly.

## Team and historical ownership

The initial work was intentionally divided so the team could work in parallel.
Ownership explains the module boundaries, but later integration and hardening
commits cross them when necessary.

| Contributor | Original responsibility | Important results |
| --- | --- | --- |
| `skamprogiannis` | Foundation and integration | PRD, architecture, loader, column descriptors, app shell, state, pipeline integration, and final hardening. |
| `hmim` | List behavior | Table renderer, Name search, pagination and controls, then advanced search and URL state. |
| `dkolias` | Sorting and details | Comparator/state rules, then hero selection, accessible details dialog, and responsive presentation. |

The contribution history and the issue plans record the intended split:

- [Issue 2](issue-2-tasks.md): table, pagination, and search.
- [Issue 3](issue-3-tasks.md): sorting.
- [Issue 4](issue-4-tasks.md): advanced search and URL state.
- [Issue 5](issue-5-tasks.md): hero details and responsive presentation.
- [Issue 6](issue-6-tasks.md): hardening and verification evidence.

## Module map

| Module | Responsibility | Useful detail |
| --- | --- | --- |
| [app.js](../src/app.js) | Application composition and the only mutable `state` binding. | Owns the full render loop, URL synchronization, and selection lifecycle. |
| [state.js](../src/state.js) | Initial state and immutable transitions. | Search and page-size changes reset `page` to 1; invalid page operations are no-ops. |
| [data.js](../src/data.js) | Remote dataset loader. | Fetches the fixed endpoint once per page load and validates only the top-level array shape. |
| [columns.js](../src/columns.js) | Ordered table descriptor registry. | A descriptor's `key`, `kind`, and `read(hero)` function drive rendering, sorting, searching, and URL sort validation. |
| [filtering.js](../src/filtering.js) | Pure text and numeric filtering. | Uses the same normalization as sorting for numeric filters. |
| [search-fields.js](../src/search-fields.js) | Searchable-field and operator policy. | Icons are sortable but deliberately not searchable; text and numeric columns expose different operators. |
| [sorting.js](../src/sorting.js) | Pure sorting and sort transitions. | Makes a copy before sorting, keeps missing values last in both directions, and breaks ties by Name ascending. |
| [normalize.js](../src/normalize.js) | Shared comparison and missing-value rules. | Converts tons to kg and meters to cm before numeric comparison. |
| [pagination.js](../src/pagination.js) | Pure page slicing and metadata. | Clamps invalid pages and supports `10`, `20`, `50`, `100`, and `all`. |
| [table.js](../src/table.js) | Reusable semantic table view. | Renders supplied rows only; header buttons report sort keys and delegated body clicks report selection. |
| [controls.js](../src/controls.js) | Search, page-size, and pager views. | Controls emit intent through callbacks and are refreshed from state after every list render. |
| [details.js](../src/details.js) | Reusable native dialog view. | Renders all required record groups, handles image fallbacks, Escape, close, and focus restoration. |
| [hero-selection.js](../src/hero-selection.js) | Pure selected-ID lookup. | Invalid or unknown IDs resolve to no selected hero. |
| [url-state.js](../src/url-state.js) | URL parsing and serialization. | Validates each parameter independently and omits default values when serializing. |

## State, inputs, and outputs

`INITIAL_STATE` has these fields:

| Field | Default | Why it exists |
| --- | --- | --- |
| `status` | `loading` | Tracks loading, ready, and error lifecycle states. |
| `heroes` | empty frozen array | The canonical fetched records. |
| `field`, `operator`, `query` | `name`, `include`, empty string | The one active advanced-search clause. |
| `page`, `pageSize` | `1`, `20` | The visible result slice. |
| `sortKey`, `sortDirection` | `name`, `asc` | The active descriptor and direction. |
| `selectedHeroId` | `null` | The open detail dialog, if any. |

The restorable state uses these query parameters:

```text
field, op, q, page, size, sort, dir, hero
```

`stateFromUrl()` accepts only known field and sort keys, legal operators for
the selected field, valid page sizes, positive integer pages and hero IDs, and
`asc` or `desc`. Each bad parameter falls back independently, so a malformed
URL cannot make the list unusable. `stateToUrl()` serializes only values that
differ from defaults, keeping ordinary URLs clean.

An ID can be syntactically valid in the URL but absent from the fetched array.
After loading, `renderDetails()` detects this case, clears the selection, and
removes the stale `hero` parameter during normal synchronization.

## Data rules worth memorizing

These rules appear in both automated tests and the audit requirements.

### Filtering

- A blank query returns the canonical array unchanged. This is a deliberate
  no-op performance optimization; downstream sorting still returns a copy.
- Text matching is case-insensitive. `include` is substring matching,
  `exclude` inverts that match, and `fuzzy` checks whether the query is an
  ordered subsequence of the field value.
- Numeric operators are `equal`, `not-equal`, `greater-than`, and `less-than`.
  Non-numeric input performs no filtering rather than treating it as zero.
- Numeric missing values never match any numeric operator.
- Only one field/operator/query clause can be active. Multiple simultaneous
  filters are explicitly out of scope.

### Normalization and missing values

`normalizeValue()` is shared by sorting and numeric filtering so their meaning
cannot drift apart. It treats `null`, `undefined`, empty strings, `-`, `- lb`,
`0 cm`, and `0 kg` as missing. Numeric values must become finite numbers:

- powerstats are already numeric;
- height is read from `appearance.height[1]` and compared in centimeters;
- weight is read from `appearance.weight[1]` and compared in kilograms;
- values ending in `meters` are multiplied by 100;
- values ending in `tons` are multiplied by 1000;
- commas are removed before parsing.

The top-level heroes array is frozen, but hero objects are not deep-frozen.
The stronger guarantee is architectural: pure transforms do not write to
records, and sorting operates on a copied array. New code should preserve that
convention and avoid mutating individual hero objects.

### Sorting

- Clicking a new column starts ascending; clicking the active column toggles
  its direction.
- `number` descriptors sort numerically. `text` and `image` descriptors sort
  case-insensitively using `localeCompare`.
- Present values always precede missing values, even for descending sorts.
  Direction applies only when both values are present.
- Equal values, including equal missing values, use Name ascending as the
  deterministic tie-breaker. That tie-breaker never reverses for descending
  sorts.
- The table exposes `aria-sort` only on the active header; its value is
  `ascending` or `descending`.

### Pagination

Pagination returns `{ rows, page, pageCount, totalCount }`. The visible page
is one-based, invalid or too-small pages become 1, and pages beyond the last
become the last page. Empty results remain a valid single-page view. Choosing
`all` makes one page that contains every result.

## UI and accessibility behavior

- The table is semantic: header cells contain real buttons, all required
  columns remain present, and a no-results row spans every column.
- List row updates use `replaceChildren`; the view does not accumulate event
  handlers. Selection is handled with one delegated listener and a `WeakMap`
  that associates rendered rows with heroes.
- A Name cell is a button that opens the hero detail dialog. Clicking another
  cell in the same row also opens it through delegated row selection. Keyboard
  operation is supplied by the actual Name button.
- Small icon images are lazy-loaded and fall back to readable text on absent
  or broken sources. Missing values render as `Not available` rather than
  leaking API placeholders.
- The native `<dialog>` uses `showModal()`. A visible close control and the
  dialog's `cancel` event both clear selection. Closing restores focus to the
  trigger when that trigger still exists.
- The detail view renders Biography, Appearance, Powerstats, Work, and
  Connections using definition lists. It uses `images.lg` and handles missing
  or broken large images.
- The narrow-screen strategy keeps the full semantic table and lets the app
  contain horizontal overflow. The dialog itself is constrained to the
  viewport and scrolls internally.

## Common audit and maintainer questions

### Why is `app.js` the only place with application state?

It prevents hidden state and makes rendering predictable. A renderer can only
draw the state-derived input it receives and report events through callbacks;
it cannot silently modify filtering, sorting, page, or selection behavior.

### Why is the operation filter, then sort, then paginate?

Users expect search results to be sorted globally before page slicing. Sorting
only the current page would yield incorrect order across pages, while
paginating before filtering would yield sparse or empty pages.

### Why do missing values stay last when descending?

Missingness is a separate ordering rule, not a value that is reversed with the
sort direction. The comparison detects it before multiplying a present-value
comparison by the direction.

### Why share normalization between filtering and sorting?

Without it, for example, `Weight > 1000` could use a different interpretation
of `2 tons` than the Weight sort. One shared converter makes the behavior
consistent and directly testable.

### Does opening details refetch the dataset?

No. Selection uses `findHeroById(state.heroes, selectedHeroId)` against the
already-fetched canonical array. The same is true for filtering, sorting, and
pagination.

### Why use `replaceState`, not `pushState`?

Search updates on every input event. Replacing the current URL keeps it
shareable without making the Back button step through every keystroke.

### What behavior is intentionally not supported?

There is no server, persistence, authentication, editing, deletion, framework,
third-party UI library, or multiple advanced-filter clauses. The application
is an audit-focused read-only browser UI.

## Safe change guide

| Change | Update together | Main risk |
| --- | --- | --- |
| Add or change a visible column | `columns.js`, tests, possibly URL/search policy and table documentation | Forgetting that descriptors are shared by rendering, sorting, search, and URL validation. |
| Change numeric or missing semantics | `normalize.js`, filtering and sorting tests | Filtering and sorting disagreeing on a value. |
| Add a restorable control | `state.js`, `url-state.js`, `app.js`, its renderer, round-trip tests | Introducing a second state source or accepting malformed URLs. |
| Change list interaction | `app.js` plus the relevant view callback contract | Putting data rules into a DOM renderer or registering duplicate listeners. |
| Change details behavior | `details.js`, selection state, URL behavior, browser checks | Losing focus restoration or triggering an extra fetch. |

Prefer a pure helper and a focused native test whenever a change has data
semantics. Keep browser-only behavior such as native dialog behavior, image
failure, keyboard interaction, responsive layout, and network requests in the
manual verification checklist.

## Verification and local workflow

```bash
# Serve the static ES-module application.
python3 -m http.server 8000

# Run all pure-behavior tests.
npm test

# Check JavaScript parsing without running the browser.
find src test -name '*.js' -exec node --check {} +
```

The current suite contains 86 named tests in nine test files. It covers pure
filtering, sorting, normalization, pagination, URL state, list state, search
field policy, detail-data preparation, and selected-ID lookup. It does not
use a browser DOM library by design.

Browser verification still matters for the composition the unit tests cannot
exercise: one dataset request, loading and error states, DOM semantics,
keyboard and focus behavior, image fallbacks, URL behavior in a real page, and
responsive layout. [Issue 6](issue-6-tasks.md) records the completed browser
and performance evidence for the integrated version.
