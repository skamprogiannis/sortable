import { PAGE_SIZES } from "./pagination.js";

/**
 * Creates the Name search box. Every input event reports the raw
 * value through onSearch; state stays with the caller.
 *
 * @param {{ onSearch: (query: string) => void }} options
 * @returns {{ element: HTMLElement, update: (query: string) => void }}
 */
function createSearchControl({ onSearch }) {
  const container = document.createElement("div");
  container.className = "search-control";

  const label = document.createElement("label");
  label.htmlFor = "hero-search";
  label.textContent = "Search name";

  const input = document.createElement("input");
  input.id = "hero-search";
  input.type = "search";
  input.addEventListener("input", () => onSearch(input.value));

  container.append(label, input);

  return {
    element: container,
    update(query) {
      if (input.value !== query) {
        input.value = query;
      }
    },
  };
}

/**
 * Creates the results-per-page selector.
 *
 * @param {{ onPageSizeChange: (pageSize: 10|20|50|100|"all") => void }} options
 * @returns {{ element: HTMLElement, update: (pageSize: 10|20|50|100|"all") => void }}
 */
function createPageSizeControl({ onPageSizeChange }) {
  const container = document.createElement("div");
  container.className = "page-size-control";

  const label = document.createElement("label");
  label.htmlFor = "hero-page-size";
  label.textContent = "Results per page";

  const select = document.createElement("select");
  select.id = "hero-page-size";

  for (const size of PAGE_SIZES) {
    const option = document.createElement("option");
    option.value = String(size);
    option.textContent = size === "all" ? "All" : String(size);
    select.append(option);
  }

  select.addEventListener("change", () => {
    onPageSizeChange(select.value === "all" ? "all" : Number(select.value));
  });

  container.append(label, select);

  return {
    element: container,
    update(pageSize) {
      select.value = String(pageSize);
    },
  };
}

/**
 * Creates the previous/next pager with a page summary. Buttons are
 * disabled at the range edges so invalid navigation cannot start here.
 *
 * @param {{ onPageChange: (page: number) => void }} options
 * @returns {{ element: HTMLElement, update: (view: { page: number, pageCount: number, totalCount: number }) => void }}
 */
function createPagerControl({ onPageChange }) {
  let currentPage = 1;

  const container = document.createElement("div");
  container.className = "pager-control";

  const previous = document.createElement("button");
  previous.type = "button";
  previous.textContent = "Previous";
  previous.disabled = true;
  previous.addEventListener("click", () => onPageChange(currentPage - 1));

  const status = document.createElement("p");
  status.setAttribute("role", "status");

  const next = document.createElement("button");
  next.type = "button";
  next.textContent = "Next";
  next.disabled = true;
  next.addEventListener("click", () => onPageChange(currentPage + 1));

  container.append(previous, status, next);

  return {
    element: container,
    update({ page, pageCount, totalCount }) {
      currentPage = page;
      previous.disabled = page <= 1;
      next.disabled = page >= pageCount;
      status.textContent = `Page ${page} of ${pageCount} (${totalCount} heroes)`;
    },
  };
}

export { createPageSizeControl, createPagerControl, createSearchControl };
