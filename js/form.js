"use strict";

const MIN_WORDS = 15;
const MAX_WORDS = 120;
const MIN_YEAR = 1500;
const MAX_YEAR = new Date().getFullYear();
const CARDS_KEY = "fh-visitor-cards";
const KIND_LABELS = { story: "Family story", new: "New profession", fix: "Correction" };
const FIELD_NAMES = ["name", "email", "kind", "job", "year", "story", "consent"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const form = document.querySelector("#story-form");
const successBox = document.querySelector("#success");
const cardsList = document.querySelector("#cards-list");
const clearButton = document.querySelector("#clear-cards");
const counter = document.querySelector("#story-count");
const fields = {};
FIELD_NAMES.forEach((name) => {
  fields[name] = document.querySelector("#" + name);
});
const touched = new Set();

function countWords(text) {
  const clean = text.trim();
  return clean === "" ? 0 : clean.split(/\s+/).length;
}

function jobExists(value) {
  return PROFESSIONS.some((item) => item.name.toLowerCase() === value.toLowerCase());
}

const rules = {
  name: () => {
    const value = fields.name.value.trim();
    if (value === "") return "Please enter your name.";
    if (value.length < 2) return "The name needs at least 2 letters.";
    if (/\d/.test(value)) return "The name cannot contain digits.";
    return "";
  },

  email: () => {
    const value = fields.email.value.trim();
    if (value === "") return "Please enter your email.";
    if (!EMAIL_PATTERN.test(value)) return "Enter a valid email, for example name@example.com.";
    return "";
  },

  kind: () => "",

  job: () => {
    const value = fields.job.value.trim();
    if (value === "") return "Please enter the name of the profession.";
    if (value.length < 3) return "The profession name is too short.";
    const exists = jobExists(value);
    if (fields.kind.value === "new" && exists) {
      return "This profession is already in the catalog. Choose another one or change the type.";
    }
    if (fields.kind.value !== "new" && !exists) {
      return "We cannot find it in the catalog. Check the spelling or choose “A new profession”.";
    }
    return "";
  },

  year: () => {
    const text = fields.year.value.trim();
    if (text === "") return "Please enter a year.";
    const year = Number(text);
    if (!Number.isInteger(year)) return "The year must be a whole number.";
    if (year < MIN_YEAR || year > MAX_YEAR) {
      return `Enter a year from ${MIN_YEAR} to ${MAX_YEAR}.`;
    }
    return "";
  },

  story: () => {
    const words = countWords(fields.story.value);
    if (words === 0) return "Please tell us a little more.";
    if (words < MIN_WORDS) return `Write at least ${MIN_WORDS} words (now ${words}).`;
    if (words > MAX_WORDS) return `Please keep it under ${MAX_WORDS} words (now ${words}).`;
    return "";
  },

  consent: () => (fields.consent.checked ? "" : "Please confirm that we may publish your text."),
};

function validateField(name) {
  const message = rules[name]();
  const field = fields[name];
  document.querySelector("#" + name + "-error").textContent = message;
  field.classList.toggle("is-invalid", message !== "");
  field.classList.toggle("is-valid", message === "" && name !== "consent" && name !== "kind");
  field.setAttribute("aria-invalid", message !== "" ? "true" : "false");
  return message === "";
}

function updateCounter() {
  const words = countWords(fields.story.value);
  counter.textContent = `${words} words (from ${MIN_WORDS} to ${MAX_WORDS})`;
  counter.classList.toggle("is-ok", words >= MIN_WORDS && words <= MAX_WORDS);
}

const dependents = { kind: "job" };

FIELD_NAMES.forEach((name) => {
  const field = fields[name];

  field.addEventListener("blur", () => {
    touched.add(name);
    validateField(name);
  });

  const liveEvent = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input";
  field.addEventListener(liveEvent, () => {
    if (name === "story") updateCounter();
    updatePreview();
    if (touched.has(name)) validateField(name);
    const dependent = dependents[name];
    if (dependent && touched.has(dependent)) validateField(dependent);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const invalid = FIELD_NAMES.filter((name) => {
    touched.add(name);
    return !validateField(name);
  });

  if (invalid.length > 0) {
    fields[invalid[0]].focus();
    return;
  }

  const card = {
    id: Date.now(),
    name: fields.name.value.trim(),
    kind: fields.kind.value,
    job: fields.job.value.trim(),
    year: Number(fields.year.value),
    story: fields.story.value.trim(),
  };
  const cards = loadStored(CARDS_KEY, []);
  cards.unshift(card);
  saveStored(CARDS_KEY, cards.slice(0, 6));

  showSuccess(card);
  resetForm();
  renderCards();
});

function showSuccess(card) {
  const code = "FH-" + (Math.floor(Math.random() * 9000) + 1000);
  const title = document.createElement("h2");
  title.textContent = `Thank you, ${card.name.split(/\s+/)[0]}!`;
  const text = document.createElement("p");
  text.textContent =
    `Your ${KIND_LABELS[card.kind].toLowerCase()} about “${card.job}” (${card.year}) ` +
    "is now a card in the reading room.";
  const number = document.createElement("p");
  number.className = "code";
  number.textContent = "Submission number: " + code;
  successBox.replaceChildren(title, text, number);

  $(successBox).stop(true, true).hide().slideDown(300).trigger("focus");

  $(successBox).delay(7000).fadeOut(600);
}

function resetForm() {
  form.reset();
  touched.clear();
  FIELD_NAMES.forEach((name) => {
    fields[name].classList.remove("is-invalid", "is-valid");
    fields[name].removeAttribute("aria-invalid");
    document.querySelector("#" + name + "-error").textContent = "";
  });
  updateCounter();
  updatePreview();
}

function setPreview(id, text, fallback) {
  const element = document.querySelector("#" + id);
  const clean = text.trim();
  element.textContent = clean || fallback;
  element.classList.toggle("is-placeholder", clean === "");
}

function updatePreview() {
  setPreview("pv-kind", KIND_LABELS[fields.kind.value], "");
  setPreview("pv-job", fields.job.value, "Profession name");
  setPreview("pv-year", fields.year.value, "Year");
  const story = fields.story.value.trim();
  setPreview(
    "pv-story",
    story.length > 160 ? story.slice(0, 160) + "…" : story,
    "Your story will appear here as you type.",
  );
  setPreview("pv-name", fields.name.value ? "by " + fields.name.value.trim() : "", "by your name");

  const known = PROFESSIONS.find(
    (item) => item.name.toLowerCase() === fields.job.value.trim().toLowerCase(),
  );
  const photo = document.querySelector("#pv-photo");
  if (known) {
    photo.replaceChildren(makeIcon(known, "big"), makeImage(known));
  } else {
    photo.replaceChildren(makeIconByName("bi-journal-text big"));
  }
}

function createVisitorCard(card) {
  const article = document.createElement("article");
  article.className = "visitor-card";

  const title = document.createElement("h3");
  title.textContent = card.job;
  const meta = document.createElement("p");
  meta.className = "era";
  meta.textContent = `${KIND_LABELS[card.kind]} · ${card.year}`;
  const story = document.createElement("p");
  story.textContent = card.story.length > 140 ? card.story.slice(0, 140) + "…" : card.story;
  const by = document.createElement("p");
  by.textContent = "by " + card.name;

  article.append(title, meta, story, by);
  return article;
}

function renderCards() {
  const cards = loadStored(CARDS_KEY, []);
  clearButton.hidden = cards.length === 0;
  if (cards.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cards-empty";
    empty.textContent = "No cards yet. Send a story and yours will be the first one here.";
    cardsList.replaceChildren(empty);
    return;
  }
  cardsList.replaceChildren(...cards.map(createVisitorCard));
}

clearButton.addEventListener("click", () => {
  saveStored(CARDS_KEY, []);
  renderCards();
});

const FAQ = [
  {
    q: "Who reads the cards?",
    a: "Every card is read by the librarians before it joins the catalog. On this demo site the cards stay in your own browser.",
  },
  {
    q: "What if my job is not in the catalog?",
    a: "Choose “A new profession for the catalog” and write what you know. The more details you give, the better.",
  },
  {
    q: "How long should my story be?",
    a: `From ${MIN_WORDS} to ${MAX_WORDS} words: a short paragraph is enough.`,
  },
  {
    q: "Can I correct a mistake?",
    a: "Yes. Choose “A correction”, name the profession and say what should change.",
  },
];

const faqBox = document.querySelector("#faq");
FAQ.forEach((item, index) => {
  const wrapper = document.createElement("div");
  wrapper.className = "faq-item";

  const question = document.createElement("button");
  question.type = "button";
  question.className = "faq-q";
  question.id = "faq-q-" + index;
  question.setAttribute("aria-expanded", "false");
  question.setAttribute("aria-controls", "faq-a-" + index);
  const label = document.createElement("span");
  label.textContent = item.q;
  question.append(label, makeIconByName("bi-plus-lg"));

  const answer = document.createElement("p");
  answer.className = "faq-a";
  answer.id = "faq-a-" + index;
  answer.setAttribute("role", "region");
  answer.setAttribute("aria-labelledby", question.id);
  answer.textContent = item.a;

  wrapper.append(question, answer);
  faqBox.append(wrapper);
});

function makeIconByName(className) {
  const icon = document.createElement("i");
  icon.className = "bi " + className;
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

$(faqBox).on("click", ".faq-q", function () {
  const $question = $(this);
  const opening = $question.attr("aria-expanded") === "false";

  $(faqBox).find(".faq-q").attr("aria-expanded", "false");
  $(faqBox).find(".faq-a").stop(true, true).slideUp(220);
  if (opening) {
    $question.attr("aria-expanded", "true");
    $("#" + $question.attr("aria-controls"))
      .stop(true, true)
      .slideDown(220);
  }
});

const datalist = document.querySelector("#job-list");
PROFESSIONS.forEach((item) => {
  const option = document.createElement("option");
  option.value = item.name;
  datalist.append(option);
});

updateCounter();
updatePreview();
renderCards();
