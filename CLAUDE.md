# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for "Panadería Ana", an artisan bakery/pastry shop in Cee (A Coruña, Galicia).
Trilingual: Spanish (`es`), English (`en`), Galician (`gl`). Hosted on GitHub Pages with a
custom domain (`panaderiaana.com`, see `CNAME`) via Cloudflare.

The site is **generated from templates by a small Node build** — the deployed HTML is not
hand-edited. There is no client-side framework: the front-end is a hand-written stylesheet
plus a single vanilla-JS file.

## Commands

```bash
npm install        # installs nunjucks + sharp (dev deps)
npm run build      # render src/ -> dist/   (the deployable site)
npm run serve      # python http.server over dist/ on :8000
npm run dev        # build + serve
npm run optimize   # regenerate img/ from media-src/ (needs ffmpeg)
```

There are no tests. To verify a change: `npm run build`, then `npm run serve` and load the
27 pages (9 × 3 languages) under `http://localhost:8000/<lang>/`.

## Architecture

`build.js` is the heart of the build. It:
- defines the page registry (`PAGES`) shared across languages — slug, template, active nav
  item, and pagehead background image;
- loads `src/data/site.json` (shared, non-translatable data) and `src/i18n/<lang>.json`
  (all translatable strings) and renders each `src/pages/*.njk` through
  `src/layouts/base.njk` once per language into `dist/<lang>/<slug>.html`;
- generates per-page `hreflang`/`canonical` tags and the language-selector links from the
  page registry, so cross-language SEO links can't drift out of sync (a recurring bug in the
  old hand-maintained version);
- emits the root `dist/index.html` redirect (`src/redirect.njk`) and copies `assets/css` →
  `dist/css`, `assets/js` → `dist/js`, `img/` → `dist/img/`, `.well-known/`, plus `404.html`
  and `CNAME` (the icon sprite is inlined, not copied).

The SVG icon sprite (`assets/icons/sprite.svg`) is read by `build.js` and injected inline at
the top of every page; templates reference icons with `<svg class="icon"><use href="#i-..."/></svg>`.

```
src/
  layouts/base.njk        # <html> shell: head, hreflang, nav, footer, scripts
  partials/               # nav, footer, pagehead
  pages/*.njk             # one template per page (index, producto, servicios,
                          #   nosotros, contacto, tartadequeso, tartadesantiago,
                          #   larpeira, tartagallega)
  redirect.njk            # root "/" -> /es/index.html
  data/site.json          # phone, email, address, instagram, map embed, developer
  i18n/{es,en,gl}.json    # ALL user-visible text, keyed; mirror the structure
assets/
  css/style.css           # design system (CSS variables); replaces Bootstrap
  js/main.js              # vanilla: carousel, scroll-reveal, lightbox, nav, back-to-top
  icons/sprite.svg        # inline SVG symbols (only the icons actually used)
img/                      # optimized WebP + MP4 (committed, deployed)
media-src/                # original full-res masters (gitignored, local only)
build.js  optimize-media.js  package.json
```

## Editing content — IMPORTANT

- Translatable text lives only in `src/i18n/{es,en,gl}.json`. **Edit the same key in all
  three files** so languages stay in sync; the three files share an identical structure.
  Values may contain inline HTML (`<strong>`, `<br>`) — templates render those with `| safe`.
- Do not put translatable strings in templates or `site.json`; templates reference keys, and
  `site.json` holds only non-translatable shared data (phone, email, address, map, etc.).
- Repeating blocks (product cards, services, the `producto` page's alternating sections,
  gallery images, stats) are driven by **arrays** in the i18n JSON and looped in the template.
  Add an item by adding an array entry in all three languages, not by editing markup.
- The old per-language HTML folders (`es/ en/ gl/`) and the old `css/ js/ lib/ scss/` are gone;
  they were the generated/obsolete output. Source of truth is `src/` + `assets/`.

## Media pipeline

`optimize-media.js` reads originals from `media-src/` (kept locally, gitignored) and writes
web assets into `img/` (committed): photos → WebP capped at 1280px; the three animated clips
(`larpeira`, `stg`, `josemanuel`) → muted-loop H.264 `.mp4` + a `-poster.webp`. This took the
image payload from ~176 MB to ~12 MB and is the main reason the site is fast. Templates
reference videos via `<video autoplay muted loop playsinline poster="...-poster.webp">`.
Re-run `npm run optimize` only when source media changes.

## Styling

Brand colours are CSS variables in `assets/css/style.css`:
`--primary #872806` (salsa red), `--gold #cb8c34` (footer), `--secondary #c47a4e`,
`--light #fdf5eb` (cream), `--dark #1e1916`, `--grey-text #545454`. Layout uses CSS grid/flex
and `clamp()`; section backgrounds use `.section--alt` (cream), `.section--brand` (red),
`.section--accent` (maple). Animations respect `prefers-reduced-motion`.

## Deployment

`.github/workflows/deploy.yml` runs on push to `main`: `npm ci`, `npm run build`, then
publishes `dist/` to the `gh-pages` branch that GitHub Pages serves. CI does not run the media
optimizer — `img/` is already committed. `CLAUDE.md` and `claude.txt` are gitignored.
