/* ==========================================================================
   Shuvam Overseas Employment PVT.LTD - Scroll & Motion Animations
   --------------------------------------------------------------------------
   - Fade-in-on-scroll for every .reveal element, fired ONCE via
     IntersectionObserver (re-animating on every scroll-by fights the reader).
   - Directional variants: [data-reveal="left|right"] slide in from that side;
     the default is an upward fade. CSS owns the transition; JS only toggles
     the .is-visible state, so motion stays in one place and prefers-reduced-
     motion stays trivially honoured by the stylesheet.
   - Optional staggered entrance: wrap a group in [data-stagger]; each child
     gets a 60ms cascade (capped) so the group reveals as one orchestrated
     moment.
   - Home hero entrance is driven by [data-intro] (see CSS); the class is
     applied here after a tick so it plays once on load.
   - Page loader: hidden as soon as the window finishes loading (with a
     fallback timer so it can never block the page), or immediately for
     reduced-motion users.
   - Scroll progress bar: tracks reading position along the viewport top.
   - Parallax: inner-page hero media drift gently as the page scrolls.
    - Stats: [data-count] numbers rebuild into a rolling odometer when
      motion is allowed, gated on the loader so the roll can't finish
      unseen on tall viewports; reduced motion gets a short text count-up
      instead (content change only - no spatial motion).
    - Respects prefers-reduced-motion (CSS already neutralises transforms;
      JS reveals everything immediately and skips transform-based motion).
    ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -- Home hero: one orchestrated load ------------------------------------ */
  var hero = document.querySelector(".hero[data-intro]");
  if (hero) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("is-intro");
      });
    });
  }

  /* -- Page loader ---------------------------------------------------------- */
  var loader = document.querySelector(".page-loader");
  var loaderDone = false;
  var loaderCbs = [];
  // Run cb once the loader has lifted (immediately if it already has).
  function afterLoader(cb) {
    if (loaderDone) cb();
    else loaderCbs.push(cb);
  }
  function dismissLoader() {
    if (loaderDone) return;
    loaderDone = true;
    var cbs = loaderCbs;
    loaderCbs = [];
    for (var i = 0; i < cbs.length; i++) cbs[i]();
    if (!loader || loader.classList.contains("is-done")) return;
    if (reduceMotion) {
      loader.remove();
    } else {
      loader.classList.add("is-done");
      window.setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 600);
    }
  }
  if (document.readyState === "complete") {
    dismissLoader();
  } else {
    window.addEventListener("load", dismissLoader);
  }
  // Safety net: never let the loader outstay its welcome.
  window.setTimeout(dismissLoader, 3000);

  /* -- Group stagger ------------------------------------------------------- */
  function applyStagger(group) {
    var children = group.children;
    for (var i = 0; i < children.length; i++) {
      // A staggered group is an orchestrated entrance: make sure each child
      // is reveal-able (markup may not carry the class), then cascade the
      // delay. Cap the cascade so the last items don't wait too long.
      var child = children[i];
      if (!child.classList.contains("reveal")) child.classList.add("reveal");
      child.style.transitionDelay = Math.min(i * 60, 360) + "ms";
    }
  }

  document.querySelectorAll("[data-stagger]").forEach(applyStagger);

  /* -- Scroll reveal ------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");

  function show(el) {
    el.classList.add("is-visible");
    // Drop the compositing hint once the entrance has settled.
    window.setTimeout(function () {
      el.style.willChange = "auto";
    }, 900);
  }

  /* -- Scroll progress bar -------------------------------------------------- */
  var progress = document.querySelector(".scroll-progress");
  var progressTick = false;

  function updateProgress() {
    progressTick = false;
    if (!progress) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  }

  function requestProgress() {
    if (progressTick) return;
    progressTick = true;
    window.requestAnimationFrame(updateProgress);
  }

  if (progress) {
    window.addEventListener("scroll", requestProgress, { passive: true });
    window.addEventListener("resize", requestProgress, { passive: true });
    updateProgress();
  }

  /* -- Parallax on inner-page hero media ------------------------------------ */
  // Motion is reserved for fine-pointer devices: on phones/tablets the
  // transform loop adds GPU work for a barely-visible effect, and the
  // oversized media is better returned to a normal, sharp crop.
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var parallaxEls = finePointer
    ? document.querySelectorAll(".page-hero__media[data-parallax]")
    : [];
  var parallaxTick = false;

  function updateParallax() {
    parallaxTick = false;
    if (!parallaxEls.length) return;
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var offset = (rect.top + rect.height / 2 - vh / 2) * -0.12;
      el.style.transform = "translate3d(0, " + offset.toFixed(1) + "px, 0)";
    });
  }

  function requestParallax() {
    if (parallaxTick) return;
    parallaxTick = true;
    window.requestAnimationFrame(updateParallax);
  }

  if (parallaxEls.length) {
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax, { passive: true });
    updateParallax();
  }

  /* -- Stats: odometer roll / reduced-motion text count --------------------- */
  // Markup ships the final value as plain text (no-JS always gets the truth).
  // Motion allowed: rebuild into digit columns at load (they read 0s), roll
  // them when the strip is in view AND the loader is gone - on tall
  // viewports the stats sit above the fold, so without the gate the roll
  // would finish behind the loader before anyone sees it.
  // Reduced motion: rAF text count only - content changes, no transforms,
  // so it stays inside "fewer and gentler, not zero".
  function countUp(el, duration) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;
    var start = null;
    el.textContent = "0" + suffix;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  function buildOdo(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return null;
    var value = target.toLocaleString("en-US"); // "4,500"
    el.setAttribute("aria-label", value + suffix);
    el.textContent = "";
    var odo = document.createElement("span");
    odo.className = "odo";
    odo.setAttribute("aria-hidden", "true");
    var strips = [];
    for (var i = 0; i < value.length; i++) {
      var ch = value.charAt(i);
      if (ch === ",") {
        var sep = document.createElement("span");
        sep.className = "odo__sep";
        sep.textContent = ",";
        odo.appendChild(sep);
        continue;
      }
      var digit = ch.charCodeAt(0) - 48;
      var col = document.createElement("span");
      col.className = "odo__col";
      var strip = document.createElement("span");
      strip.className = "odo__strip";
      var cells = "";
      for (var spin = 0; spin < 2; spin++) {
        for (var n = 0; n <= 9; n++) cells += "<span>" + n + "</span>";
      }
      for (var d = 0; d <= digit; d++) cells += "<span>" + d + "</span>";
      strip.innerHTML = cells;
      // Rest position: two full 0-9 spins + the target digit, measured in
      // cell heights (each cell is 1.05em - see .odo__strip span in CSS).
      strip.__end = "-" + ((20 + digit) * 1.05) + "em";
      strip.style.transitionDelay = Math.min(strips.length * 70, 350) + "ms";
      col.appendChild(strip);
      odo.appendChild(col);
      strips.push(strip);
    }
    if (suffix) {
      var suf = document.createElement("span");
      suf.className = "odo__suffix";
      suf.textContent = suffix;
      odo.appendChild(suf);
    }
    el.appendChild(odo);
    return strips;
  }

  function rollOdo(strips) {
    // Double rAF so the browser paints the resting 0s first; without it
    // the transition can be coalesced away.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        strips.forEach(function (strip) {
          strip.style.transform = "translate3d(0, " + strip.__end + ", 0)";
        });
      });
    });
  }

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    if (!reduceMotion) {
      counters.forEach(function (el) {
        el.__odo = buildOdo(el);
      });
    }
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          countObserver.unobserve(el);
          if (reduceMotion) {
            countUp(el, 1000);
          } else if (el.__odo) {
            afterLoader(function () {
              rollOdo(el.__odo);
            });
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) {
      countObserver.observe(el);
    });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // Reduced motion or old browser: show everything, no animation.
    revealEls.forEach(show);
    // ...including anything steps-data.js renders after this file runs.
    document.addEventListener("so:render", function () {
      document.querySelectorAll("[data-stagger]").forEach(applyStagger);
      document.querySelectorAll(".reveal").forEach(show);
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target); // fire once
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });

  /* -- Late-rendered content (steps-data.js fires so:render) --------------- */
  // Data-rendered cards exist only after DOMContentLoaded, so observe them
  // once they appear; without this they stay at opacity 0 forever.
  document.addEventListener("so:render", function () {
    document.querySelectorAll("[data-stagger]").forEach(applyStagger);
    document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
      observer.observe(el);
    });
  });
})();
