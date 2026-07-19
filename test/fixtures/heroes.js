export const columns = [
  { key: "name", kind: "text", read: (hero) => hero.name },
  { key: "strength", kind: "number", read: (hero) => hero.powerstats.strength },
  { key: "height", kind: "number", read: (hero) => hero.appearance.height[1] },
  { key: "weight", kind: "number", read: (hero) => hero.appearance.weight[1] },
  { key: "placeOfBirth", kind: "text", read: (hero) => hero.biography.placeOfBirth },
];

export const heroes = [
  {
    id: 1,
    name: "zebra",
    powerstats: { strength: 9 },
    appearance: { height: ["5'9", "175 cm"], weight: ["165 lb", "75 kg"] },
    biography: { placeOfBirth: "Zurich" },
  },
  {
    id: 2,
    name: "Alpha",
    powerstats: { strength: 100 },
    appearance: { height: ["6'0", "183 cm"], weight: ["220 lb", "100 kg"] },
    biography: { placeOfBirth: "Athens" },
  },
  {
    id: 3,
    name: "beta",
    powerstats: { strength: 11 },
    appearance: { height: ["-", "0 cm"], weight: ["-", "0 kg"] },
    biography: { placeOfBirth: "-" },
  },
  {
    id: 4,
    name: "Bravo",
    powerstats: { strength: null },
    appearance: { height: ["-", ""], weight: ["-", null] },
    biography: { placeOfBirth: null },
  },
  {
    id: 5,
    name: "Atlas",
    powerstats: { strength: 100 },
    appearance: { height: ["6'2", "188 cm"], weight: ["220 lb", "100 kg"] },
    biography: { placeOfBirth: "Athens" },
  },
];
