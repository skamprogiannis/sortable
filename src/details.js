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
  if (isMissingDetailValue(value)) {
    return "Not available";
  }

  if (Array.isArray(value)) {
    const values = value.filter((item) => !isMissingDetailValue(item));

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
 * @returns {{ element: HTMLDialogElement, update: (hero: object|null, triggerElement?: HTMLElement|null) => void }}
 */
function createDetailsView({ onClose }) {
  const dialog = document.createElement("dialog");
  dialog.className = "hero-details";
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
  // Build fresh content whenever a different hero is selected.
  const content = document.createElement("article");

  const header = document.createElement("header");
  const heading = document.createElement("h2");
  heading.textContent = hero.name ?? "Unknown hero";

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
  // Prefer the API's large image, with a text fallback when it is absent or fails.
  const source = getLargeImageSource(hero);

  if (source === null) {
    return createImageFallback();
  }

  const image = document.createElement("img");
  image.className = "hero-detail-image";
  image.src = source;
  image.alt = `Large portrait of ${hero.name ?? "hero"}`;
  image.addEventListener("error", () => image.replaceWith(createImageFallback()));

  return image;
}

function createImageFallback() {
  // Keep the detail view useful even when no portrait can be displayed.
  const fallback = document.createElement("p");
  fallback.className = "detail-image-fallback";
  fallback.textContent = "Large image not available.";

  return fallback;
}

function createDetailSection({ title, entries }) {
  // A definition list pairs each field label with its displayed value.
  const section = document.createElement("section");
  section.className = "detail-section";

  const heading = document.createElement("h3");
  heading.textContent = title;

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
  // Return keyboard focus to the row that opened the details when possible.
  if (dialog.open) {
    dialog.close();
  }

  triggerElement?.focus();
}

function isMissingDetailValue(value) {
  // The API uses null, empty text, and dashes when a detail is unavailable.
  return value === null
    || value === undefined
    || (typeof value === "string" && (value.trim() === "" || value.trim() === "-"));
}

function formatDetailLabel(label) {
  // Convert API keys such as "fullName" into readable labels.
  return label.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (character) => character.toUpperCase());
}

export {
  createDetailsView,
  formatDetailValue,
  getDetailSections,
  getLargeImageSource,
};
