# Panadería Ana

Static, trilingual (Spanish · English · Galician) website for **Panadería Ana**, an
artisan bakery and pastry shop in Cee (A Coruña, Galicia). Hosted on GitHub Pages with a
custom domain via Cloudflare.

The site is generated from templates: you author each page once and a small Node build
renders it into `es/`, `en/` and `gl/`. No client-side framework — just hand-written CSS
and a little vanilla JavaScript.

## Quick start

```bash
npm install         # one-time: installs nunjucks + sharp
npm run build       # render src/ -> dist/
npm run serve       # serve dist/ at http://localhost:8000
# or: npm run dev   # build + serve in one step
```

## Editing content

- **Text** lives in `src/i18n/{es,en,gl}.json` (one file per language). Edit the same key
  in all three to keep languages in sync.
- **Shared data** (phone, email, address, map embed) lives in `src/data/site.json`.
- **Layout / markup** lives in `src/pages/*.njk`, `src/layouts/` and `src/partials/`.
- **Styles** live in `assets/css/style.css`; **scripts** in `assets/js/main.js`.

## Images & video

Originals are kept locally in `media-src/` (not committed). `npm run optimize` regenerates
the web assets in `img/` (photos → WebP, animated clips → MP4 + poster). Re-run it only
when you add or change source media; the optimized files in `img/` are committed.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and
publishes `dist/` to the `gh-pages` branch that GitHub Pages serves. The custom domain is
configured in `CNAME`.
