import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// 1. Narrow Screenshot SVG (540x960) - Mobile UI Mockup
const narrowScreenshotSvg = `
<svg width="540" height="960" viewBox="0 0 540 960" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="540" height="960" fill="#121110"/>
  
  <!-- Top Bar -->
  <rect x="0" y="0" width="540" height="80" fill="#1e1c1a"/>
  <text x="24" y="48" font-family="system-ui, sans-serif" font-weight="800" font-size="22" fill="#81b64c">PAL MATE</text>
  <rect x="420" y="28" width="96" height="32" rx="16" fill="#322f2b"/>
  <text x="468" y="50" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#f59e0b" text-anchor="middle">🔥 7 Hari</text>
  
  <!-- Banner Card -->
  <rect x="24" y="104" width="492" height="140" rx="16" fill="#1e1c1a" stroke="#322f2b"/>
  <text x="48" y="148" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#ffffff">Arena Catur &amp; Streak Harian</text>
  <text x="48" y="180" font-family="system-ui, sans-serif" font-size="14" fill="#a0aec0">Selesaikan teka-teki taktik catur &amp; kumpulkan piala!</text>
  <rect x="48" y="196" width="140" height="36" rx="10" fill="#81b64c"/>
  <text x="118" y="219" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#ffffff" text-anchor="middle">Main Sekarang</text>
  
  <!-- Chessboard Illustration -->
  <rect x="24" y="268" width="492" height="492" rx="16" fill="#262421" stroke="#81b64c" stroke-width="4"/>
  <g transform="translate(42, 286)">
    <!-- 8x8 Grid preview -->
    <rect width="456" height="456" fill="#b58863" rx="8"/>
    <!-- Alternating light squares -->
    <path d="
      M0,0 h57 v57 h-57 z M114,0 h57 v57 h-57 z M228,0 h57 v57 h-57 z M342,0 h57 v57 h-57 z
      M57,57 h57 v57 h-57 z M171,57 h57 v57 h-57 z M285,57 h57 v57 h-57 z M399,57 h57 v57 h-57 z
      M0,114 h57 v57 h-57 z M114,114 h57 v57 h-57 z M228,114 h57 v57 h-57 z M342,114 h57 v57 h-57 z
      M57,171 h57 v57 h-57 z M171,171 h57 v57 h-57 z M285,171 h57 v57 h-57 z M399,171 h57 v57 h-57 z
      M0,228 h57 v57 h-57 z M114,228 h57 v57 h-57 z M228,228 h57 v57 h-57 z M342,228 h57 v57 h-57 z
      M57,285 h57 v57 h-57 z M171,285 h57 v57 h-57 z M285,285 h57 v57 h-57 z M399,285 h57 v57 h-57 z
      M0,342 h57 v57 h-57 z M114,342 h57 v57 h-57 z M228,342 h57 v57 h-57 z M342,342 h57 v57 h-57 z
      M57,399 h57 v57 h-57 z M171,399 h57 v57 h-57 z M285,399 h57 v57 h-57 z M399,399 h57 v57 h-57 z
    " fill="#f0d9b5"/>
  </g>

  <!-- Bottom Navigation Bar -->
  <rect x="0" y="880" width="540" height="80" fill="#1e1c1a"/>
  <circle cx="90" cy="920" r="18" fill="#81b64c"/>
  <circle cx="270" cy="920" r="18" fill="#322f2b"/>
  <circle cx="450" cy="920" r="18" fill="#322f2b"/>
</svg>
`;

