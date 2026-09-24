/* ==========================================================================
   Shuvam Overseas Employment PVT.LTD - Site Search
   --------------------------------------------------------------------------
   - <dialog id="site-search"> opened by [data-search-open], closed by
     [data-search-close], Escape (native) or backdrop click.
   - Index is built lazily on first open: fetches the seven content pages
     same-origin, extracts h1/section headings + body text, caches in memory.
   - Live filtering as you type; result count announced via role="status".
   - CSP-safe: no inline handlers; connect-src 'self' covers the fetches.
   ========================================================================== */

(function () {
  "use strict";

  var PAGES = [
    { url: "index.html",   label: { en: "Home",        ne: "गृहपृष्ठ" } },
    { url: "about.html",   label: { en: "About Us",    ne: "हाम्रोबारे" } },
    { url: "team.html",    label: { en: "Team",        ne: "टोली" } },
    { url: "services.html",label: { en: "Services",    ne: "सेवाहरू" } },
    { url: "procedure.html",label:{ en: "Procedure",   ne: "प्रक्रिया" } },
    { url: "contact.html", label: { en: "Contact",     ne: "सम्पर्क" } },
    { url: "privacy.html", label: { en: "Privacy",     ne: "गोपनीयता" } }
  ];

  var dialog = document.getElementById("site-search");
  if (!dialog || !dialog.showModal) return;

  var input = dialog.querySelector("#search-input");
  var resultsEl = dialog.querySelector(".search__results");
  var countEl = dialog.querySelector(".search__count");
  var hintEl = dialog.querySelector(".search__hint");
  var emptyEl = dialog.querySelector(".search__empty");
  var openBtns = document.querySelectorAll("[data-search-open]");
  var closeBtn = dialog.querySelector("[data-search-close]");

  var index = null;
  var buildPromise = null;
  var debounceTimer = null;

  function langNow() {
    return (window.SO_lang && window.SO_lang.get()) || "en";
  }

  function buildIndex() {
    if (index) return Promise.resolve(index);
    if (buildPromise) return buildPromise;

    /* No fetch (very old browser): behave as an empty index, dialog still works */
    if (typeof window.fetch !== "function") {
      index = [];
      return Promise.resolve(index);
    }

    buildPromise = Promise.all(
      PAGES.map(function (page) {
        return fetch(page.url)
          .then(function (r) { return r.ok ? r.text() : ""; })
          .then(function (html) {
            var doc = new DOMParser().parseFromString(html, "text/html");
            var main = doc.querySelector("main") || doc.body;
            var h1 = main.querySelector("h1");
            var headings = [];
            main.querySelectorAll("h2, h3").forEach(function (h) {
              headings.push(h.textContent.trim());
            });
            var body = (main.textContent || "").replace(/\s+/g, " ").trim().slice(0, 8000);
            return {
              url: page.url,
              label: page.label,
              title: h1 ? h1.textContent.trim() : (doc.title || page.url),
              headings: headings.join(" | "),
              body: body
            };
          })
          .catch(function () {
            return {
              url: page.url,
              label: page.label,
              title: page.url,
              headings: "",
              body: ""
            };
          });
      })
    ).then(function (entries) {
      index = entries;
      return index;
    });

    return buildPromise;
  }

  function scoreEntry(entry, q) {
    var hay = (entry.title + " " + entry.headings + " " + entry.body).toLowerCase();
    var idx = hay.indexOf(q);
    if (idx === -1) return -1;
    var score = 1;
    if (entry.title.toLowerCase().indexOf(q) !== -1) score += 4;
    if (entry.headings.toLowerCase().indexOf(q) !== -1) score += 2;
    return score - Math.min(idx / 500, 1); /* earlier matches rank higher */
  }

  function pageLabel(entry) {
    var l = langNow() === "ne" ? entry.label.ne : entry.label.en;
    return l;
  }

  function render(results, q) {
    resultsEl.textContent = "";
    emptyEl.classList.remove("is-visible");

    if (!q) {
      countEl.textContent = "";
      hintEl.removeAttribute("hidden");
      return;
    }

    hintEl.setAttribute("hidden", "");

    if (!results.length) {
      countEl.textContent = "";
      emptyEl.classList.add("is-visible");
      return;
    }

    var n = results.length;
    var word;
    if (window.SO_lang) {
      word = window.SO_lang.t(
        n === 1 ? "search.resultOne" : "search.resultOther",
        n === 1 ? "result" : "results"
      );
    } else {
      word = n === 1 ? "result" : "results";
    }
    countEl.textContent = n + " " + word;

    results.forEach(function (entry) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "search-result";
      a.href = entry.url;

      var title = document.createElement("span");
      title.className = "search-result__title";
      title.textContent = entry.title;

      var page = document.createElement("span");
      page.className = "search-result__page";
      page.textContent = pageLabel(entry);

      a.appendChild(title);
      a.appendChild(page);
      li.appendChild(a);
      resultsEl.appendChild(li);
    });
  }

  function search(q) {
    buildIndex().then(function (entries) {
      var query = q.trim().toLowerCase();
      if (!query) {
        render([], "");
        return;
      }
      var scored = [];
      entries.forEach(function (entry) {
        var s = scoreEntry(entry, query);
        if (s >= 0) scored.push({ entry: entry, score: s });
      });
      scored.sort(function (a, b) { return b.score - a.score; });
      render(scored.map(function (x) { return x.entry; }), query);
    });
  }

  function open() {
    dialog.showModal();
    if (input) {
      input.value = "";
      render([], "");
      window.setTimeout(function () { input.focus(); }, 50);
    }
    buildIndex().catch(function () { /* index unavailable - queries show empty */ });
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener("click", open);
  });

  if (closeBtn) closeBtn.addEventListener("click", close);

  /* Backdrop click: click lands on the dialog element itself, not the panel */
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) close();
  });

  if (input) {
    input.addEventListener("input", function () {
      window.clearTimeout(debounceTimer);
      var q = input.value;
      debounceTimer = window.setTimeout(function () {
        search(q);
      }, 120);
    });
  }

  /* Re-render counts/labels when the language flips while open */
  document.addEventListener("so:langchange", function () {
    if (dialog.open && input && input.value.trim()) search(input.value);
  });
})();
