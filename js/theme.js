"use strict";

/* Light / dark mode. This file is loaded in <head>, so the saved mode
   is applied before the page is painted (no flash of the wrong theme). */
(function () {
  const KEY = "fh-theme";
  const root = document.documentElement;

  function readTheme() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved === "light" || saved === "dark") return saved;
    } catch (error) {
      /* empty or blocked storage: use the default */
    }
    return "dark";
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(KEY, JSON.stringify(theme));
    } catch (error) {
      /* the mode still works for this visit */
    }
  }

  function applyTheme(theme) {
    root.setAttribute("data-bs-theme", theme);
    const button = document.querySelector("#theme-toggle");
    if (!button) return;
    const isLight = theme === "light";
    button.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    button.querySelector("i").className = isLight ? "bi bi-moon-stars-fill" : "bi bi-sun-fill";
    button.querySelector("span").textContent = isLight ? "Night" : "Day";
  }

  applyTheme(readTheme());

  document.addEventListener("DOMContentLoaded", function () {
    const button = document.querySelector("#theme-toggle");
    applyTheme(readTheme());
    if (!button) return;
    button.addEventListener("click", function () {
      const next = root.getAttribute("data-bs-theme") === "light" ? "dark" : "light";
      saveTheme(next);
      applyTheme(next);
    });
  });

  /* keep other open tabs in step */
  window.addEventListener("storage", function (event) {
    if (event.key === KEY) applyTheme(readTheme());
  });
})();
