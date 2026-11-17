"use strict";


const shelfGrid = document.querySelector("#shelf-grid");
const shelfEmpty = document.querySelector("#shelf-empty");
const shelfLine = document.querySelector("#shelf-line");
const shelfSort = document.querySelector("#shelf-sort");
const shelfToolbar = document.querySelector("#shelf-toolbar");
const clearOpen = document.querySelector("#clear-open");
const confirmBox = document.querySelector("#confirm-box");
const clearYes = document.querySelector("#clear-yes");
const clearNo = document.querySelector("#clear-no");

let shelfIds = getShelfIds();
let shelfOrder = "saved";

function getShelfCards() {
  const cards = shelfIds
    .map((id) => PROFESSIONS.find((item) => item.id === id))
    .filter(Boolean);
  if (shelfOrder === "name") cards.sort((a, b) => a.name.localeCompare(b.name));
  if (shelfOrder === "early") cards.sort((a, b) => a.vanished - b.vanished);
  if (shelfOrder === "late") cards.sort((a, b) => b.vanished - a.vanished);
  return cards;
}

function createShelfCard(profession) {
  const column = document.createElement("div");
  column.className = "col-12 col-md-6 col-lg-4";
  column.dataset.id = profession.id;

  const card = document.createElement("article");
  card.className = "file book";

  const number = document.createElement("span");
  number.className = "no";
  number.textContent = "No. " + String(profession.id).padStart(2, "0");

  const photo = document.createElement("div");
  photo.className = "photo";
  photo.append(makeIcon(profession, "big"), makeImage(profession));

  const title = document.createElement("h3");
  title.textContent = profession.name;

  const era = document.createElement("p");
  era.className = "era";
  era.textContent = profession.period;

  const text = document.createElement("p");
  text.textContent = profession.description;

  const details = document.createElement("p");
  details.className = "book-details";
  const years = profession.vanished - profession.from;
  const replaced = document.createElement("strong");
  replaced.textContent = "Replaced by: ";
  const lasted = document.createElement("strong");
  lasted.textContent = "Lasted: ";
  details.append(
    replaced,
    profession.replacedBy,
    document.createElement("br"),
    lasted,
    `about ${years} years, until ${profession.vanished}`,
  );

  const actions = document.createElement("div");
  actions.className = "book-actions";

  const open = document.createElement("a");
  open.className = "open-link";
  open.href = "catalog.html?q=" + encodeURIComponent(profession.name);
  open.textContent = "In catalog";
  open.setAttribute("aria-label", `Find ${profession.name} in the catalog`);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove";
  remove.dataset.id = profession.id;
  remove.setAttribute("aria-label", `Remove ${profession.name} from my shelf`);
  remove.textContent = "Remove";

  actions.append(open, remove);
  card.append(number, photo, title, era, text, details, actions);
  column.append(card);
  return column;
}

function updateStats(cards) {
  const total = cards.length;
  const all = PROFESSIONS.length;
  const drawersUsed = new Set(cards.map((item) => item.drawer)).size;

  document.querySelector("#stat-total").textContent = total;
  document.querySelector("#stat-all").textContent = all;
  document.querySelector("#stat-drawers").textContent = drawersUsed;
  document.querySelector("#stat-drawers-all").textContent = getDrawers().length;

  const averageBox = document.querySelector("#stat-years");
  const firstBox = document.querySelector("#stat-first");
  if (total === 0) {
    averageBox.textContent = "–";
    firstBox.textContent = "–";
  } else {
    const sum = cards.reduce((acc, item) => acc + (item.vanished - item.from), 0);
    averageBox.textContent = Math.round(sum / total);
    firstBox.textContent = Math.min(...cards.map((item) => item.vanished));
  }

  const percent = Math.round((total / all) * 100);
  const progress = document.querySelector("#progress");
  progress.setAttribute("aria-valuenow", percent);
  document.querySelector("#progress-bar").style.width = percent + "%";
}

function render() {
  shelfIds = getShelfIds();
  const cards = getShelfCards();

  shelfGrid.replaceChildren(...cards.map(createShelfCard));
  $(shelfGrid).stop(true, true).hide().fadeIn(250);

  updateStats(cards);
  updateShelfBadge();

  const hasCards = cards.length > 0;
  shelfEmpty.hidden = hasCards;
  clearOpen.hidden = !hasCards;
  shelfSort.disabled = !hasCards;
  if (!hasCards) confirmBox.hidden = true;
  shelfLine.textContent = hasCards
    ? `You saved ${cards.length} of ${PROFESSIONS.length} cards.`
    : "Nothing saved yet.";
}

function removeCard(id, column) {
   shelfIds = shelfIds.filter((savedId) => savedId !== id);
  saveStored(SHELF_STORAGE_KEY, shelfIds);
  updateShelfBadge();

  const finish = () => render();
  if (column) {
    $(column).stop(true, true).fadeOut(250, finish);
  } else {
    finish();
  }
}


shelfGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".remove");
  if (!button) return;
  const id = Number(button.dataset.id);
  const column = button.closest("[data-id]");
  button.disabled = true;
  removeCard(id, column);
});

shelfSort.addEventListener("change", () => {
  shelfOrder = shelfSort.value;
  render();
});

shelfToolbar.addEventListener("submit", (event) => event.preventDefault());

clearOpen.addEventListener("click", () => {
  $(confirmBox).stop(true, true).hide();
  confirmBox.hidden = false;
  $(confirmBox).slideDown(200);
  clearYes.focus();
});

clearNo.addEventListener("click", () => {
  $(confirmBox).stop(true, true).slideUp(200, () => {
    confirmBox.hidden = true;
  });
  clearOpen.focus();
});

clearYes.addEventListener("click", () => {
  shelfIds = [];
  saveStored(SHELF_STORAGE_KEY, shelfIds);
  confirmBox.hidden = true;
  render();
});

window.addEventListener("storage", (event) => {
  if (event.key === SHELF_STORAGE_KEY) render();
});

render();
