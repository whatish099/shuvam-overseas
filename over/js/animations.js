/* ==========================================================================
   Shuvam Overseas - Scroll & Motion Animations
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
   - Respects prefers-reduced-motion (CSS already neutralises transforms;
     JS simply reveals everything immediately and skips motion features).
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
  function dismissLoader() {
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
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var children = group.children;
    for (var i = 0; i < children.length; i++) {
      // A staggered group is an orchestrated entrance: make sure each child
      // is reveal-able (markup may not carry the class), then cascade the
      // delay. Cap the cascade so the last items don't wait too long.
      var child = children[i];
      if (!child.classList.contains("reveal")) child.classList.add("reveal");
      child.style.transitionDelay = Math.min(i * 60, 360) + "ms";
    }
  });

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

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // Reduced motion or old browser: show everything, no animation.
    revealEls.forEach(show);
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
})();
