import fs from 'fs';
import path from 'path';

const files = [
  'src/App.tsx',
  'src/components/Features17to25.tsx',
  'src/components/Features26to30.tsx',
  'src/components/Features31to40.tsx',
  'src/data.ts',
  'src/utils.ts'
];

const emojiMap = {
  "🏆": "",
  "👑": "Leader",
  "⭐": "Bintang",
  "⚔️": "Tanding",
  "⚔": "Tanding",
  "🛡️": "Perisai",
  "🛡": "Perisai",
  "💬": "Pesan",
  "💰": "Koin",
  "💎": "Berlian",
  "🎁": "Hadiah",
  "⚡": "Kilat",
  "🎖️": "Lencana",
  "🎖": "Lencana",
  "🥇": "Juara 1",
  "🥈": "Juara 2",
  "🥉": "Juara 3",
  "🔥": "Hot",
  "🎯": "Misi",
  "👉": "Langkah",
  "✨": "Spesial",
  "✅": "Sukses",
  "❌": "Gagal",
  "✔️": "Aktif",
  "✔": "Aktif",
  "🔒": "Terkunci",
  "🔑": "Sistem",
  "💥": "Bonus",
  "🗡️": "Serang",
  "🗡": "Serang",
  "📝": "Catatan",
  "👥": "Anggota",
  "🏷️": "Label",
  "🏷": "Label",
  "❓": "Tanya",
  "❤️": "Nyawa",
  "🌸": "Lotus",
  "💪": "Kuat",
  "✌️": "Sip",
  "😁": "Senang",
  "😂": "Lucu",
  "👍": "Mantap",
  "🎮": "Game",
  "🦁": "Singa",
  "🏰": "Istana",
  "♟": "p",
  "♞": "N",
  "♝": "B",
  "⨉": "x",
  "☕": "Kopi",
  "👀": "Lihat",
  "📖": "Buku",
  "🔍": "Cari",
  "🧠": "Otak"
};

const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{1F600}-\u{1F64F}]|[\u{2700}-\u{27BF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]/gu;

files.forEach(file => {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Precise map replacements
  for (const [emoji, text] of Object.entries(emojiMap)) {
    // Escape regex characters just in case
    const escapedEmoji = emoji.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    content = content.replace(new RegExp(escapedEmoji, 'g'), text);
  }

  // 2. Clear any leftover characters matching general emoji block ranges
  content = content.replace(emojiRegex, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully purged emojis in file: ${file}`);
});
