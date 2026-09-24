/* ==========================================================================
   Shuvam Overseas Employment PVT.LTD - Navigation
   --------------------------------------------------------------------------
   1. Mobile menu toggle (hamburger) - aria-expanded, close on link click,
      Escape, and outside click.
   2. Header "scrolled" state - adds a hairline + shadow once the page moves,
      so the translucent bar reads as floating chrome.
   ========================================================================== */

(function () {
  "use strict";

  var header = document.querySelector(".header");
  var toggle = document.querySelector(".nav__toggle");
  var nav = document.querySelector(".nav");

  /* -- Scroll state -------------------------------------------------------- */
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) {
      header.setAttribute("data-scrolled", "");
    } else {
      header.removeAttribute("data-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* -- Mobile menu --------------------------------------------------------- */
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close when a nav link is chosen (mobile)
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    // Close on Escape
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });

    // Close on outside click
    document.addEventListener("click", function (event) {
      if (nav.classList.contains("is-open") && !event.target.closest(".header")) {
        setMenu(false);
      }
    });

    // Close if the viewport is resized up past the breakpoint
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) setMenu(false);
    });
  }
})();
