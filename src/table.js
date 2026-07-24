import { getAriaSort } from "./sorting.js";
import { isMissingValue } from "./normalize.js";

const MISSING_VALUE_LABEL = "Not available";

/**
 * Creates the hero table view. Rows arrive already filtered, sorted,
 * and paginated; activating a heading only reports the column key
 * through onSort, so sorting rules stay outside the renderer.
 *
 * @param {{
 *   columns: object[],
 *   onSort: (key: string) => void,
 *   onHeroSelect?: (hero: object, triggerElement: HTMLElement) => void,
 * }} options
 * @returns {{
 *   element: HTMLTableElement,
 *   update: (view: {
 *     rows: object[],
 *     sortState: { key: string, direction: "asc"|"desc" },
 *   }) => void,
 * }}
 */
function createTableView({ columns, onSort, onHeroSelect }) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const tbody = document.createElement("tbody");
  const headerCells = new Map();
  const heroesByRow = new WeakMap();
  const canSelectHeroes = typeof onHeroSelect === "function";

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
  if (canSelectHeroes) {
    tbody.addEventListener("click", (event) => {
      const row = event.target instanceof Element
        ? event.target.closest(".hero-row")
        : null;
      const hero = row === null ? null : heroesByRow.get(row);
      const triggerElement = row?.querySelector(".hero-details-trigger");

      if (hero && triggerElement) {
        onHeroSelect(hero, triggerElement);
      }
    });
  }

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

    const heroRows = rows.map((hero) => createRow(hero, columns, canSelectHeroes));
    for (let index = 0; index < rows.length; index += 1) {
      heroesByRow.set(heroRows[index], rows[index]);
    }
    tbody.replaceChildren(...heroRows);
  }

  return { element: table, update };
}

function createRow(hero, columns, canSelectHero) {
  const row = document.createElement("tr");
  row.className = "hero-row";
  row.classList.toggle("hero-row-selectable", canSelectHero);

  for (const column of columns) {
    const cell = document.createElement("td");

    if (column.kind === "image") {
      const source = column.read(hero);
      if (source) {
        cell.append(createIcon(source, hero));
      } else {
        cell.append(createIconFallback());
      }
    } else if (column.key === "name" && canSelectHero) {
      cell.append(createHeroDetailsTrigger(hero, column));
    } else {
      cell.textContent = formatValue(hero, column);
    }

    row.append(cell);
  }

  return row;
}

function createHeroDetailsTrigger(hero, column) {
  const button = document.createElement("button");
  const heroName = formatValue(hero, column) || "Unknown hero";
  button.type = "button";
  button.className = "hero-details-trigger";
  button.textContent = heroName;
  button.setAttribute("aria-label", `Open details for ${heroName}`);
  button.setAttribute("aria-haspopup", "dialog");

  return button;
}

function createIcon(source, hero) {
  const image = document.createElement("img");
  image.src = source;
  image.alt = isMissingValue(hero.name) ? "Unknown hero" : String(hero.name);
  image.loading = "lazy";
  image.className = "hero-icon";
  image.addEventListener(
    "error",
    () => image.replaceWith(createIconFallback()),
    { once: true },
  );

  return image;
}

function formatValue(hero, column) {
  const value = column.read(hero);

  if (isMissingValue(value, column)) {
    return MISSING_VALUE_LABEL;
  }

  if (typeof column.format === "function") {
    return column.format(hero);
  }

  return String(value);
}

function createIconFallback() {
  const fallback = document.createElement("span");
  fallback.className = "image-fallback";
  fallback.textContent = "Image unavailable";

  return fallback;
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
