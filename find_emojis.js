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

const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{1F600}-\u{1F64F}]|[\u{2700}-\u{27BF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]/u;

files.forEach(file => {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (emojiRegex.test(line)) {
      console.log(`${file}:${index + 1}: ${line.trim()}`);
    }
  });
});
