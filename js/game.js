"use strict";

const LIVES = 3;
const WIN_STREAK = 8;
const BEST_KEY = "fh-best-streak";
const PAUSE = 1700;

const byId = (id) => document.querySelector("#" + id);
const panel = byId("game-panel");
const choiceButtons = document.querySelectorAll("#choices [data-choice]");

let current;
let next;
let lives;
let streak;
let best = loadStored(BEST_KEY, 0);
let gameOver;
let busy;
let advanceTimer = null;

function pickNext(previous) {
  let item;
  do {
    item = PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)];
  } while (item === previous);
  return item;
}

function say(text, kind) {
  const message = byId("message");
  message.textContent = text;
  message.classList.remove("is-right", "is-wrong", "is-warn");
  message.classList.add("is-" + kind);
}

function showCard(prefix, profession, showYear) {
  const photo = byId(prefix + "-photo");
  photo.replaceChildren(makeIcon(profession, "big"), makeImage(profession));
  byId(prefix + "-name").textContent = profession.name;
  byId(prefix + "-year").textContent = showYear
    ? "Vanished around " + profession.vanished
    : "Vanished around ????";
  byId("card-" + prefix).classList.toggle("is-hidden-year", !showYear);
}

function renderLamps() {
  const icons = [];
  for (let i = 0; i < LIVES; i++) {
    const icon = document.createElement("i");
    icon.className = "bi " + (i < lives ? "bi-lightbulb-fill" : "bi-lightbulb is-out");
    icon.setAttribute("aria-hidden", "true");
    icons.push(icon);
  }
  byId("lives").replaceChildren(...icons);
  byId("lives").setAttribute("aria-label", `${lives} of ${LIVES} lamps left`);
}

function render() {
  renderLamps();
  byId("streak").textContent = streak;
  byId("goal").textContent = WIN_STREAK;
  byId("best").textContent = best;
  byId("progress").max = WIN_STREAK;
  byId("progress").value = streak;
  showCard("cur", current, true);
  showCard("next", next, false);
  byId("card-cur").classList.remove("is-right", "is-wrong");
  byId("card-next").classList.remove("is-right", "is-wrong");
  panel.classList.toggle("is-over", gameOver && lives === 0);
  panel.classList.toggle("is-win", gameOver && lives > 0);
  setButtons(!gameOver && !busy);
}

function setButtons(enabled) {
  choiceButtons.forEach((button) => {
    button.disabled = !enabled;
  });
}

function startGame() {
  clearTimeout(advanceTimer);
  lives = LIVES;
  streak = 0;
  gameOver = false;
  busy = false;
  current = pickNext(null);
  next = pickNext(current);
  say("Did the job on the right vanish earlier or later than the one on the left?", "warn");
  byId("game-cards").style.opacity = 1;
  render();
}

function revealYear(profession) {
  const label = byId("next-year");
  byId("card-next").classList.remove("is-hidden-year");
  jQuery({ value: profession.vanished - 60 }).animate(
    { value: profession.vanished },
    {
      duration: 700,
      step: (now) => {
        label.textContent = "Vanished around " + Math.round(now);
      },
      complete: () => {
        label.textContent = "Vanished around " + profession.vanished;
      },
    },
  );
}

function guess(choice) {
  if (gameOver || busy) return;
  if (choice !== "earlier" && choice !== "later") return;

  busy = true;
  setButtons(false);
  const revealed = next;
  const isRight =
    (choice === "later" && revealed.vanished >= current.vanished) ||
    (choice === "earlier" && revealed.vanished <= current.vanished);

  revealYear(revealed);
  byId("card-next").classList.add(isRight ? "is-right" : "is-wrong");

  if (isRight) {
    streak += 1;
    const isRecord = streak > best;
    if (isRecord) {
      best = streak;
      saveStored(BEST_KEY, best);
    }
    say(
      `Right! ${revealed.name} was replaced by ${revealed.replacedBy}.` +
        (isRecord ? " New best streak!" : ""),
      "right",
    );
  } else {
    lives -= 1;
    streak = 0;
    say(`Not this time. ${revealed.name} was replaced by ${revealed.replacedBy}.`, "wrong");
  }

  byId("streak").textContent = streak;
  byId("best").textContent = best;
  byId("progress").value = streak;
  renderLamps();

  if (streak === WIN_STREAK) {
    gameOver = true;
    say(`You win! ${WIN_STREAK} right answers in a row. The lighthouse shines for you.`, "right");
    panel.classList.add("is-win");
    return;
  }
  if (lives === 0) {
    gameOver = true;
    say(`Game over. ${revealed.name} vanished around ${revealed.vanished}. Press “Play again”.`, "wrong");
    panel.classList.add("is-over");
    return;
  }

  advanceTimer = setTimeout(advance, PAUSE);
}

function advance() {
  const $cards = jQuery("#game-cards");
  $cards.stop(true, true).fadeOut(200, function () {
    current = next;
    next = pickNext(current);
    busy = false;
    say("Earlier or later than the job on the left?", "warn");
    render();
    $cards.fadeIn(250);
  });
}

document.querySelector("#choices").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-choice]");
  if (button) guess(button.dataset.choice);
});

byId("restart").addEventListener("click", startGame);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") guess("earlier");
  if (event.key === "ArrowRight") guess("later");
});

startGame();
