"use strict";

const COLUMNS = [
  { key: "name", label: "Profession", type: "text" },
  { key: "period", label: "Period", type: "text" },
  { key: "where", label: "Where", type: "text" },
  { key: "replacedBy", label: "Replaced by", type: "text" },
  { key: "vanished", label: "Vanished", type: "number" },
];

const headRow = document.querySelector("#head-row");
const body = document.querySelector("#compare-body");
const table = document.querySelector("#compare-table");
const yearInput = document.querySelector("#year");
const yearOut = document.querySelector("#year-out");
const onlyAlive = document.querySelector("#only-alive");
const stats = document.querySelector("#compare-stats");
const emptyBox = document.querySelector("#compare-empty");

let sortKey = "vanished";
let sortDirection = 1;
let year = Number(yearInput.value);

function existedIn(profession, chosenYear) {
  return profession.from <= chosenYear && chosenYear < profession.vanished;
}

function sortedRows() {
  const column = COLUMNS.find((item) => item.key === sortKey);
  const rows = PROFESSIONS.slice();
  rows.sort((a, b) => {
    const result =
      column.type === "number" ? a[sortKey] - b[sortKey] : a[sortKey].localeCompare(b[sortKey]);
    return result * sortDirection;
  });
  return rows;
}

function renderHead() {
  const cells = COLUMNS.map((column) => {
    const th = document.createElement("th");
    th.scope = "col";
    const active = column.key === sortKey;
    th.setAttribute(
      "aria-sort",
      active ? (sortDirection === 1 ? "ascending" : "descending") : "none",
    );

    const button = document.createElement("button");
    button.type = "button";
    button.className = "sort-btn";
    button.dataset.key = column.key;
    button.append(column.label + " ");
    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = active ? (sortDirection === 1 ? "▲" : "▼") : "";
    button.append(arrow);
    th.append(button);
    return th;
  });

  const state = document.createElement("th");
  state.scope = "col";
  state.textContent = "In " + year;
  cells.push(state);
  headRow.replaceChildren(...cells);
}

function createRow(profession) {
  const alive = existedIn(profession, year);
  const row = document.createElement("tr");
  row.className = alive ? "is-alive" : "is-gone";

  const name = document.createElement("th");
  name.scope = "row";
  name.append(makeIcon(profession), profession.name);
  row.append(name);

  for (const key of ["period", "where", "replacedBy"]) {
    const cell = document.createElement("td");
    cell.textContent = profession[key];
    row.append(cell);
  }

  const vanished = document.createElement("td");
  vanished.textContent = "~" + profession.vanished;
  row.append(vanished);

  const status = document.createElement("td");
  status.className = "status";
  if (alive) status.textContent = "at work";
  else if (year < profession.from) status.textContent = "not yet";
  else status.textContent = "vanished";
  row.append(status);
  return row;
}

function render() {
  yearOut.textContent = year;
  renderHead();

  let rows = sortedRows();
  const aliveCount = rows.filter((item) => existedIn(item, year)).length;
  if (onlyAlive.checked) rows = rows.filter((item) => existedIn(item, year));

  body.replaceChildren(...rows.map(createRow));
  emptyBox.hidden = rows.length > 0;
  table.hidden = rows.length === 0;

  const goneCount = PROFESSIONS.filter((item) => item.vanished <= year).length;
  stats.textContent =
    `In ${year}: ${aliveCount} of ${PROFESSIONS.length} jobs at work, ` +
    `${goneCount} already vanished.`;
}

headRow.addEventListener("click", (event) => {
  const button = event.target.closest(".sort-btn");
  if (!button) return;
  if (sortKey === button.dataset.key) {
    sortDirection = -sortDirection;
  } else {
    sortKey = button.dataset.key;
    sortDirection = 1;
  }
  render();
});

yearInput.addEventListener("input", () => {
  year = Number(yearInput.value);
  render();
});

onlyAlive.addEventListener("change", render);

render();
