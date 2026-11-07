"use strict";

const STEP = 30;
const BEAM_CENTER = 24;
const SPEED = 30;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hero = document.querySelector("#hero");
const ring = document.querySelector("#ring");
const tower = document.querySelector("#tower");
const randomButton = document.querySelector("#random-job");
const cardBox = document.querySelector("#tile-card");
const $card = $(cardBox);

let angle = 0;
let mode = "spinning";
let lastTime = null;
let aim = null;
let activeIndex = -1;
let resumeTimer = null;
const tiles = [];

function normalize(degrees) {
  return ((degrees % 360) + 360) % 360;
}

function tileAngle(index) {
  return (index - (PROFESSIONS.length - 1) / 2) * STEP;
}

function visibility(relative) {
  if (relative > 56) return 0;
  if (relative < 10) return relative / 10;
  if (relative > 42) return (56 - relative) / 14;
  return 1;
}

function nearestIndex() {
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < PROFESSIONS.length; i++) {
    const relative = normalize(tileAngle(i) - angle);
    const distance = Math.abs(relative - BEAM_CENTER);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function createTile(profession, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tile";
  button.style.setProperty("--i", index);
  button.setAttribute(
    "aria-label",
    `${profession.name}: until about ${profession.vanished}, replaced by ${profession.replacedBy}`,
  );

  const pic = document.createElement("span");
  pic.className = "pic";
  pic.append(makeIcon(profession), makeImage(profession));

  const caption = document.createElement("span");
  caption.className = "cap";
  caption.textContent = profession.name;

  button.append(pic, caption);

  button.addEventListener("click", () => aimAt(index));
  return button;
}

PROFESSIONS.forEach((profession, index) => {
  const tile = createTile(profession, index);
  tiles.push(tile);
  ring.append(tile);
});

function showCard(index) {
  const profession = PROFESSIONS[index];
  activeIndex = index;
  tiles.forEach((tile, i) => tile.classList.toggle("is-active", i === index));

  const title = document.createElement("h2");
  title.textContent = profession.name;

  const years = document.createElement("p");
  years.className = "tc-years";
  years.textContent = `${profession.from} – ${profession.vanished}`;

  const gone = document.createElement("p");
  gone.textContent = `Vanished around ${profession.vanished}.`;

  const replaced = document.createElement("p");
  replaced.append("Replaced by ");
  const strong = document.createElement("strong");
  strong.textContent = profession.replacedBy;
  replaced.append(strong, ".");

  const links = document.createElement("div");
  links.className = "tc-links";
  const more = document.createElement("a");
  more.href = "catalog.html?q=" + encodeURIComponent(profession.name);
  more.textContent = "See the card";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "tc-close";
  close.textContent = "Keep exploring";
  close.addEventListener("click", resume);
  links.append(more, close);

  cardBox.replaceChildren(title, years, gone, replaced, links);
  placeCard(tiles[index]);
}

function placeCard(tile) {

  $card.stop(true, true).css({ display: "block", visibility: "hidden" });
  const heroBox = hero.getBoundingClientRect();
  const tileBox = tile.getBoundingClientRect();
  const width = cardBox.offsetWidth;
  const height = cardBox.offsetHeight;

  let left = tileBox.left - heroBox.left + tileBox.width / 2 - width / 2;
  left = Math.max(8, Math.min(left, heroBox.width - width - 8));

  let top = tileBox.bottom - heroBox.top + 30;
  if (top + height > heroBox.height - 20) {
    top = tileBox.top - heroBox.top - height - 10;
  }
  top = Math.max(70, top);

  $card
    .css({ left: left + "px", top: top + "px", visibility: "visible" })
    .hide()
    .fadeIn(180);
}

function hideCard() {
  activeIndex = -1;
  tiles.forEach((tile) => tile.classList.remove("is-active"));
  $card.stop(true, true).fadeOut(150);
}

function aimAt(index) {
  clearTimeout(resumeTimer);
  const target = tileAngle(index) - BEAM_CENTER;
  let delta = normalize(target - angle);
  if (delta > 180) delta -= 360;
  $card.stop(true, true).hide();
  tiles.forEach((tile) => tile.classList.remove("is-active"));
  aim = {
    index: index,
    start: angle,
    delta: delta,
    began: null,
    duration: reduceMotion ? 1 : Math.min(1300, 400 + Math.abs(delta) * 5),
  };
  mode = "aiming";
}

function resume() {
  clearTimeout(resumeTimer);
  hideCard();
  mode = "spinning";
}

function paint() {
  hero.style.setProperty("--a", angle + "deg");
  for (let i = 0; i < tiles.length; i++) {
    const level = reduceMotion ? 1 : visibility(normalize(tileAngle(i) - angle));
    tiles[i].style.opacity = level;
    tiles[i].classList.toggle("is-lit", level > 0.5);
  }
}

function frame(time) {
  const elapsed = lastTime === null ? 0 : Math.min(time - lastTime, 50);
  lastTime = time;

  if (mode === "spinning" && !reduceMotion) {
    angle = normalize(angle + (SPEED * elapsed) / 1000);
  } else if (mode === "aiming") {
    if (aim.began === null) aim.began = time;
    const progress = Math.min((time - aim.began) / aim.duration, 1);
    angle = aim.start + aim.delta * easeInOut(progress);
    if (progress === 1) {
      angle = normalize(angle);
      mode = "locked";
      paint();
      showCard(aim.index);
    }
  }

  paint();
  requestAnimationFrame(frame);
}

tower.addEventListener("click", () => {
  if (mode === "locked") {
    resume();
  } else {
    aimAt(nearestIndex());
  }
});

randomButton.addEventListener("click", () => {
  let index;
  do {
    index = Math.floor(Math.random() * PROFESSIONS.length);
  } while (index === activeIndex);
  aimAt(index);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mode !== "spinning") resume();
});

paint();
requestAnimationFrame(frame);
