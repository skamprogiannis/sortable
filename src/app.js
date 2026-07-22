import {
  applyHeroSelection,
  applyPage,
  applyPageSize,
  applySearch,
  INITIAL_STATE,
} from "./state.js";
import { loadHeroes } from "./data.js";
import { COLUMNS } from "./columns.js";
import { createDetailsView } from "./details.js";
import {
  createAdvancedSearchControl,
  createPageSizeControl,
  createPagerControl,
} from "./controls.js";
import { filterHeroes } from "./filtering.js";
import { paginateHeroes } from "./pagination.js";
import { searchableFields } from "./search-fields.js";
import { nextSortState, sortHeroes } from "./sorting.js";
import { createTableView } from "./table.js";
import { stateFromUrl, stateToUrl } from "./url-state.js";
import { findHeroById } from "./hero-selection.js";

let state = INITIAL_STATE;
const appElement = document.querySelector("#app");
const loadingElement = document.querySelector("#loading");

async function initApp() {
  let heroes;
  try {
    heroes = await loadHeroes();
  } catch (error) {
    console.error(error);
    state = { ...state, status: "error" };
    renderError();
    return;
  }

  state = {
    ...state,
    status: "ready",
    heroes,
    ...stateFromUrl(new URLSearchParams(window.location.search)),
  };
  renderApp();
}

function renderError() {
  appElement.setAttribute("aria-busy", "false");

  const message = document.createElement("p");
  message.textContent = "Could not load hero data. Please try again later.";
  loadingElement.replaceChildren(message);
}

function renderApp() {
  appElement.setAttribute("aria-busy", "false");
  let pageCount = 1;

  const searchControl = createAdvancedSearchControl({
    fields: searchableFields(COLUMNS),
    onSearch(search) {
      state = applySearch(state, search);
      renderList();
    },
  });
  const pageSizeControl = createPageSizeControl({
    onPageSizeChange(pageSize) {
      state = applyPageSize(state, pageSize);
      renderList();
    },
  });
  const pagerControl = createPagerControl({
    onPageChange(page) {
      state = applyPage(state, page, pageCount);
      renderList();
    },
  });
  const detailsView = createDetailsView({
    onClose() {
      state = applyHeroSelection(state, null);
      renderDetails();
      syncUrl();
    },
  });
  const tableView = createTableView({
    columns: COLUMNS,
    onSort(columnKey) {
      const nextState = nextSortState(readSortState(), columnKey);
      state = {
        ...state,
        sortKey: nextState.key,
        sortDirection: nextState.direction,
      };
      renderList();
    },
    onHeroSelect(hero, triggerElement) {
      state = applyHeroSelection(state, hero.id);
      renderDetails(triggerElement);
      syncUrl();
    },
  });

  const controls = document.createElement("section");
  controls.setAttribute("aria-label", "Hero table controls");
  controls.append(searchControl.element, pageSizeControl.element);
  appElement.replaceChildren(
    controls,
    tableView.element,
    pagerControl.element,
    detailsView.element,
  );

  function derivePageView() {
    const filteredHeroes = filterHeroes(
      state.heroes,
      { field: state.field, operator: state.operator, query: state.query },
      COLUMNS,
    );
    const sortedHeroes = sortHeroes(filteredHeroes, readSortState(), COLUMNS);
    return paginateHeroes(sortedHeroes, {
      page: state.page,
      pageSize: state.pageSize,
    });
  }

  function readSortState() {
    return {
      key: state.sortKey,
      direction: state.sortDirection,
    };
  }

  function renderList() {
    const pageView = derivePageView();
    pageCount = pageView.pageCount;
    if (pageView.page !== state.page) {
      state = { ...state, page: pageView.page };
    }

    searchControl.update({
      field: state.field,
      operator: state.operator,
      query: state.query,
    });
    pageSizeControl.update(state.pageSize);
    tableView.update({ rows: pageView.rows, sortState: readSortState() });
    pagerControl.update(pageView);
    renderDetails();
    syncUrl();
  }

  function renderDetails(triggerElement = null) {
    const hero = findHeroById(state.heroes, state.selectedHeroId);

    if (state.selectedHeroId !== null && hero === null) {
      // URL IDs are syntactically valid before loading; clear one that is absent from the dataset.
      state = applyHeroSelection(state, null);
    }

    detailsView.update(hero, triggerElement);
  }

  // Reflect the normalized/clamped state in the URL without navigating.
  function syncUrl() {
    const query = stateToUrl(state).toString();
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }

  renderList();
}

initApp();
