import { getAriaSort } from "./sorting.js";

/**
 * Creates the hero table view. Rows arrive already filtered, sorted,
 * and paginated; activating a heading only reports the column key
 * through onSort, so sorting rules stay outside the renderer.
 *
 * @param {{ columns: object[], onSort: (key: string) => void, onHeroSelect?: (hero: object, triggerElement: HTMLElement) => void }} options
 * @returns {{ element: HTMLTableElement, update: (view: { rows: object[], sortState: { key: string, direction: "asc"|"desc" } }) => void }}
 */
function createTableView({ columns, onSort, onHeroSelect = () => {} }) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const tbody = document.createElement("tbody");
  const headerCells = new Map();

  for (const column of columns) {
    const cell = document.createElement("th");
    cell.scope = "col";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = column.label;
    button.addEventListener("click", () => onSort(column.key));

    cell.append(button);
    headerCells.set(column.key, cell);
    headerRow.append(cell);
  }

  thead.append(headerRow);
  table.append(thead, tbody);

  function update({ rows, sortState }) {
    for (const [key, cell] of headerCells) {
      if (sortState?.key === key) {
        cell.setAttribute("aria-sort", getAriaSort(sortState, key));
      } else {
        cell.removeAttribute("aria-sort");
      }
    }

    if (rows.length === 0) {
      tbody.replaceChildren(createEmptyRow(columns.length));
      return;
    }

    tbody.replaceChildren(...rows.map((hero) => createRow(hero, columns, onHeroSelect)));
  }

  return { element: table, update };
}

function createRow(hero, columns, onHeroSelect) {
  const row = document.createElement("tr");
  row.className = "hero-row";
  // Table rows are not keyboard-focusable by default, so make hero selection available to keyboard users.
  row.tabIndex = 0;
  row.setAttribute("aria-label", `Open details for ${hero.name ?? "Unknown hero"}`);

  function selectHero() {
    onHeroSelect(hero, row);
  }

  row.addEventListener("click", selectHero);
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectHero();
    }
  });

  for (const column of columns) {
    const cell = document.createElement("td");

    if (column.kind === "image") {
      const source = column.read(hero);
      if (source) {
        cell.append(createIcon(source, hero));
      }
    } else {
      cell.textContent = formatValue(hero, column);
    }

    row.append(cell);
  }

  return row;
}

function createIcon(source, hero) {
  const image = document.createElement("img");
  image.src = source;
  image.alt = hero.name ?? "Unknown hero";
  image.loading = "lazy";
  image.className = "hero-icon";

  return image;
}

function formatValue(hero, column) {
  if (typeof column.format === "function") {
    return column.format(hero);
  }

  return String(column.read(hero) ?? "");
}

function createEmptyRow(columnCount) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = columnCount;
  cell.className = "empty-state";
  cell.textContent = "No heroes match your search.";
  row.append(cell);

  return row;
}

export { createTableView };
