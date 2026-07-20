const COLUMNS = Object.freeze([
  {
    key: "icon",
    label: "Icon",
    kind: "image",
    read: (hero) => hero.images?.xs,
  },
  { key: "name", label: "Name", kind: "text", read: (hero) => hero.name },
  {
    key: "fullName",
    label: "Full Name",
    kind: "text",
    read: (hero) => hero.biography?.fullName,
  },
  {
    key: "intelligence",
    label: "Intelligence",
    kind: "number",
    read: (hero) => hero.powerstats?.intelligence,
  },
  {
    key: "strength",
    label: "Strength",
    kind: "number",
    read: (hero) => hero.powerstats?.strength,
  },
  {
    key: "speed",
    label: "Speed",
    kind: "number",
    read: (hero) => hero.powerstats?.speed,
  },
  {
    key: "durability",
    label: "Durability",
    kind: "number",
    read: (hero) => hero.powerstats?.durability,
  },
  {
    key: "power",
    label: "Power",
    kind: "number",
    read: (hero) => hero.powerstats?.power,
  },
  {
    key: "combat",
    label: "Combat",
    kind: "number",
    read: (hero) => hero.powerstats?.combat,
  },
  {
    key: "race",
    label: "Race",
    kind: "text",
    read: (hero) => hero.appearance?.race,
  },
  {
    key: "gender",
    label: "Gender",
    kind: "text",
    read: (hero) => hero.appearance?.gender,
  },
  {
    key: "height",
    label: "Height",
    kind: "number",
    read: (hero) => hero.appearance?.height?.[1],
  },
  {
    key: "weight",
    label: "Weight",
    kind: "number",
    read: (hero) => hero.appearance?.weight?.[1],
  },
  {
    key: "placeOfBirth",
    label: "Place of Birth",
    kind: "text",
    read: (hero) => hero.biography?.placeOfBirth,
  },
  {
    key: "alignment",
    label: "Alignment",
    kind: "text",
    read: (hero) => hero.biography?.alignment,
    format: (hero) => {
      const alignment = hero.biography?.alignment ?? "";
      return alignment.charAt(0).toUpperCase() + alignment.slice(1);
    },
  },
]);

export { COLUMNS };
