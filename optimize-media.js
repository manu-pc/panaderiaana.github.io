/**
 * One-off media optimizer for Panadería Ana.
 *
 * Reads original masters from media-src/ (gitignored, kept locally) and writes
 * web-optimized derivatives into img/ (committed + deployed):
 *   - raster photos  -> resized WebP
 *   - animated GIFs   -> muted looping H.264 MP4 + a WebP poster frame
 *                        (H.264 plays everywhere; VP9/WebM was larger here)
 *   - SVG / ICO       -> copied through unchanged
 *
 * Run with: npm run optimize   (requires ffmpeg on PATH)
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const exec = promisify(execFile);
const SRC = 'media-src';
const OUT = 'img';

// Max width for full-bleed / hero imagery; everything else is capped here too.
const MAX_WIDTH = 1280;
const WEBP_QUALITY = 80;

// Referenced rasters -> output WebP basename. Most keep their name; a couple are
// normalized to drop accents / odd casing.
const rasters = {
  'barras2.jpeg': 'barras2',
  'barros.jpeg': 'barros',
  'bolleria.jpeg': 'bolleria',
  'bolos_2.jpeg': 'bolos_2',
  'bolos.jpeg': 'bolos',
  'cafe.jpeg': 'cafe',
  'cafes2.jpeg': 'cafes2',
  'croissant.jpeg': 'croissant',
  'empanada.jpeg': 'empanada',
  'empanadillas.jpeg': 'empanadillas',
  'larpeira.jpeg': 'larpeira',
  'larpeira_rellena_nata.jpeg': 'larpeira_rellena_nata',
  'megaempanada.jpeg': 'megaempanada',
  'mosaico.webp': 'mosaico',
  'panpasas.jpeg': 'panpasas',
  'pastelchoco_1.jpg': 'pastelchoco_1',
  'pasteles.jpeg': 'pasteles',
  'pastelnata2.jpg': 'pastelnata2',
  'pastelselva.jpeg': 'pastelselva',
  'Pedro_Portocarrero_Cárdenas.jpg': 'pedro_portocarrero',
  'queixo_3.jpeg': 'queixo_3',
  'queixocafe.jpeg': 'queixocafe',
  'queixo_f1.jpg': 'queixo_f1',
  'queixo.jpg': 'queixo',
  'queixo-l.jpeg': 'queixo-l',
  'queixo-p.jpeg': 'queixo-p',
  'shin.jpeg': 'shin',
  'stg.jpeg': 'stg',
  'stgmz.jpg': 'stgmz',
  'tartagallega1.jpeg': 'tartagallega1',
  'tartagallega3.jpeg': 'tartagallega3',
  'tartagallega4.jpeg': 'tartagallega4',
  'tartagallega.jpeg': 'tartagallega',
  'tartas.jpeg': 'tartas',
};

const gifs = ['larpeira.gif', 'stg.gif', 'josemanuel.gif'];
const passthrough = ['esp.svg', 'eng.svg', 'gal.svg', 'favicon.ico'];

async function optimizeRasters() {
  for (const [file, base] of Object.entries(rasters)) {
    const input = path.join(SRC, file);
    const output = path.join(OUT, `${base}.webp`);
    const meta = await sharp(input).metadata();
    await sharp(input)
      .rotate() // honor EXIF orientation before stripping metadata
      .resize({ width: Math.min(meta.width, MAX_WIDTH), withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(output);
    const { size } = await fs.stat(output);
    console.log(`  webp  ${base}.webp  (${(size / 1024).toFixed(0)} KB)`);
  }
}

async function convertGifs() {
  for (const gif of gifs) {
    const input = path.join(SRC, gif);
    const base = path.basename(gif, '.gif');
    const mp4 = path.join(OUT, `${base}.mp4`);
    const poster = path.join(OUT, `${base}-poster.webp`);

    // H.264 MP4 — broad compatibility. Even dimensions required by yuv420p.
    await exec('ffmpeg', ['-y', '-i', input,
      '-movflags', 'faststart',
      '-pix_fmt', 'yuv420p',
      '-vf', "scale='min(720,iw)':-2",
      '-an', '-crf', '28', '-preset', 'slow', mp4]);
    // Poster: first frame as WebP.
    const frame = await extractFirstFrame(input);
    await sharp(frame).resize({ width: 720, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY }).toFile(poster);

    for (const f of [mp4, poster]) {
      const { size } = await fs.stat(f);
      console.log(`  video ${path.basename(f)}  (${(size / 1024).toFixed(0)} KB)`);
    }
  }
}

async function extractFirstFrame(input) {
  const tmp = path.join(OUT, '.frame.png');
  await exec('ffmpeg', ['-y', '-i', input, '-vframes', '1', tmp]);
  const buf = await fs.readFile(tmp);
  await fs.unlink(tmp);
  return buf;
}

async function copyPassthrough() {
  for (const file of passthrough) {
    await fs.copyFile(path.join(SRC, file), path.join(OUT, file));
    console.log(`  copy  ${file}`);
  }
}

async function main() {
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });
  console.log('Optimizing rasters →');
  await optimizeRasters();
  console.log('Converting GIFs → video →');
  await convertGifs();
  console.log('Copying icons/favicon →');
  await copyPassthrough();
  console.log('Done.');
}

main().catch((err) => { console.error(err); process.exit(1); });
