# Sortable Product Requirements Document

- **Status:** Approved for implementation
- **Team:** `skamprog`, `hmim`, `dkolias`
- **Core audit deadline:** 21 July 2026, 23:59 Europe/Athens
- **Bonus and final audit deadline:** 23 July 2026, 23:59 Europe/Athens

## Problem Statement

Auditors need a fast browser interface for exploring the supplied superhero dataset. The raw JSON is too large and detailed to inspect directly, and it does not provide pagination, interactive search, numerical sorting, or a concise overview of the fields required by the Sortable audit.

## Solution

Build a static, framework-free web application that fetches the official dataset once and presents it in an interactive table. Users can page, search, and sort the data entirely in the browser. Bonus functionality adds field-aware operators, restorable URL state, a full hero detail view, and a polished responsive interface.

## Goals

- Pass every functional question in the official Sortable audit.
- Track and attempt every bonus audit question before automatic submission.
- Keep the application responsive with all 563 supplied records.
- Let the three core implementation issues proceed in parallel through stable module contracts.
- Keep the implementation understandable with native HTML, CSS, and JavaScript only.

## Success Criteria

- Every mandatory question in the official audit passes in a clean browser session.
- The table displays the required fields, defaults to 20 rows, filters interactively, and sorts every column correctly.
- Numerical sorting handles powerstats, metric Height, and metric Weight; missing values stay last in both directions.
- Bonus filters, URL restoration, hero details, and responsive presentation pass their corresponding audit checks.
- Normal use performs one dataset request and remains responsive with all 563 records.
- The implementation uses only native HTML, CSS, and JavaScript and follows the referenced good practices.
- The three core issues can be developed concurrently and integrated through the contracts in `architecture.md`.

## Functional Requirements

### Data loading

- Fetch `https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json` once during normal initial loading.
- Show a loading state while the request is pending and a useful error state for HTTP or parsing failures.
- Keep the fetched array as the canonical in-memory dataset; search, sort, pagination, and details must not trigger additional dataset requests.

### Required table

- Use a semantic `<table>` with these visible columns: Icon, Name, Full Name, Intelligence, Strength, Speed, Durability, Power, Combat, Race, Gender, Height, Weight, Place of Birth, and Alignment.
- Use `.images.xs` for the icon and include meaningful alternative text.
- Use metric display values for Height and Weight.

### Pagination and core search

- Default to page 1 with a page size of 20.
- Offer page sizes 10, 20, 50, 100, and all results.
- Prevent invalid page navigation and reset to page 1 when filtering or changing page size.
- Filter Name case-insensitively on every input event without a submit button.

### Sorting

- Start with Name ascending.
- Make every visible heading pointer- and keyboard-activatable.
- A newly selected column begins ascending; activating the active column toggles direction.
- Compare powerstats, Height, and Weight numerically.
- Keep null, empty, `-`, `0 cm`, and `0 kg` values last in either direction where applicable.
- Use Name ascending as a deterministic tie-breaker.

### Bonus search and URL state

- Allow one active field/operator/value filter at a time.
- Support include, exclude, and ordered-subsequence fuzzy matching for text fields.
- Support equal, not equal, greater than, and less than for powerstats, metric Height, and metric Weight.
- Synchronize `field`, `op`, `q`, `page`, `size`, `sort`, `dir`, and selected `hero` with URL query parameters.
- Restore valid URL state on load and fall back safely for malformed parameters.

### Hero details and presentation

- Open all available data for a selected hero and use `.images.lg` for its large image.
- Preserve list state while opening and closing details.
- Support keyboard activation, Escape, a visible close control, and focus restoration.
- Keep the table and detail view usable at narrow and wide viewport sizes.

## Implementation Decisions

- Use native HTML, CSS, and JavaScript modules with no framework or runtime library.
- Keep one canonical application state and derive the visible view in this order: filter, sort, paginate, render.
- Keep transformations pure; rendering consumes their results rather than owning data rules.
- Use immutable sorting so the fetched source order is never mutated.
- Treat the architecture document as the contract that lets the first three core issues start simultaneously.
- Let the team leader own the application shell, shared state, integration, and final hardening while the other members own isolated table/search/pagination and sorting modules.

## Testing Decisions

- Test data behavior primarily through the public `deriveTableView(heroes, state)` seam rather than testing private helpers or DOM implementation details.
- Use small deterministic fixtures for parallel module development and the official dataset for integration and audit checks.
- Verify the complete user flow in a clean browser using the 22-question audit checklist in Gitea issue #7.
- Explicitly cover `Cat`, weight ascending, birthplace descending, missing values in both directions, every page size, copied URLs, and hero URL restoration.
- Record browser Network and Performance evidence for the one-fetch and responsiveness requirements.
- Have each team member cross-review a feature slice they did not implement.

## Out of Scope

- Frameworks, third-party UI libraries, and server-side application code.
- Editing, deleting, or persisting changes to superhero records.
- Multiple simultaneous advanced filter clauses.
- Authentication, user accounts, or backend storage.
- Features unrelated to the official subject or audit before submission.

## References

- [Sortable subject](https://github.com/01-edu/public/tree/master/subjects/sortable)
- [Official audit](https://github.com/01-edu/public/tree/master/subjects/sortable/audit)
- [Zone01 good practices](https://public.01-edu.org/subjects/good-practices/README.md)
