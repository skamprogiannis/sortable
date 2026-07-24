import { PAGE_SIZES } from "./pagination.js";

const OPERATOR_LABELS = {
  "include": "includes",
  "exclude": "excludes",
  "fuzzy": "fuzzy",
  "equal": "=",
  "not-equal": "≠",
  "greater-than": ">",
  "less-than": "<",
};

/**
 * Creates the advanced search control: a field selector, an operator
 * selector limited to the operators valid for the chosen field, and a
 * query input. Any change reports `{ field, operator, query }` through
 * onSearch; changing the field resets the operator to that field's
 * default. State stays with the caller.
 *
 * @param {{
 *   fields: { key: string, label: string, operators: string[] }[],
 *   onSearch: (search: { field: string, operator: string, query: string }) => void,
 * }} options
 * @returns {{
 *   element: HTMLElement,
 *   update: (search: { field: string, operator: string, query: string }) => void,
 * }}
 */
function createAdvancedSearchControl({ fields, onSearch }) {
  const container = document.createElement("div");
  container.className = "search-control";

  const fieldLabel = document.createElement("label");
  fieldLabel.htmlFor = "hero-search-field";
  fieldLabel.textContent = "Search field";

  const fieldSelect = document.createElement("select");
  fieldSelect.id = "hero-search-field";

  for (const field of fields) {
    const option = document.createElement("option");
    option.value = field.key;
    option.textContent = field.label;
    fieldSelect.append(option);
  }

  const operatorLabel = document.createElement("label");
  operatorLabel.htmlFor = "hero-search-operator";
  operatorLabel.textContent = "Operator";

  const operatorSelect = document.createElement("select");
  operatorSelect.id = "hero-search-operator";

  const queryLabel = document.createElement("label");
  queryLabel.htmlFor = "hero-search";
  queryLabel.textContent = "Search";

  const input = document.createElement("input");
  input.id = "hero-search";
  input.type = "search";

  let renderedField = null;

  function renderOperators(fieldKey) {
    if (renderedField === fieldKey) {
      return;
    }

    renderedField = fieldKey;
    operatorSelect.replaceChildren();

    const field = fields.find((candidate) => candidate.key === fieldKey);

    for (const operator of field ? field.operators : []) {
      const option = document.createElement("option");
      option.value = operator;
      option.textContent = OPERATOR_LABELS[operator] ?? operator;
      operatorSelect.append(option);
    }
  }

  function emit() {
    onSearch({
      field: fieldSelect.value,
      operator: operatorSelect.value,
      query: input.value,
    });
  }

  fieldSelect.addEventListener("change", () => {
    // A rebuilt operator list defaults to its first (default) operator.
    renderOperators(fieldSelect.value);
    emit();
  });
  operatorSelect.addEventListener("change", emit);
  input.addEventListener("input", emit);

  renderOperators(fieldSelect.value);

  container.append(
    fieldLabel,
    fieldSelect,
    operatorLabel,
    operatorSelect,
    queryLabel,
    input,
  );

  return {
    element: container,
    update({ field, operator, query }) {
      if (fieldSelect.value !== field) {
        fieldSelect.value = field;
      }

      renderOperators(field);
      operatorSelect.value = operator;

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
 * @returns {{
 *   element: HTMLElement,
 *   update: (view: {
 *     page: number,
 *     pageCount: number,
 *     totalCount: number,
 *   }) => void,
 * }}
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

export {
  createAdvancedSearchControl,
  createPageSizeControl,
  createPagerControl,
};
