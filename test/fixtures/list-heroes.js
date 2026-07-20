export const searchHeroes = [
  { id: 1, name: "Batman" },
  { id: 2, name: "Catwoman" },
  { id: 3, name: "Black Cat" },
  { id: 4, name: "Iron Man" },
  { id: 5, name: "Thor" },
];

export const pagedHeroes = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  name: `Hero ${String(index + 1).padStart(2, "0")}`,
}));
