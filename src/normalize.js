/**
 * Converts a raw API value into a comparable value using its column
 * descriptor, or the shared missing marker (`null`). Non-numeric columns
 * yield a trimmed string; numeric columns yield a finite number or `null`.
 * This contract is shared by sorting and numeric filtering.
 *
 * @param {unknown} rawValue
 * @param {{ key: string, kind: "image" | "number" | "text", isMissing?: (value: unknown) => boolean }} column
 * @returns {string | number | null}
 */
function normalizeValue(rawValue, column) {
  if (isMissing(rawValue, column)) {
    return null;
  }

  if (column.kind !== "number") {
    return String(rawValue).trim();
  }

  const numericValue = normalizeNumber(rawValue, column);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeNumber(rawValue, column) {
  if (typeof rawValue === "number") {
    return rawValue;
  }

  const normalizedValue = String(rawValue).trim().replaceAll(",", "");
  const numericValue = Number.parseFloat(normalizedValue);

  if (column.key === "weight" && normalizedValue.endsWith("tons")) {
    return numericValue * 1000;
  }

  if (column.key === "height" && normalizedValue.endsWith("meters")) {
    return numericValue * 100;
  }

  return numericValue;
}

function isMissing(value, column) {
  // Columns may define extra missing cases, while common API placeholders work everywhere.
  if (column.isMissing?.(value)) {
    return true;
  }

  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();

  return normalizedValue === "" || normalizedValue === "-" || normalizedValue === "0 cm" || normalizedValue === "0 kg";
}

export { normalizeValue };
