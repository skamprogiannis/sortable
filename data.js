const DATASET_URL =
  "https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json";

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
