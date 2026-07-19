import { INITIAL_STATE } from "./state.js";
import { loadHeroes } from "./data.js";

let state = INITIAL_STATE;
const appElement = document.querySelector("#app");
const loadingElement = document.querySelector("#loading");

async function initApp() {
  let heroes;
  try {
    heroes = await loadHeroes();
  } catch (error) {
    console.error(error);
    state = { ...state, status: "error" };
    renderError();
    return;
  }

  state = { ...state, status: "ready", heroes };
  renderApp(heroes);
}

function renderError() {
  appElement.setAttribute("aria-busy", "false");

  const message = document.createElement("p");
  message.textContent = "Could not load hero data. Please try again later.";
  loadingElement.replaceChildren(message);
}

function renderApp(heroes) {
  appElement.setAttribute("aria-busy", "false");

  const readyStatus = document.createElement("p");
  readyStatus.textContent = `${heroes.length} heroes loaded.`;
  loadingElement.replaceChildren(readyStatus);
}

initApp();
