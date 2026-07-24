import { isMissingValue } from "./normalize.js";

const DETAIL_HEADING_ID = "hero-detail-heading";
const DETAIL_GROUPS = [
  ["Biography", "biography"],
  ["Appearance", "appearance"],
  ["Powerstats", "powerstats"],
  ["Work", "work"],
  ["Connections", "connections"],
];

/**
 * Converts a hero detail value into text suitable for display.
 *
 * @param {unknown} value
 * @returns {string}
 */
function formatDetailValue(value) {
  if (isMissingValue(value)) {
    return "Not available";
  }

  if (Array.isArray(value)) {
    const values = value.filter((item) => !isMissingValue(item));

    return values.length > 0 ? values.map(String).join(", ") : "Not available";
  }

  return String(value);
}

/**
 * Returns the large hero image URL when one is available.
 *
 * @param {{ images?: { lg?: unknown } }} hero
 * @returns {string|null}
 */
function getLargeImageSource(hero) {
  const source = hero.images?.lg;

  return typeof source === "string" && source.trim() !== "" ? source : null;
}

/**
 * Prepares all required hero data groups for detail rendering.
 *
 * @param {object} hero
 * @returns {{ title: string, entries: [string, string][] }[]}
 */
function getDetailSections(hero) {
  return DETAIL_GROUPS.map(([title, key]) => ({
    title,
    entries: Object.entries(hero[key] ?? {}).map(([label, value]) => [
      formatDetailLabel(label),
      formatDetailValue(value),
    ]),
  }));
}

/**
 * Creates a reusable modal view for one selected hero.
 * The application owns selection state and supplies the close callback.
 *
 * @param {{ onClose: () => void }} options
 * @returns {{
 *   element: HTMLDialogElement,
 *   update: (hero: object|null, triggerElement?: HTMLElement|null) => void,
 * }}
 */
function createDetailsView({ onClose }) {
  const dialog = document.createElement("dialog");
  dialog.className = "hero-details";
  dialog.setAttribute("aria-labelledby", DETAIL_HEADING_ID);
  let triggerElement = null;

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    onClose();
  });

  return {
    element: dialog,
    update(hero, nextTriggerElement = null) {
      if (hero === null) {
        closeDetails(dialog, triggerElement);
        triggerElement = null;
        return;
      }

      triggerElement = nextTriggerElement ?? triggerElement;
      dialog.replaceChildren(createDetailContent(hero, onClose));

      if (!dialog.open) {
        dialog.showModal();
      }
    },
  };
}

function createDetailContent(hero, onClose) {
  const content = document.createElement("article");

  const header = document.createElement("header");
  const heading = document.createElement("h2");
  heading.id = DETAIL_HEADING_ID;
  heading.textContent = formatHeroName(hero.name);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "detail-close";
  closeButton.textContent = "Close details";
  closeButton.addEventListener("click", onClose);

  header.append(heading, closeButton);
  content.append(header, createLargeImage(hero));

  for (const section of getDetailSections(hero)) {
    content.append(createDetailSection(section));
  }

  return content;
}

function createLargeImage(hero) {
  const source = getLargeImageSource(hero);

  if (source === null) {
    return createImageFallback();
  }

  const image = document.createElement("img");
  image.className = "hero-detail-image";
  image.src = source;
  image.alt = `Large portrait of ${formatHeroName(hero.name)}`;
  image.addEventListener("error", () => image.replaceWith(createImageFallback()));

  return image;
}

function createImageFallback() {
  const fallback = document.createElement("p");
  fallback.className = "detail-image-fallback";
  fallback.textContent = "Large image not available.";

  return fallback;
}

function createDetailSection({ title, entries }) {
  const section = document.createElement("section");
  section.className = "detail-section";

  const heading = document.createElement("h3");
  heading.textContent = title;

  if (entries.length === 0) {
    const fallback = document.createElement("p");
    fallback.className = "detail-value-fallback";
    fallback.textContent = "Not available.";
    section.append(heading, fallback);
    return section;
  }

  const list = document.createElement("dl");
  for (const [label, value] of entries) {
    const term = document.createElement("dt");
    term.textContent = label;

    const description = document.createElement("dd");
    description.textContent = value;
    list.append(term, description);
  }

  section.append(heading, list);
  return section;
}

function closeDetails(dialog, triggerElement) {
  if (dialog.open) {
    dialog.close();
  }

  triggerElement?.focus();
}

function formatDetailLabel(label) {
  // Convert API keys such as "fullName" into readable labels.
  return label
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
}

function formatHeroName(name) {
  return isMissingValue(name) ? "Unknown hero" : String(name);
}

export {
  createDetailsView,
  formatDetailValue,
  getDetailSections,
  getLargeImageSource,
};
