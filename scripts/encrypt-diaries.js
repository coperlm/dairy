import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PASSPHRASE_HASH_PATH = path.join(__dirname, '../keys/passphrase-hash.txt');

function readDiaryFiles() {
  const diaryDir = path.join(__dirname, '../diary');
  if (!fs.existsSync(diaryDir)) return [];
  
  const datePattern = /^\d{4}-\d{2}-\d{2}\.md$/;
  const files = fs.readdirSync(diaryDir).filter(file => datePattern.test(file));
  const diaries = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(diaryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const date = file.replace('.md', '');
      const lines = content.split('\n');
      let title = date;
      let tags = [];
      let contentText = '';
      
      if (lines[0] === '---') {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i] === '---') {
            contentText = lines.slice(i + 1).join('\n').trim();
            break;
          }
          const line = lines[i];
          if (line.startsWith('title:')) {
            title = line.replace('title:', '').trim().replace(/['"]/g, '');
          } else if (line.startsWith('tags:')) {
            const tagsStr = line.replace('tags:', '').trim();
            tags = tagsStr.replace(/[\[\]]/g, '').split(',').map(t => t.trim().replace(/['"]/g, ''));
          }
        }
      } else {
        if (lines[0].startsWith('# ')) {
          title = lines[0].replace('# ', '').trim();
          contentText = lines.slice(1).join('\n').trim();
        } else {
          contentText = content.trim();
        }
      }
      
      diaries.push({
        title,
        date,
        content: contentText,
        tags: tags.length > 0 ? tags : undefined,
        filename: file
      });
    } catch (error) {
      console.error('Error reading file:', file, error.message);
    }
  }
  
  diaries.sort((a, b) => b.date.localeCompare(a.date));
  return diaries;
}

function encryptData(data, key) {
  const jsonStr = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonStr, key).toString();
}

function main() {
  console.log('🔐 Starting diary encryption...');
  
  const diaries = readDiaryFiles();
  console.log(`📖 Found ${diaries.length} diary entries`);
  
  // 从环境变量读取加密密钥
  const encryptionKey = process.env.DIARY_ENCRYPTION_KEY;
  
  if (!encryptionKey) {
    console.error('');
    console.error('❌ Error: DIARY_ENCRYPTION_KEY not found in .env file');
    console.error('   Please run: npm run generate-keys');
    console.error('');
    process.exit(1);
  }
  
  console.log('🔑 Loaded encryption key');
  
  // 用密钥加密日记数据
  const encryptedData = encryptData(diaries, encryptionKey);
  console.log('✅ Encrypted diary data');
  
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const outputData = {
    data: encryptedData,
    timestamp: new Date().toISOString(),
    count: diaries.length,
    version: '2.0'
  };
  
  fs.writeFileSync(
    path.join(publicDir, 'diary-data.json'),
    JSON.stringify(outputData)
  );
  
  // 复制口令哈希文件到 public 目录
  if (fs.existsSync(PASSPHRASE_HASH_PATH)) {
    fs.copyFileSync(
      PASSPHRASE_HASH_PATH,
      path.join(publicDir, 'passphrase-hash.txt')
    );
    console.log('✅ Copied passphrase hash');
  }
  
  console.log('');
  console.log('✨ Encryption complete!');
  console.log(`📦 Encrypted ${diaries.length} diary entries`);
  console.log('🔐 Using AES-256 encryption');
  console.log('');
}

main();
