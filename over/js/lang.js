/* ==========================================================================
   Shuvam Overseas Employment PVT.LTD - Language Switcher (EN / NE)
   --------------------------------------------------------------------------
   - English is the source of truth: markup holds the EN copy; this file
     caches each element's original innerHTML/aria-label/placeholder on first
     apply, then swaps to Nepali from the dictionary in js/lang-data.js.
   - Missing NE keys fall back to English (graceful degradation).
   - Selection persists in localStorage ("so-lang") and updates <html lang>.
   - Loaded AFTER steps-data.js so data-rendered content is cached too.
   - Exposes window.SO_lang for other scripts (search result counts).
   ========================================================================== */

(function () {
  "use strict";

  var DICT = (window.SO_I18N && window.SO_I18N.ne) || {};
  var STORE_KEY = "so-lang";
  var current = "en";

  var textMap = new WeakMap();
  var ariaMap = new WeakMap();
  var phMap = new WeakMap();

  function lookup(key) {
    return Object.prototype.hasOwnProperty.call(DICT, key) ? DICT[key] : undefined;
  }

  /* Public helper: translate a key at runtime (dynamic strings like counts).
     Falls back to the provided English, then to the key itself. */
  function t(key, fallback) {
    var ne = lookup(key);
    if (current === "ne" && ne !== undefined) return ne;
    return fallback !== undefined ? fallback : key;
  }

  function applyText(lang) {
    var els = document.querySelectorAll("[data-i18n]");
    els.forEach(function (el) {
      if (!textMap.has(el)) textMap.set(el, el.innerHTML);
      var en = textMap.get(el);
      var key = el.getAttribute("data-i18n");
      if (lang === "en") {
        el.innerHTML = en;
      } else {
        var ne = lookup(key);
        el.innerHTML = ne !== undefined ? ne : en;
      }
    });
  }

  function applyAttr(lang, attr, map, dataName) {
    var els = document.querySelectorAll("[" + dataName + "]");
    els.forEach(function (el) {
      if (!map.has(el)) map.set(el, el.getAttribute(attr));
      var en = map.get(el);
      var key = el.getAttribute(dataName);
      if (lang === "en") {
        if (en !== null) el.setAttribute(attr, en);
      } else {
        var ne = lookup(key);
        el.setAttribute(attr, ne !== undefined ? ne : en);
      }
    });
  }

  function syncButtons(lang) {
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var active = btn.getAttribute("data-set-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function apply(lang) {
    current = lang === "ne" ? "ne" : "en";
    document.documentElement.lang = current;
    applyText(current);
    applyAttr(current, "aria-label", ariaMap, "data-i18n-aria");
    applyAttr(current, "placeholder", phMap, "data-i18n-ph");
    syncButtons(current);
    document.dispatchEvent(new CustomEvent("so:langchange", { detail: { lang: current } }));
  }

  function setLang(lang) {
    apply(lang);
    try {
      window.localStorage.setItem(STORE_KEY, lang);
    } catch (e) {
      /* private mode - session-only switch is fine */
    }
  }

  /* Wire the switcher buttons */
  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(btn.getAttribute("data-set-lang"));
    });
  });

  /* steps-data.js renders AFTER this file runs (DOMContentLoaded). When a
     saved Nepali preference exists, swap the freshly rendered nodes too. */
  document.addEventListener("so:render", function () {
    if (current !== "en") apply(current);
  });

  /* Init: saved preference, else keep English */
  var saved = null;
  try {
    saved = window.localStorage.getItem(STORE_KEY);
  } catch (e) {
    /* ignore */
  }
  apply(saved === "ne" ? "ne" : "en");

  window.SO_lang = { t: t, get: function () { return current; } };
})();
