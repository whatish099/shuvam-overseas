# AGENTS.md

Shuvam Overseas — static, no-build marketing site for a Nepali manpower-recruitment agency. 6 hand-written HTML pages (`index`, `about`, `services`, `procedure`, `contact`, plus a `404.html` for missing routes), plain CSS/JS, zero dependencies, no git repo.

## Run & verify
- No package.json, build step, tests, or linter. Nothing to install or compile.
- Serve locally: `python -m http.server 8000` (Python 3.13 is installed), then open http://localhost:8000. Verify by eye — there is no automated check. File:// also works since the site makes no network calls.

## Hard constraint: strict CSP (no inline scripts)
Every page ships a CSP with `script-src 'self'` — inline scripts, inline event handlers (`onclick=`), and `eval()` are blocked. Never add them.
- New JS must be its own file under `js/` and be referenced via `<script src="js/...">` in the footer of every page that uses it.
- `js/flag.js` runs in `<head>` before stylesheets and adds the `.js` class; all JS-dependent styling is scoped to `.js` so pages stay usable without JavaScript (progressive enhancement).
- Footer script order: `nav.js`, `animations.js` on every page; `steps-data.js` on `services.html` + `procedure.html`; `forms.js` on `about.html` + `contact.html`.

## Content lives in `js/steps-data.js`, not the HTML
Steps, sector cards, and employer cards are data arrays rendered into elements that opt in via attributes:
- `<ol data-steps="recruitment|deployment|visa|saudi">`
- `<div data-cards="sectors">` and `<div data-cards="employer">`

Edit the data arrays (20 recruitment steps, 9 sectors, 6 employer cards, 4 step lists) — never hand-write that markup. `esc()` escapes all injected text.

## Motion system — reuse it, don't reimplement
- `.reveal` elements fade in once via IntersectionObserver; `data-reveal="left|right"` adds direction; `data-stagger` cascades a group's children (60ms, capped).
- CSS owns all transitions (`.js .reveal.is-visible`); `js/animations.js` only toggles the `.is-visible` class.
- `data-intro` on the home hero plays a one-time entrance; `.page-loader` and `.scroll-progress` are standard elements on every page.
- Reduced motion: JS reveals everything immediately, CSS zeroes transforms. New motion must stay within these conventions and honor `prefers-reduced-motion`.

## Styling
- Use the design tokens in `:root` of `css/style.css` (green-tinted-paper cream / green-ink / passport-green / vermilion palette, `--ease-out`/`--ease-in-out`, radius, shadows). Never hardcode colors or curves.
- Design language is "The Employment File": green-tinted paper, Bricolage Grotesque for display, Chivo Mono for the ledger voice (eyebrows, file refs, step numbers, footer license). Body copy is Public Sans (the US government's official typeface — the "documents" register). Preserve the motif — rubber-stamp seal (`images/stamp.svg`, classes `.stamp`/`.hero__stamp`), `.file-tag` dossier references above page-hero eyebrows, `.card-index` mono tags on data-rendered cards, dotted ledger rules (`--dotted`) and hairline borders.
- Breakpoints live ONLY in `css/responsive.css` (1024 / 768 / 480; mobile nav at ≤768). Keep base layout in `style.css`. The home hero is a 2-column grid (`.hero__copy` + `.hero__stamp`) that collapses to one column at ≤1024 with the stamp hidden.

## Forms (`about.html`, `contact.html`)
`<form data-form novalidate>` — client-side only, no backend. `js/forms.js` validates on blur/submit, uses a honeypot + 2s fill-time bot filter, and fakes success. Formspree wiring is documented in the code comments — don't build another backend.

## Security headers must stay in sync
The CSP meta tag in each page's `<head>` is mirrored by `_headers` (Netlify/Cloudflare/Vercel) and `.htaccess` (Apache). Changing a policy without updating all three breaks the site (e.g. adding a font host). Cache rules also live in both files.

## Images
`images/README.md` documents every placeholder. All are neutral SVGs; swap `<img src>` paths (or CSS backgrounds) for jpg/webp when real assets arrive — markup doesn't depend on the SVG format. `images/logo.png` is the brand mark.

## UI/design skills
The repo ships design skills under `.agents/skills/` (tracked in `skills-lock.json`): `ui-design`, `ui-radar`, `ui-slop-score`, `anti-ui-slop`, `impeccable`, `redesign-existing-projects`. Load the relevant skill before doing UI or design work.
