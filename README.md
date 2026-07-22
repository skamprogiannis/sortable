# Sortable

A framework-free browser application for searching, sorting, and paginating
the superhero dataset.

## Run locally

The application must be served over HTTP. Run either command from the
repository root.

### Node.js

```bash
npx serve . --listen 8000
```

`npx` may download `serve` into the npm cache on first use.

### Python

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

Stop the server with `Ctrl+C`.

## Test

Run the native JavaScript test suite from the repository root:

```bash
npm test
```

No dependency installation or build step is required.

## Verify

Check that the local server returns the application:

```bash
curl --fail --head http://localhost:8000/
```

Then verify in the browser:

1. The loading indicator appears and resolves successfully.
2. The pager reports `Page 1 of 29 (563 heroes)`.
3. DevTools Network shows exactly one request to `all.json`.
4. Blocking the `all.json` request and reloading displays a clear error.
5. The detailed failure remains available in the browser console.
6. Searching Name for `Cat` includes Catwoman and resets the view to page 1.
7. Advanced text operators and numeric comparisons filter the selected field.
   Enter metric Height and Weight thresholds as centimetres and kilograms,
   such as Weight greater than `1000`.
8. Search, page size, page, sort key, and sort direction update the URL without
   reloading the page.
9. Opening a copied URL in a new tab restores the same controls and rows;
   malformed parameters fall back to defaults.

## Documentation

- [Product requirements](docs/PRD.md)
- [Architecture](docs/architecture.md)
- [Issue #2 implementation plan](docs/issue-2-tasks.md)
- [Issue #3 sorting plan](docs/issue-3-tasks.md)
- [Issue #4 advanced-search plan](docs/issue-4-tasks.md)
