# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for "Panadería Ana", a bakery/pastry shop in Cee (A Coruña, Galicia, Spain). The site is hosted via GitHub Pages with Cloudflare.

## Tech Stack

- **HTML/CSS** - Static pages with no build process
- **Bootstrap 5** - Responsive grid and components (customized in `css/bootstrap.min.css`)
- **WOW.js** - Scroll-triggered fade-in animations (`data-wow-delay` attributes)
- **Owl Carousel** - Image carousels on homepage and product pages
- **Lightbox2** - Image gallery expansion (`data-lightbox` attributes)
- **jQuery** - Required by Owl Carousel and other libraries

## Development

No build tools or package manager. To develop:

1. Open any `.html` file directly in a browser, or
2. Use a local server (e.g., `python -m http.server 8000`)

## Project Structure

```
css/
  bootstrap.min.css    # Customized Bootstrap
  style.css            # Main custom styles (CSS variables for colors)
js/
  main.js              # WOW.js init, Owl Carousel config, back-to-top
lib/                   # Third-party libraries (animate, owl, wow, etc.)
img/                   # Product and gallery images
```

## Key Pages

- `index.html` - Homepage with carousel, products showcase, services
- `producto.html` - Full product catalog
- `servicios.html` - Services offered
- `contacto.html` - Contact page
- `nosotros.html` - About page
- Product-specific pages: `tartadequeso.html`, `tartadesantiago.html`, `larpeira.html`, `tartagallega.html`

## Styling Notes

Brand colors defined as CSS variables in `css/style.css`:
- `--primary: #872806` (Salsa red - main brand color)
- `--gold: #cb8c34` (Gold ocher - footer/accent backgrounds)
- `--secondary: #C47A4E` (Maple syrup - secondary accents)
- `--light: #FDF5EB` (Cream - light backgrounds)
- `--dark: #1E1916` (Near-black)
- `--grey-text: #545454` (Gray for muted text)

All color definitions use CSS variables. The `.bg-gold` class is used for footer background.

## Deployment

Site deploys automatically via GitHub Pages on the `gh-pages` branch. Domain configured in `CNAME` file.
