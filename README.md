# Panadería Ana

Website for **Panadería Ana**, an artisan bakery and pastry shop in Cee (A Coruña, Galicia).
The site is trilingual — Spanish, English and Galician — and lives at
[panaderiaana.com](https://panaderiaana.com).

## About the project

It's a static site with no client-side framework: just hand-written CSS and a small amount of
vanilla JavaScript (carousel, scroll reveals, image lightbox, mobile nav). The pages are
**generated from templates**, so each page is authored once and the build renders it into all
three languages, keeping content and SEO metadata in sync automatically.

### How it's built

- **Templates** — pages are written as [Nunjucks](https://mozilla.github.io/nunjucks/)
  templates (`src/pages`, `src/layouts`, `src/partials`). A small Node script (`build.js`)
  renders every page once per language into the `dist/` folder.
- **Content** — all user-visible text is kept in per-language JSON files
  (`src/i18n/es.json`, `en.json`, `gl.json`), separate from the markup. Shared,
  non-translatable data (address, phone, map embed) lives in `src/data/site.json`.
- **SEO** — `hreflang`/`canonical` tags and the language switcher are generated from a single
  page registry, so the cross-language links can't drift apart.
- **Media** — photos are served as optimized WebP and short clips as muted-loop MP4. A helper
  script (`optimize-media.js`) produces these from full-resolution originals, which cut the
  image payload from ~176 MB down to ~12 MB.

### Built with

[Nunjucks](https://mozilla.github.io/nunjucks/) · [sharp](https://sharp.pixelplumbing.com/) ·
[ffmpeg](https://ffmpeg.org/) · GitHub Pages · Cloudflare

## Running it locally

```bash
npm install     # installs build dependencies
npm run dev     # build the site and serve it at http://localhost:8000
```

Other scripts:

| Command            | What it does                                        |
| ------------------ | --------------------------------------------------- |
| `npm run build`    | Render `src/` into the deployable `dist/` folder    |
| `npm run serve`    | Serve the already-built `dist/` at `localhost:8000` |
| `npm run optimize` | Regenerate optimized media in `img/` (needs ffmpeg) |

## Deployment

Every push to `main` triggers a GitHub Actions workflow
(`.github/workflows/deploy.yml`) that builds the site and publishes `dist/` to the `gh-pages`
branch served by GitHub Pages. The custom domain is configured in `CNAME`.

## License

See [LICENSE.txt](LICENSE.txt).
