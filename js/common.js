"use strict";

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
