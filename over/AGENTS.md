# AGENTS.md

Shuvam Overseas Employment PVT.LTD — static, no-build marketing site for a Nepali manpower-recruitment agency. 8 hand-written HTML pages (`index`, `about`, `team`, `services`, `procedure`, `contact`, `privacy`, plus a `404.html` for missing routes), plain CSS/JS, zero dependencies, no git repo.

## Run & verify
- No package.json, build step, tests, or linter. Nothing to install or compile.
- Serve locally: `python -m http.server 8000` (Python 3.13 is installed), then open http://localhost:8000. Verify by eye — there is no automated check. File:// also works since the site makes no network calls.

## Hard constraint: strict CSP (no inline scripts)
Every page ships a CSP with `script-src 'self'` — inline scripts, inline event handlers (`onclick=`), and `eval()` are blocked. Never add them.
- New JS must be its own file under `js/` and be referenced via `<script src="js/...">` in the footer of every page that uses it.
- `js/flag.js` runs in `<head>` before stylesheets and adds the `.js` class; all JS-dependent styling is scoped to `.js` so pages stay usable without JavaScript (progressive enhancement).
- Footer script order (strict): `nav.js` → `steps-data.js` (only `index`, `services`, `procedure`) → `animations.js` → `forms.js` (only `about`, `contact`) → `lang-data.js` → `lang.js` → `search.js` on every page. `lang-data`/`lang` must come last-ish so `lang.js` caches English from content the earlier scripts already rendered.

## Late-rendered content: the `so:render` event
`steps-data.js` boots on `DOMContentLoaded` — after every footer script has run. At the end of its boot it dispatches `document.dispatchEvent(new Event("so:render"))`. Two listeners depend on it:
- `animations.js` re-applies `[data-stagger]` and observes new `.reveal` nodes (without this, data-rendered cards stay at `opacity: 0` forever).
- `lang.js` re-applies Nepali if it is the active language (otherwise saved-NE visits would render cards in English).

Any script that injects `.reveal` or `data-i18n` markup after load must fire this event too.

## Language switcher (EN / NE)
- English is the source of truth: it lives in the markup (and in the `steps-data.js` data arrays). Elements opt in with `data-i18n="key"` (inner HTML), `data-i18n-aria` (aria-label), `data-i18n-ph` (placeholder).
- `js/lang-data.js` defines `window.SO_I18N.ne` — a flat key→Nepali dictionary covering every `data-i18n` key plus the generated families (`step.<list>.<i>.t/.d`, `sector.<i>.title/.jobs.<j>`, `employer.<i>.*`, `vac.<i>.*`). Missing keys fall back to English.
- `js/lang.js` caches originals in WeakMaps on first apply, swaps innerHTML/aria/placeholder, sets `<html lang>`, syncs `[data-set-lang]` buttons (`aria-pressed`), persists to `localStorage["so-lang"]`, and exposes `window.SO_lang.t(key, fallback)` for dynamic strings (search counts).
- Coverage rule: every key used anywhere must exist in `lang-data.js`. When adding copy, add both sides. Values may contain trusted HTML (links/entities); only static, hand-written markup goes in the dictionary.

## Content lives in `js/steps-data.js`, not the HTML
Steps, sector cards, employer cards, and vacancy cards are data arrays rendered into elements that opt in via attributes:
- `<ol data-steps="recruitment|deployment|visa|saudi">`
- `<div data-cards="sectors">`, `<div data-cards="employer">`, `<div data-cards="vacancies" data-limit="N">`

Edit the data arrays (20 recruitment steps, 9 sectors, 6 employer cards, 6 vacancy demands, 4 step lists) — never hand-write that markup. `esc()` escapes all injected text; renderers emit `data-i18n` keys on every translatable string (see the language-switcher section).

## Motion system — reuse it, don't reimplement
- `.reveal` elements fade in once via IntersectionObserver; `data-reveal="left|right"` adds direction; `data-stagger` cascades a group's children (60ms, capped).
- CSS owns all transitions (`.js .reveal.is-visible`); `js/animations.js` only toggles the `.is-visible` class.
- `data-intro` on the home hero plays a one-time entrance; `.page-loader` and `.scroll-progress` are standard elements on every page.
- Reduced motion: JS reveals everything immediately, CSS zeroes transforms. New motion must stay within these conventions and honor `prefers-reduced-motion`.

## Styling
- Use the design tokens in `:root` of `css/style.css` (green-tinted-paper cream / green-ink / passport-green / vermilion palette, `--ease-out`/`--ease-in-out`, radius, shadows). Never hardcode colors or curves.
- Design language is "The Employment File": green-tinted paper, Bricolage Grotesque for display, Chivo Mono for the ledger voice (eyebrows, file refs, step numbers, footer license). Body copy is Public Sans (the US government's official typeface — the "documents" register). Preserve the motif — rubber-stamp seal (`images/stamp.svg`, classes `.stamp`/`.hero__stamp`), `.file-tag` dossier references above page-hero eyebrows, `.card-index` mono tags on data-rendered cards, dotted ledger rules (`--dotted`) and hairline borders.
- Breakpoints live ONLY in `css/responsive.css` (1024 / 768 / 480; mobile nav at ≤1024 — six nav links + brand + CTA stop fitting one row below that). Keep base layout in `style.css`. The home hero is a 2-column grid (`.hero__copy` + `.hero__stamp`) that collapses to one column at ≤1024 with the stamp hidden.

## Forms (`about.html`, `contact.html`)
`<form data-form novalidate>` — client-side only, no backend. `js/forms.js` validates on blur/submit, uses a honeypot + 2s fill-time bot filter, and fakes success. Formspree wiring is documented in the code comments — don't build another backend.

## Security headers must stay in sync
The CSP meta tag in each page's `<head>` is mirrored by `_headers` (Netlify/Cloudflare/Vercel) and `.htaccess` (Apache) — both files exist and must be updated together (e.g. adding a font host means editing all three). The policy allows no inline scripts, `connect-src 'self'` (site search fetches sibling pages), and fonts from Google. Cache rules also live in both files. The search UI uses a native `<dialog id="site-search">` — no inline handlers anywhere.

## Site search
`js/search.js` lazily builds an index on first open by fetching the seven content pages same-origin, then filters as you type (results announced via `role="status"`). Wired through `[data-search-open]` / `[data-search-close]` and the `#site-search` dialog present on every page.

## Images
`images/README.md` documents every placeholder. All are neutral SVGs; swap `<img src>` paths (or CSS backgrounds) for jpg/webp when real assets arrive — markup doesn't depend on the SVG format. `images/logo.png` is the brand mark.

## UI/design skills
The repo ships design skills under `.agents/skills/` (tracked in `skills-lock.json`): `ui-design`, `ui-radar`, `ui-slop-score`, `anti-ui-slop`, `impeccable`, `redesign-existing-projects`. Load the relevant skill before doing UI or design work.
