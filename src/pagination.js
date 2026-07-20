const PAGE_SIZES = Object.freeze([10, 20, 50, 100, "all"]);
const DEFAULT_PAGE_SIZE = 20;

/**
 * Returns the rows visible on the requested page plus page metadata.
 * Out-of-range or invalid page numbers resolve to the nearest valid
 * page, and unsupported page sizes fall back to the default.
 *
 * @param {ReadonlyArray<object>} heroes
 * @param {{ page: number, pageSize: 10|20|50|100|"all" }} pageState
 * @returns {{ rows: object[], page: number, pageCount: number, totalCount: number }}
 */
export function paginateHeroes(heroes, { page, pageSize }) {
  const totalCount = heroes.length;
  const size = resolvePageSize(pageSize, totalCount);
  const pageCount = Math.max(1, Math.ceil(totalCount / size));
  const safePage = resolvePage(page, pageCount);
  const start = (safePage - 1) * size;

  return {
    rows: heroes.slice(start, start + size),
    page: safePage,
    pageCount,
    totalCount,
  };
}

function resolvePageSize(pageSize, totalCount) {
  if (pageSize === "all") {
    return Math.max(totalCount, 1);
  }

  return PAGE_SIZES.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE;
}

function resolvePage(page, pageCount) {
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return Math.min(page, pageCount);
}

export { PAGE_SIZES, DEFAULT_PAGE_SIZE };
