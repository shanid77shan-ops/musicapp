const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const outDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Purple gradient background + white music note
function svgIcon(size) {
  const pad  = Math.round(size * 0.18);
  const inner = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#1e0a3c"/>
      <stop offset="100%" stop-color="#4c1d95"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#bg)"/>
  <g transform="translate(${pad},${pad})">
    <!-- Music note -->
    <path
      fill="#c084fc"
      d="M${inner*0.62} ${inner*0.08}
         L${inner*0.62} ${inner*0.62}
         a${inner*0.19} ${inner*0.19} 0 1 1-${inner*0.19}-${inner*0.19}
         a${inner*0.19} ${inner*0.19} 0 0 1 ${inner*0.19} ${inner*0.19}
         V${inner*0.24}
         L${inner*0.28} ${inner*0.35}
         V${inner*0.77}
         a${inner*0.19} ${inner*0.19} 0 1 1-${inner*0.19}-${inner*0.19}
         a${inner*0.19} ${inner*0.19} 0 0 1 ${inner*0.19} ${inner*0.19}
         V${inner*0.08}
         Z"
    />
  </g>
</svg>`;
}

(async () => {
  for (const size of sizes) {
    const svg = Buffer.from(svgIcon(size));
    await sharp(svg)
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }

  // Placeholder screenshots (solid colour — replace with real ones later)
  await sharp({ create: { width: 1280, height: 720,  channels: 4, background: { r: 3, g: 7, b: 18, alpha: 1 } } })
    .png().toFile(path.join(outDir, 'screenshot-wide.png'));
  await sharp({ create: { width: 390,  height: 844,  channels: 4, background: { r: 3, g: 7, b: 18, alpha: 1 } } })
    .png().toFile(path.join(outDir, 'screenshot-narrow.png'));

  console.log('✓ screenshots');
  console.log('All icons generated!');
})();
