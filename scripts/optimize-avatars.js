/**
 * scripts/optimize-avatars.js
 *
 * One-time script: resize original avatar PNGs to 256×256 and write
 * to frontend/src/assets/avatars/avatar-01.png … avatar-10.png.
 *
 * Install (inside /scripts only, NOT the frontend):
 *   cd scripts && npm install
 *
 * Run from repo root:
 *   node scripts/optimize-avatars.js
 *
 * Mapping (original filename fragment → output number):
 *   yefn96yefn96yefn → 01
 *   5lk3th5lk3th5lk3 → 02
 *   qo9911qo9911qo99 → 03
 *   lkeoidlkeoidlkeo → 04
 *   fptp9gfptp9gfptp → 05
 *   7lxygh7lxygh7lxy → 06
 *   bkaxz6bkaxz6bkax → 07
 *   cc5dowcc5dowcc5d → 08
 *   8uvhzl8uvhzl8uvh → 09 (note: 8uvhzl prefix, not hh6z0b)
 *   hh6z0bhh6z0bhh6z → 10
 *
 * Originals are NEVER modified. Colours are NEVER altered (no ICC conversion).
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const sharp = require('sharp');

const ORIGINALS_DIR = path.resolve(__dirname, '../frontend/src/assets/avatars/originals');
const OUTPUT_DIR    = path.resolve(__dirname, '../frontend/src/assets/avatars');

// Map: fragment that uniquely appears in the original filename → output number
const MAPPING = [
  { fragment: 'yefn96', out: '01' },
  { fragment: '5lk3th', out: '02' },
  { fragment: 'qo9911', out: '03' },
  { fragment: 'lkeoid', out: '04' },
  { fragment: 'fptp9g', out: '05' },
  { fragment: '7lxygh', out: '06' },
  { fragment: 'bkaxz6', out: '07' },
  { fragment: 'cc5dow', out: '08' },
  { fragment: '8uvhzl', out: '09' },
  { fragment: 'hh6z0b', out: '10' },
];

async function run() {
  const files = fs.readdirSync(ORIGINALS_DIR).filter((f) => f.endsWith('.png'));

  console.log(`Found ${files.length} original(s) in ${ORIGINALS_DIR}`);

  let processed = 0;

  for (const { fragment, out } of MAPPING) {
    const src = files.find((f) => f.includes(fragment));
    if (!src) {
      console.error(`  ✗  No file found for fragment "${fragment}" (avatar-${out})`);
      continue;
    }

    const srcPath  = path.join(ORIGINALS_DIR, src);
    const destName = `avatar-${out}.png`;
    const destPath = path.join(OUTPUT_DIR, destName);

    // Get original size for reporting
    const origStat = fs.statSync(srcPath);

    await sharp(srcPath)
      .resize(256, 256, {
        fit: 'cover',          // square crop from centre
        kernel: 'lanczos3',    // high-quality resampling
        withoutEnlargement: false,
      })
      // Keep original colour profile unchanged (no toColorspace or icc conversion)
      .png({
        compressionLevel: 9,   // max compression, lossless
        adaptiveFiltering: true,
        quality: 100,
      })
      .toFile(destPath);

    const destStat = fs.statSync(destPath);
    console.log(
      `  ✓  avatar-${out}.png  ` +
      `${(origStat.size / 1024).toFixed(0)} KB → ${(destStat.size / 1024).toFixed(0)} KB`
    );
    processed++;
  }

  console.log(`\nDone. ${processed}/10 avatars optimized → ${OUTPUT_DIR}`);
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
