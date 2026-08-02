import fs from 'fs';
import path from 'path';

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{1F600}-\u{1F64F}]|[\u{2700}-\u{27BF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]/gu;

const srcFiles = getAllFiles(path.resolve('src'));
let totalCleaned = 0;

for (const filePath of srcFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (emojiRegex.test(content)) {
    content = content.replace(emojiRegex, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned emojis in: ${filePath}`);
    totalCleaned++;
  }
}

console.log(`Finished purging emojis in ${totalCleaned} files.`);
