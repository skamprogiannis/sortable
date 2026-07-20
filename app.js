import { applyPage, applyPageSize, applySearch, INITIAL_STATE } from "./state.js";
import { loadHeroes } from "./data.js";
import { COLUMNS } from "./src/columns.js";
import {
  createPageSizeControl,
  createPagerControl,
  createSearchControl,
} from "./src/controls.js";
import { filterHeroes } from "./src/filtering.js";
import { paginateHeroes } from "./src/pagination.js";
import { nextSortState, sortHeroes } from "./src/sorting.js";
import { createTableView } from "./src/table.js";

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

  state = { ...state, status: "ready", heroes };
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

  const searchControl = createSearchControl({
    onSearch(query) {
      state = applySearch(state, query);
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
  });

  const controls = document.createElement("section");
  controls.setAttribute("aria-label", "Hero table controls");
  controls.append(searchControl.element, pageSizeControl.element);
  appElement.replaceChildren(controls, tableView.element, pagerControl.element);

  function derivePageView() {
    const filteredHeroes = filterHeroes(state.heroes, { query: state.query });
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

    searchControl.update(state.query);
    pageSizeControl.update(state.pageSize);
    tableView.update({ rows: pageView.rows, sortState: readSortState() });
    pagerControl.update(pageView);
  }

  renderList();
}

initApp();