// 2. Wide Screenshot SVG (1280x720) - Desktop UI Mockup
const wideScreenshotSvg = `
<svg width="1280" height="720" viewBox="0 0 1280 720" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="720" fill="#121110"/>
  
  <!-- Sidebar -->
  <rect x="0" y="0" width="260" height="720" fill="#1e1c1a"/>
  <text x="32" y="60" font-family="system-ui, sans-serif" font-weight="800" font-size="24" fill="#81b64c">PAL MATE</text>
  
  <rect x="20" y="100" width="220" height="44" rx="10" fill="#81b64c"/>
  <text x="60" y="128" font-family="system-ui, sans-serif" font-weight="700" font-size="15" fill="#ffffff">♟ Arena Catur</text>
  
  <rect x="20" y="156" width="220" height="44" rx="10" fill="none"/>
  <text x="60" y="184" font-family="system-ui, sans-serif" font-weight="600" font-size="15" fill="#a0aec0">🔥 Streak Harian</text>
  
  <rect x="20" y="212" width="220" height="44" rx="10" fill="none"/>
  <text x="60" y="240" font-family="system-ui, sans-serif" font-weight="600" font-size="15" fill="#a0aec0">🏆 Papan Peringkat</text>

  <!-- Main Content Area -->
  <rect x="290" y="40" width="950" height="640" rx="20" fill="#1e1c1a" stroke="#322f2b"/>
  
  <!-- Header -->
  <text x="330" y="90" font-family="system-ui, sans-serif" font-weight="800" font-size="28" fill="#ffffff">Arena Catur Digital Pal Mate</text>
  <text x="330" y="120" font-family="system-ui, sans-serif" font-size="16" fill="#a0aec0">Mainkan catur, latih taktik harian, dan pertahankan streak Anda.</text>
  
  <!-- Board area in wide view -->
  <rect x="330" y="150" width="480" height="480" rx="12" fill="#b58863"/>
  <path d="
    M330,150 h60 v60 h-60 z M450,150 h60 v60 h-60 z M570,150 h60 v60 h-60 z M690,150 h60 v60 h-60 z
    M390,210 h60 v60 h-60 z M510,210 h60 v60 h-60 z M630,210 h60 v60 h-60 z M750,210 h60 v60 h-60 z
    M330,270 h60 v60 h-60 z M450,270 h60 v60 h-60 z M570,270 h60 v60 h-60 z M690,270 h60 v60 h-60 z
    M390,330 h60 v60 h-60 z M510,330 h60 v60 h-60 z M630,330 h60 v60 h-60 z M750,330 h60 v60 h-60 z
    M330,390 h60 v60 h-60 z M450,390 h60 v60 h-60 z M570,390 h60 v60 h-60 z M690,390 h60 v60 h-60 z
    M390,450 h60 v60 h-60 z M510,450 h60 v60 h-60 z M630,450 h60 v60 h-60 z M750,450 h60 v60 h-60 z
    M330,510 h60 v60 h-60 z M450,510 h60 v60 h-60 z M570,510 h60 v60 h-60 z M690,510 h60 v60 h-60 z
    M390,570 h60 v60 h-60 z M510,570 h60 v60 h-60 z M630,570 h60 v60 h-60 z M750,570 h60 v60 h-60 z
  " fill="#f0d9b5"/>
  
  <!-- Control Panel on Right -->
  <rect x="840" y="150" width="360" height="480" rx="12" fill="#262421" stroke="#322f2b"/>
  <text x="870" y="200" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#ffffff">Status Permainan</text>
  <rect x="870" y="220" width="300" height="60" rx="10" fill="#322f2b"/>
  <text x="890" y="256" font-family="system-ui, sans-serif" font-size="16" fill="#81b64c" font-weight="700">Giliran Putih (Kamu)</text>
  <rect x="870" y="300" width="300" height="50" rx="10" fill="#81b64c"/>
  <text x="1020" y="332" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#ffffff" text-anchor="middle">Langkah Baru</text>
</svg>
`;

async function main() {
  console.log('Generating PNG assets with sharp using original palmate-logo.png...');
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const logoSource = path.resolve('palmate-logo.png');
  if (!fs.existsSync(logoSource)) {
    throw new Error('Original palmate-logo.png not found at root!');
  }

  // 1. Copy palmate-logo.png to public/palmate-logo.png
  fs.copyFileSync(logoSource, path.join(publicDir, 'palmate-logo.png'));

  // 2. Copy og-studio-logo-1.png to public/og-studio-logo-1.png if exists
  if (fs.existsSync('og-studio-logo-1.png')) {
    fs.copyFileSync('og-studio-logo-1.png', path.join(publicDir, 'og-studio-logo-1.png'));
  }

  // 3. Generate icon-192.png (192x192 PNG) directly from palmate-logo.png
  await sharp(logoSource)
    .resize(192, 192, { fit: 'contain', background: { r: 18, g: 17, b: 16, alpha: 1 } })
    .ensureAlpha()
    .png({ palette: false, compressionLevel: 6 })
    .toFile(path.join(publicDir, 'icon-192.png'));

  // 4. Generate icon-512.png (512x512 PNG) directly from palmate-logo.png
  await sharp(logoSource)
    .resize(512, 512, { fit: 'contain', background: { r: 18, g: 17, b: 16, alpha: 1 } })
    .ensureAlpha()
    .png({ palette: false, compressionLevel: 6 })
    .toFile(path.join(publicDir, 'icon-512.png'));

  // 5. Generate icon-shortcut.png (192x192 PNG) directly from palmate-logo.png
  await sharp(logoSource)
    .resize(192, 192, { fit: 'contain', background: { r: 18, g: 17, b: 16, alpha: 1 } })
    .ensureAlpha()
    .png({ palette: false, compressionLevel: 6 })
    .toFile(path.join(publicDir, 'icon-shortcut.png'));

  // 6. screenshot-narrow.png (540x960 PNG)
  await sharp(Buffer.from(narrowScreenshotSvg))
    .resize(540, 960)
    .ensureAlpha()
    .png({ palette: false, compressionLevel: 6 })
    .toFile(path.join(publicDir, 'screenshot-narrow.png'));

  // 7. screenshot-wide.png (1280x720 PNG)
  await sharp(Buffer.from(wideScreenshotSvg))
    .resize(1280, 720)
    .ensureAlpha()
    .png({ palette: false, compressionLevel: 6 })
    .toFile(path.join(publicDir, 'screenshot-wide.png'));

  console.log('All PNG assets successfully regenerated with original Pal Mate logo!');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
