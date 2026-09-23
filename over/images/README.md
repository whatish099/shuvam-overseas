# images/

Placeholder assets for Shuvam Overseas. Replace with real photography before launch.

## hero/
- `home.svg` - full-width hero for index.html (deep passport-green treatment)
- `about.svg`, `services.svg`, `procedure.svg`, `contact.svg` - light page banners

## Root
- `about.svg` - "Who We Are" section image (about.html)
- `bridging.svg` - "Bridging the Gap" section image (services.html)
- `training.svg` - "Training & Orientation" section image (services.html)
- `stamp.svg` - circular rubber-stamp seal (vermilion `#B54B06`); used on the home hero, the 404 page and styled via `.stamp`/`.hero__stamp`. Text is curved SVG `<textPath>` — edit carefully.

## sectors/
- `placeholder.svg` - generic placeholder; drop real sector photos here (e.g. `electrical.jpg`)

## Country/
- Gulf Cooperation Council flags used by the "Destinations - Gulf & Europe" section on services.html:
  `kuwait.png`, `oman.png`, `qatar.png`, `saudi.png`, `uae.png`

## EU/
- European Union flags from the same section: `bulgaria.png`, `greece.png`, `malta.png`, `romania.png`
- All flags (both folders) are displayed in square 1:1 frames via CSS (`aspect-ratio` +
  `object-fit: cover`), so any reasonably-sized flag image works. Source files arrived with
  misspelled names (`Kui.png`, `Qutar.png`) and mixed casing - renamed in place; swap for
  higher-resolution versions keeping the same filenames.

## icons/
- Intended for future iconography; current icons are inline SVG in `js/steps-data.js` and the HTML footer.

## logo.png
- `logo.png` is the current brand mark; used site-wide (favicon, page loader, header/footer brand marks).

**Note:** All placeholder SVGs are neutral/abstract by design - swap the file paths in the HTML
`<img>` tags (or CSS `background-image`) to go live. Nothing in the markup depends on these files
being SVGs; `jpg`/`webp` will work unchanged.
