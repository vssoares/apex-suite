/**
 * Gera build/icon.png + build/icon.ico a partir de public/logo.png
 * Uso: npm run icons
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

async function main() {
  const sharp = require('sharp');
  const pngToIco = require('png-to-ico');
  const toIco = pngToIco.default || pngToIco;

  const square = await sharp('public/logo.png')
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  fs.mkdirSync('build', { recursive: true });
  fs.writeFileSync('build/icon.png', square);

  const sizes = [16, 32, 48, 64, 128, 256];
  const pngs = [];
  for (const size of sizes) {
    pngs.push(await sharp(square).resize(size, size).png().toBuffer());
  }

  const ico = await toIco(pngs);
  fs.writeFileSync('build/icon.ico', ico);
  fs.copyFileSync('build/icon.ico', 'public/favicon.ico');
  console.log('Icons updated from public/logo.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
