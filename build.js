/**
 * Static site builder for Panadería Ana.
 *
 * Renders each page template once per language (es / en / gl) into dist/,
 * pulling translatable strings from src/i18n/<lang>.json and shared,
 * non-translatable data from src/data/site.json. Then copies static assets.
 *
 * Run with: npm run build   (output in dist/, deployed to gh-pages)
 */
import nunjucks from 'nunjucks';
import fs from 'node:fs/promises';
import path from 'node:path';

const LANGS = ['es', 'en', 'gl'];
const DEFAULT_LANG = 'es';
const ORIGIN = 'https://panaderiaana.com';
const OUT = 'dist';

// Page registry — shared across all languages.
// `nav` marks the active top-level menu item. `head` is the pagehead background
// image (WebP basename in img/); pages with a hero (index) omit it.
const PAGES = [
  { slug: 'index',           template: 'pages/index.njk',           nav: 'index' },
  { slug: 'producto',        template: 'pages/producto.njk',        nav: 'producto',  head: 'tartas' },
  { slug: 'servicios',       template: 'pages/servicios.njk',       nav: 'servicios', head: 'cafes2' },
  { slug: 'nosotros',        template: 'pages/nosotros.njk',        nav: 'nosotros',  head: 'barras2' },
  { slug: 'contacto',        template: 'pages/contacto.njk',        nav: 'contacto',  head: 'queixocafe' },
  { slug: 'tartadequeso',    template: 'pages/tartadequeso.njk',    nav: '',          head: 'queixo-l' },
  { slug: 'tartadesantiago', template: 'pages/tartadesantiago.njk', nav: '',          head: 'stg-poster' },
  { slug: 'larpeira',        template: 'pages/larpeira.njk',        nav: '',          head: 'larpeira_rellena_nata' },
  { slug: 'tartagallega',    template: 'pages/tartagallega.njk',    nav: '',          head: 'tartagallega1' },
  { slug: 'panchocolatenaranja', template: 'pages/panchocolatenaranja.njk', nav: '',     head: 'panchocolatenaranja1' },
];

const env = nunjucks.configure('src', { autoescape: true, trimBlocks: true, lstripBlocks: true });

const readJSON = async (p) => JSON.parse(await fs.readFile(p, 'utf8'));

async function copyDir(from, to) {
  await fs.cp(from, to, { recursive: true });
}

async function main() {
  const site = await readJSON('src/data/site.json');
  const i18n = Object.fromEntries(
    await Promise.all(LANGS.map(async (l) => [l, await readJSON(`src/i18n/${l}.json`)]))
  );
  const sprite = await fs.readFile('assets/icons/sprite.svg', 'utf8');

  await fs.rm(OUT, { recursive: true, force: true });

  for (const lang of LANGS) {
    const t = i18n[lang];
    await fs.mkdir(path.join(OUT, lang), { recursive: true });

    for (const page of PAGES) {
      const content = t.pages[page.slug] || {};
      // hreflang alternates + language-selector links (same page, other langs)
      const alternates = LANGS.map((l) => ({
        lang: l,
        href: `${ORIGIN}/${l}/${page.slug}.html`,
      }));
      const ctx = {
        site, t, lang, sprite,
        page,
        content,
        nav: t.nav,
        title: content.title || t.site.brand,
        description: content.description || t.site.tagline,
        canonical: `${ORIGIN}/${lang}/${page.slug}.html`,
        defaultHref: `${ORIGIN}/${DEFAULT_LANG}/${page.slug}.html`,
        alternates,
        langLinks: LANGS.map((l) => ({ lang: l, href: `../${l}/${page.slug}.html`, label: t.site.langNames[l], flag: { es: 'esp', en: 'eng', gl: 'gal' }[l] })),
        year: new Date().getFullYear(),
      };
      const html = env.render(page.template, ctx);
      await fs.writeFile(path.join(OUT, lang, `${page.slug}.html`), html);
    }
  }

  // Root redirect → default language.
  const redirect = env.render('redirect.njk', { ORIGIN, DEFAULT_LANG, LANGS });
  await fs.writeFile(path.join(OUT, 'index.html'), redirect);

  // Static assets.
  await copyDir('assets/css', path.join(OUT, 'css'));
  await copyDir('assets/js', path.join(OUT, 'js'));
  await copyDir('img', path.join(OUT, 'img'));
  await copyDir('.well-known', path.join(OUT, '.well-known'));
  await fs.copyFile('404.html', path.join(OUT, '404.html'));
  await fs.copyFile('CNAME', path.join(OUT, 'CNAME'));

  console.log(`Built ${PAGES.length} pages × ${LANGS.length} languages → ${OUT}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
