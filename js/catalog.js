"use strict";

const SHELF_KEY = "fh-shelf";

const grid = document.querySelector("#grid");
const searchInput = document.querySelector("#search");
const sortSelect = document.querySelector("#sort");
const chipsBox = document.querySelector("#chips");
const savedButton = document.querySelector("#saved-only");
const savedCount = document.querySelector("#saved-count");
const resultLine = document.querySelector("#result-line");
const emptyBox = document.querySelector("#empty");
const toolbar = document.querySelector("#toolbar");

let query = "";
let drawer = "All";
let sortOrder = "name";
let savedOnly = false;
let saved = loadStored(SHELF_KEY, []);

function matches(profession) {
  if (drawer !== "All" && profession.drawer !== drawer) return false;
  if (savedOnly && !saved.includes(profession.id)) return false;
  if (query === "") return true;
  const text = [
    profession.name,
    profession.description,
    profession.replacedBy,
    profession.where,
    profession.drawer,
  ]
    .join(" ")
    .toLowerCase();
  return text.includes(query);
}

function compare(a, b) {
  if (sortOrder === "early") return a.vanished - b.vanished || a.name.localeCompare(b.name);
  if (sortOrder === "late") return b.vanished - a.vanished || a.name.localeCompare(b.name);
  return a.name.localeCompare(b.name);
}

function highlight(element, text) {

  element.textContent = "";
  const index = query === "" ? -1 : text.toLowerCase().indexOf(query);
  if (index === -1) {
    element.textContent = text;
    return;
  }
  const mark = document.createElement("mark");
  mark.textContent = text.slice(index, index + query.length);
  element.append(text.slice(0, index), mark, text.slice(index + query.length));
}

function createCard(profession) {
  const column = document.createElement("div");
  column.className = "col-12 col-md-6 col-lg-4";

  const card = document.createElement("article");
  card.className = "file book";

  const number = document.createElement("span");
  number.className = "no";
  number.textContent = "No. " + String(profession.id).padStart(2, "0");

  const photo = document.createElement("div");
  photo.className = "photo";
  photo.append(makeIcon(profession, "big"), makeImage(profession));

  const title = document.createElement("h3");
  highlight(title, profession.name);

  const era = document.createElement("p");
  era.className = "era";
  era.textContent = profession.period;

  const text = document.createElement("p");
  highlight(text, profession.description);

  const sub = document.createElement("p");
  sub.className = "sub";
  sub.textContent = "Replaced by " + profession.replacedBy + ".";

  const details = document.createElement("p");
  details.className = "book-details";
  details.id = "details-" + profession.id;
  const where = document.createElement("strong");
  where.textContent = "Where: ";
  const years = document.createElement("strong");
  years.textContent = "Years: ";
  details.append(
    where,
    profession.where,
    document.createElement("br"),
    years,
    `about ${profession.from} to ${profession.vanished}`,
    ` (${profession.vanished - profession.from} years)`,
  );

  const actions = document.createElement("div");
  actions.className = "book-actions";

  const more = document.createElement("button");
  more.type = "button";
  more.className = "more";
  more.setAttribute("aria-expanded", "false");
  more.setAttribute("aria-controls", details.id);
  more.dataset.id = profession.id;
  more.textContent = "Details";

  const save = document.createElement("button");
  save.type = "button";
  save.className = "save";
  save.dataset.id = profession.id;
  const isSaved = saved.includes(profession.id);
  save.setAttribute("aria-pressed", String(isSaved));
  save.setAttribute("aria-label", `Save ${profession.name} to my shelf`);
  save.textContent = isSaved ? "♥ Saved" : "♡ Save";

  actions.append(more, save);
  card.append(number, photo, title, era, text, sub, details, actions);
  column.append(card);
  return column;
}

function describeResult(count) {
  if (count === 0) return "Nothing found.";
  const base = `Showing ${count} of ${PROFESSIONS.length} cards`;
  if (count === PROFESSIONS.length) return base + ".";

  const shown = PROFESSIONS.filter(matches);
  const earliest = Math.min(...shown.map((item) => item.vanished));
  return `${base}. The first of them vanished around ${earliest}.`;
}

function render() {
  const visible = PROFESSIONS.filter(matches).sort(compare);
  grid.replaceChildren(...visible.map(createCard));
  $(grid).stop(true, true).hide().fadeIn(250);

  resultLine.textContent = describeResult(visible.length);
  savedCount.textContent = saved.length;
  emptyBox.hidden = visible.length > 0;

  if (visible.length === 0) {
    const title = document.querySelector("#empty-title");
    const text = document.querySelector("#empty-text");
    if (savedOnly && saved.length === 0 && query === "" && drawer === "All") {
      title.textContent = "Your shelf is empty";
      text.textContent = "Press “♡ Save” on a card and it will wait for you here.";
    } else if (query !== "") {
      title.textContent = `No card matches “${searchInput.value.trim()}”`;
      text.textContent = "Check the spelling, try a shorter word, or clear the filters.";
    } else {
      title.textContent = "This drawer is empty";
      text.textContent = "Try another drawer or switch off “My shelf”.";
    }
  }
}

function renderChips() {
  const names = ["All", ...getDrawers()];
  const buttons = names.map((name) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.drawer = name;
    chip.setAttribute("aria-pressed", String(name === drawer));
    const count =
      name === "All" ? PROFESSIONS.length : PROFESSIONS.filter((p) => p.drawer === name).length;
    chip.textContent = `${name} (${count})`;
    return chip;
  });
  chipsBox.replaceChildren(...buttons);
}

function resetFilters() {
  query = "";
  drawer = "All";
  savedOnly = false;
  searchInput.value = "";
  savedButton.setAttribute("aria-pressed", "false");
  renderChips();
  render();
}

searchInput.addEventListener("input", () => {
  query = searchInput.value.trim().toLowerCase();
  render();
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    searchInput.value = "";
    query = "";
    render();
  }
});

toolbar.addEventListener("submit", (event) => event.preventDefault());

sortSelect.addEventListener("change", () => {
  sortOrder = sortSelect.value;
  render();
});

chipsBox.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  drawer = chip.dataset.drawer;
  renderChips();
  render();
});

savedButton.addEventListener("click", () => {
  savedOnly = !savedOnly;
  savedButton.setAttribute("aria-pressed", String(savedOnly));
  render();
});

document.querySelector("#reset").addEventListener("click", resetFilters);

grid.addEventListener("click", (event) => {
  const save = event.target.closest(".save");
  if (save) {
    const id = Number(save.dataset.id);
    const position = saved.indexOf(id);
    if (position === -1) saved.push(id);
    else saved.splice(position, 1);
    saveStored(SHELF_KEY, saved);

    if (savedOnly) {
      render();
    } else {
      const isSaved = position === -1;
      save.setAttribute("aria-pressed", String(isSaved));
      save.textContent = isSaved ? "♥ Saved" : "♡ Save";
      savedCount.textContent = saved.length;
    }
    return;
  }

  const more = event.target.closest(".more");
  if (more) {
    const $details = $("#details-" + more.dataset.id);
    const opening = more.getAttribute("aria-expanded") === "false";
    more.setAttribute("aria-expanded", String(opening));
    more.textContent = opening ? "Hide details" : "Details";
    $details.stop(true, true).slideToggle(250);
  }
});

const startQuery = new URLSearchParams(window.location.search).get("q");
if (startQuery) {
  searchInput.value = startQuery;
  query = startQuery.trim().toLowerCase();
}

renderChips();
render();
