import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// 1. App Icon SVG (512x512)
// Designed for both 'any' and 'maskable' (content inside safe area radius 40%)
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with dark theme and chess pattern hint -->
  <rect width="512" height="512" fill="#121110"/>
  
  <!-- Outer Green Glow Circle / Safe Area Friendly -->
  <circle cx="256" cy="256" r="216" fill="#1e1c1a" stroke="#81b64c" stroke-width="12"/>
  
  <!-- Chessboard Square Accents -->
  <rect x="140" y="140" width="116" height="116" fill="#81b64c" opacity="0.15" rx="8"/>
  <rect x="256" y="256" width="116" height="116" fill="#81b64c" opacity="0.15" rx="8"/>
  
  <!-- Central Chess King/Cat Crown Vector -->
  <g transform="translate(106, 110) scale(1.17)">
    <!-- Crown / King Top -->
    <path d="M 128 30 L 140 60 L 175 45 L 160 85 L 96 85 L 81 45 L 116 60 Z" fill="#e2c044"/>
    <circle cx="128" cy="22" r="8" fill="#e2c044"/>
    
    <!-- Paw / Cat Silhouette Base -->
    <path d="M 64 190 C 64 130, 192 130, 192 190 L 192 210 L 64 210 Z" fill="#81b64c"/>
    
    <!-- Chess Knight / Cat Ears -->
    <path d="M 80 135 L 100 85 L 120 115 Z" fill="#81b64c"/>
    <path d="M 176 135 L 156 85 L 136 115 Z" fill="#81b64c"/>
    
    <!-- Face / Eyes -->
    <circle cx="102" cy="145" r="7" fill="#121110"/>
    <circle cx="154" cy="145" r="7" fill="#121110"/>
    <polygon points="128,155 122,163 134,163" fill="#121110"/>
    
    <!-- Pawn Base -->
    <rect x="54" y="210" width="148" height="20" rx="10" fill="#ffffff"/>
  </g>
  
  <!-- Text Label -->
  <text x="256" y="420" font-family="system-ui, sans-serif" font-weight="800" font-size="36" fill="#ffffff" text-anchor="middle" letter-spacing="2">PAL MATE</text>
  <text x="256" y="445" font-family="system-ui, sans-serif" font-weight="600" font-size="16" fill="#81b64c" text-anchor="middle" letter-spacing="4">ARENA CATUR</text>
</svg>
`;

// 2. Shortcut Icon SVG (192x192)
const shortcutSvg = `
<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="40" fill="#81b64c"/>
  <circle cx="96" cy="96" r="72" fill="#121110"/>
  <!-- Fire / Streak Icon -->
  <path d="M96 40 C96 40, 68 76, 68 104 C68 120 80 136 96 136 C112 136 124 120 124 104 C124 76 96 40 96 40 Z" fill="#f59e0b"/>
  <path d="M96 72 C96 72, 82 92, 82 108 C82 118 88 126 96 126 C104 126 110 118 110 108 C110 92 96 72 96 72 Z" fill="#ef4444"/>
</svg>
`;

// 3. Narrow Screenshot SVG (540x960) - Mobile UI Mockup
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

// 4. Wide Screenshot SVG (1280x720) - Desktop UI Mockup
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
  console.log('Generating PNG assets with sharp...');
  const publicDir = path.resolve('public');

  // 1. icon-192.png (192x192 PNG)
  await sharp(Buffer.from(iconSvg))
    .resize(192, 192)
    .ensureAlpha()
    .png({ palette: false, compressionLevel: 6 })
    .toFile(path.join(publicDir, 'icon-192.png'));

  // 2. icon-512.png (512x512 PNG)
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .ensureAlpha()
    .png({ palette: false, compressionLevel: 6 })
    .toFile(path.join(publicDir, 'icon-512.png'));

  // 3. icon-shortcut.png (192x192 PNG)
  await sharp(Buffer.from(shortcutSvg))
    .resize(192, 192)
    .ensureAlpha()
    .png({ palette: false, compressionLevel: 6 })
    .toFile(path.join(publicDir, 'icon-shortcut.png'));

  // 4. screenshot-narrow.png (540x960 PNG)
  await sharp(Buffer.from(narrowScreenshotSvg))
    .resize(540, 960)
    .ensureAlpha()
    .png({ palette: false, compressionLevel: 6 })
    .toFile(path.join(publicDir, 'screenshot-narrow.png'));

  // 5. screenshot-wide.png (1280x720 PNG)
  await sharp(Buffer.from(wideScreenshotSvg))
    .resize(1280, 720)
    .ensureAlpha()
    .png({ palette: false, compressionLevel: 6 })
    .toFile(path.join(publicDir, 'screenshot-wide.png'));

  console.log('All PNG assets successfully generated!');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
