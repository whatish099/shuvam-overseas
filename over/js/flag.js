/* ==========================================================================
   Shuvam Overseas - JS Availability Flag
   Runs in <head> before the stylesheets load. Adds the .js class so that
   reveal/entrance styles are scoped to .js (progressive enhancement: content
   stays visible when JavaScript is unavailable). Kept as its own file so the
   site can ship a strict Content-Security-Policy without inline scripts.
   ========================================================================== */

document.documentElement.classList.add("js");
