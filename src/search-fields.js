import { COLUMNS } from "./columns.js";

const TEXT_OPERATORS = Object.freeze(["include", "exclude", "fuzzy"]);
const NUMBER_OPERATORS = Object.freeze([
  "equal",
  "not-equal",
  "greater-than",
  "less-than",
]);

/**
 * Returns the operators valid for a descriptor kind. Image and unknown
 * kinds are not searchable and expose no operators.
 *
 * @param {string} kind
 * @returns {readonly string[]}
 */
function operatorsForKind(kind) {
  if (kind === "text") {
    return TEXT_OPERATORS;
  }

  if (kind === "number") {
    return NUMBER_OPERATORS;
  }

  return [];
}

/**
 * Returns supported text and number fields with their labels, kinds, and
 * valid operators. For the canonical descriptors, this is every visible
 * column except Icon.
 *
 * @param {ReadonlyArray<{ key: string, label: string, kind: string }>} [columns]
 * @returns {{ key: string, label: string, kind: string, operators: string[] }[]}
 */
function searchableFields(columns = COLUMNS) {
  return columns
    .filter((column) => operatorsForKind(column.kind).length > 0)
    .map((column) => ({
      key: column.key,
      label: column.label,
      kind: column.kind,
      operators: [...operatorsForKind(column.kind)],
    }));
}

function findSearchableColumn(field, columns) {
  return columns.find(
    (column) => column.key === field && operatorsForKind(column.kind).length > 0,
  );
}

/**
 * Reports whether a field can be searched against.
 *
 * @param {string} field
 * @param {ReadonlyArray<{ key: string, kind: string }>} [columns]
 * @returns {boolean}
 */
function isSearchableField(field, columns = COLUMNS) {
  return findSearchableColumn(field, columns) !== undefined;
}

/**
 * Reports whether an operator is valid for a field's kind.
 *
 * @param {string} field
 * @param {string} operator
 * @param {ReadonlyArray<{ key: string, kind: string }>} [columns]
 * @returns {boolean}
 */
function isValidOperator(field, operator, columns = COLUMNS) {
  const column = findSearchableColumn(field, columns);

  return column !== undefined && operatorsForKind(column.kind).includes(operator);
}

/**
 * Returns the default operator for a field, or null when it is not
 * searchable.
 *
 * @param {string} field
 * @param {ReadonlyArray<{ key: string, kind: string }>} [columns]
 * @returns {string|null}
 */
function defaultOperatorForField(field, columns = COLUMNS) {
  const column = findSearchableColumn(field, columns);

  return column ? operatorsForKind(column.kind)[0] : null;
}

export {
  defaultOperatorForField,
  isSearchableField,
  isValidOperator,
  operatorsForKind,
  searchableFields,
};
