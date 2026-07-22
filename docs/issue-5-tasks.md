# Issue #5 — Hero Details and Responsive Presentation: TDD Plan

## Goal

Allow a user to open one hero from the table, inspect the complete record in a
large, accessible detail view, and return to the unchanged list. The selected
hero must be restorable through `hero=<id>` in the existing URL state. The
table, controls, and details must remain usable on narrow and wide screens.

## Scope and existing contracts

This issue extends the integrated application; it does not replace its list
pipeline or URL implementation.

- `state.selectedHeroId` already represents the selected hero.
- `stateFromUrl()` and `stateToUrl()` already parse and serialize `hero`.
- `state.heroes` is the canonical fetched array and must be the only source
  used to find a selected hero.
- `createTableView()` receives rows that are already filtered, sorted, and
  paginated. It will report hero selection through a callback; it must not own
  application state or fetch data.
- `app.js` owns state replacement, rendering coordination, and URL syncing.
- `styles.css` is owned by this issue for the cohesive responsive presentation.

Use only native HTML, CSS, and JavaScript modules. Keep functions small and
direct enough for Piscine participants to read and explain. Do not add a
framework, test library, modal library, CSS library, or hidden global state.

## Implementation design

### Detail view

Create a `src/details.js` module with a small public view contract. It should
receive a hero (or no hero), render a semantic dialog-like detail view, and
report closing through an `onClose` callback.

The view must show:

- Name and the large `hero.images.lg` image.
- Biography fields.
- Appearance fields.
- Every powerstat.
- Work fields.
- Connections fields.
- A readable fallback for missing values and a fallback when the large image
  cannot load.

Use ordinary DOM methods (`document.createElement`, `textContent`,
`append`, and event listeners) as the rest of the project does. A definition
list or clearly labelled sections is preferred because it gives related data a
simple, semantic structure. Do not build HTML strings from hero data.

### Hero selection and URL state

Extend the table view with an explicit selection callback, for example
`onHeroSelect(hero, triggerElement)`. A row must be activatable by click,
Enter, and Space. Passing the trigger element lets the application restore
focus after the dialog closes.

`app.js` will:

1. Store the selected hero ID in a new state object.
2. Find the hero in `state.heroes`, without fetching again.
3. Render/open the details view.
4. Reuse `syncUrl()` so only the existing `hero` parameter changes.

Closing performs the inverse: clear `selectedHeroId`, render/close details,
sync the URL, and restore focus when the original row is still available.

On initial loading, a positive `hero` ID in the URL may still be unknown to the
dataset. Treat it as no selection, remove it during normal URL synchronization,
and keep the list fully usable.

### Responsive presentation

Keep the table semantic and preserve all required columns. At narrow widths,
the table container may scroll horizontally rather than hiding required data.
The dialog must fit the viewport, allow its content to scroll, and keep the
large image constrained to its container. Add visible keyboard focus styles
for interactive table rows, controls, and the close control.

Use a small number of CSS classes and media queries. Prefer flexible sizing,
spacing, and readable defaults over complex layout tricks.

## TDD sequence

The repository uses Node's native test runner. Add tests under `test/` before
the corresponding production code, run `npm test`, observe the failing test,
then implement the smallest clear change that makes it pass.

### Phase 1 — Selection state and URL safety

- [ ] Add failing tests for a small pure helper that finds a hero by a positive
  ID in the supplied hero array and returns no hero for unknown IDs.
- [ ] Add failing URL/state tests covering a selected ID and an unknown ID
  normalized after loaded heroes are available.
- [ ] Implement the smallest pure selection helper in a focused module.
- [ ] Keep `url-state.js` as the source of syntax validation; do not duplicate
  query-string parsing in the detail module.
- [ ] Run `npm test` until the new and existing tests pass.

Justification: selection and URL restoration have data rules that can be
tested without a browser. Keeping them pure makes the later DOM wiring simple
and prevents duplicate requests or hidden state.

### Phase 2 — Detail data preparation and rendering

- [ ] Add failing tests for pure detail-data helpers: missing-value display,
  section/value preparation, and selecting the large image source.
- [ ] Implement simple helpers and `src/details.js` with native DOM APIs.
- [ ] Render every required data group: biography, appearance, powerstats,
  work, and connections.
- [ ] Add a visible close button and large-image error fallback.
- [ ] Run `npm test` until green.

Justification: native Node tests cannot inspect browser DOM without introducing
an unnecessary library. We test the data decisions automatically and verify
the small DOM layer manually in a real browser.

### Phase 3 — Table activation and application wiring

- [ ] Add failing tests for any new pure state transition or selection helper.
- [ ] Extend `createTableView()` with the explicit selection callback.
- [ ] Make each row activate on pointer click, Enter, and Space without
  interfering with sortable header buttons.
- [ ] In `app.js`, open the selected hero from `state.heroes`, synchronize the
  URL, and restore URL-selected heroes after the first list render.
- [ ] Implement close, Escape, and focus restoration.
- [ ] Verify unknown IDs, missing data, and image errors do not break the list.
- [ ] Run `npm test` until green.

Justification: the table only reports events and the application owns state.
This follows the existing separation between renderers and the single app
render loop.

### Phase 4 — Responsive CSS and browser verification

- [ ] Add responsive styles for controls, table overflow, table-row focus,
  dialog layout, close control, large image, and detail sections.
- [ ] Test narrow and wide viewports manually using the real browser.
- [ ] Verify mouse, keyboard, Escape, and focus restoration.
- [ ] Verify a copied URL restores both list state and `hero=<id>`.
- [ ] Use Network tools to confirm opening, closing, and restoring details make
  no additional request for `all.json`.
- [ ] Run the complete test suite and record results for shared issue #7.

Justification: responsiveness, focus behavior, images, and network activity
are browser behaviours. Manual verification complements the focused native
unit tests without adding testing dependencies.

## Definition of done

- [ ] Every row can open its hero by pointer and keyboard.
- [ ] Details contain the full record and `images.lg` with robust fallbacks.
- [ ] The close control, Escape, and focus restoration work.
- [ ] Opening and closing modify only `hero` while preserving list URL state.
- [ ] Copied valid URLs restore the detail; unknown IDs fail safely.
- [ ] The interface remains usable at narrow and wide viewport sizes.
- [ ] `npm test` passes and browser checks demonstrate one dataset request.
- [ ] Only issue #5 files are committed; `instructions.txt` and `issues.md`
  remain uncommitted.
