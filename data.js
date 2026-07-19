const DATASET_URL =
  "https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json";

/**
 * Fetches and validates the canonical superhero dataset.
 *
 * @returns {Promise<object[]>} The complete superhero dataset.
 * @throws {Error} If the request, response, JSON, or dataset shape is invalid.
 */
async function loadHeroes() {
  const response = await fetch(DATASET_URL);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Heroes data is not an array");
  }

  return data;
}

export { loadHeroes };
