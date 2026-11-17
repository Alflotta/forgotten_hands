"use strict";
const SHELF_STORAGE_KEY = "fh-shelf";

function getShelfIds() {
  const ids = loadStored(SHELF_STORAGE_KEY, []);
  if (!Array.isArray(ids)) return [];
  return ids.filter((id) => PROFESSIONS.some((item) => item.id === id));
}

function updateShelfBadge() {
  const total = getShelfIds().length;
  document.querySelectorAll("[data-shelf-count]").forEach((badge) => {
    badge.textContent = total;
    badge.classList.toggle("is-empty", total === 0);
  });
}

updateShelfBadge();
window.addEventListener("storage", (event) => {
  if (event.key === SHELF_STORAGE_KEY) updateShelfBadge();
});

$(function () {
  const $page = $("html, body");

  $('a[href^="#"]').on("click", function (event) {
    const id = this.getAttribute("href");
    if (id.length < 2) return;
    const $target = $(id);
    if ($target.length === 0) return;
    event.preventDefault();
    $page.stop(true).animate({ scrollTop: $target.offset().top - 70 }, 500, function () {
      $target.attr("tabindex", "-1").trigger("focus");
    });
  });

  const $toTop = $(
    '<button class="to-top" type="button" aria-label="Back to top"><i class="bi bi-arrow-up" aria-hidden="true"></i></button>',
  ).appendTo("body");

  $toTop.on("click", function () {
    $page.stop(true).animate({ scrollTop: 0 }, 500);
  });

  let visible = false;
  $(window).on("scroll", function () {
    const shouldShow = $(window).scrollTop() > 400;
    if (shouldShow === visible) return;
    visible = shouldShow;
    $toTop.stop(true, true)[shouldShow ? "fadeIn" : "fadeOut"](250);
  });
});
