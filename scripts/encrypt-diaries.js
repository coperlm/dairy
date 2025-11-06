// 加密日记数据的构建脚本
import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量读取密码，如果没有则使用默认值（仅用于开发）
const PASSWORD = process.env.DIARY_PASSWORD || 'default_password';

// 读取 diary 目录中的所有 markdown 文件
function readDiaryFiles() {
  const diaryDir = path.join(__dirname, '../diary');
  
  if (!fs.existsSync(diaryDir)) {
    console.warn('警告: diary 目录不存在，创建示例数据...');
    return createSampleData();
  }
  
  const files = fs.readdirSync(diaryDir).filter(file => file.endsWith('.md'));
  const diaries = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(diaryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 解析 markdown 文件
      const lines = content.split('\n');
      let title = file.replace('.md', '');
      let date = new Date().toISOString().split('T')[0];
      let tags = [];
      let contentText = '';
      
      // 解析 frontmatter (如果存在)
      if (lines[0] === '---') {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i] === '---') {
            contentText = lines.slice(i + 1).join('\n').trim();
            break;
          }
          
          const line = lines[i];
          if (line.startsWith('title:')) {
            title = line.replace('title:', '').trim().replace(/['"]/g, '');
          } else if (line.startsWith('date:')) {
            date = line.replace('date:', '').trim().replace(/['"]/g, '');
          } else if (line.startsWith('tags:')) {
            const tagsStr = line.replace('tags:', '').trim();
            tags = tagsStr.replace(/[\[\]]/g, '').split(',').map(t => t.trim().replace(/['"]/g, ''));
          }
        }
      } else {
        // 没有 frontmatter，第一行作为标题
        if (lines[0].startsWith('# ')) {
          title = lines[0].replace('# ', '').trim();
          contentText = lines.slice(1).join('\n').trim();
        } else {
          contentText = content.trim();
        }
        
        // 尝试从文件名提取日期 (格式: YYYY-MM-DD-title.md)
        const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          date = dateMatch[1];
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
      console.error(`读取文件 ${file} 失败:`, error);
    }
  }
  
  return diaries;
}

// 创建示例数据（当 diary 目录不存在时）
function createSampleData() {
  return [
    {
      title: '欢迎使用加密日记本',
      date: new Date().toISOString().split('T')[0],
      content: '这是一个示例日记。\n\n请将你的日记 markdown 文件放在 diary 子模块中。\n\n每次构建时，这些文件会被加密并打包到网站中。',
      tags: ['示例', '欢迎']
    }
  ];
}

// 加密数据
function encryptData(data, password) {
  const jsonStr = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonStr, password).toString();
  return encrypted;
}

// 生成密码哈希（用于登录验证）
function generatePasswordHash(password) {
  return CryptoJS.SHA256(password).toString();
}

// 主函数
function main() {
  console.log('🔐 开始加密日记数据...');
  
  // 读取日记文件
  const diaries = readDiaryFiles();
  console.log(`📖 找到 ${diaries.length} 篇日记`);
  
  // 加密数据
  const encryptedData = encryptData(diaries, PASSWORD);
  
  // 确保 public 目录存在
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // 写入加密后的数据
  const outputData = {
    data: encryptedData,
    timestamp: new Date().toISOString(),
    count: diaries.length
  };
  
  fs.writeFileSync(
    path.join(publicDir, 'diary-data.json'),
    JSON.stringify(outputData)
  );
  
  console.log('✅ 日记数据加密完成！');
  console.log(`📝 生成的密码哈希: ${generatePasswordHash(PASSWORD)}`);
  console.log('⚠️  请将上面的哈希值复制到 src/components/Login.astro 中的 PASSWORD_HASH');
}

main();
