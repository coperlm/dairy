// 生成加密密钥 - 基于口令派生
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keysDir = path.join(__dirname, '../keys');

// 确保 keys 目录存在
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提示用户输入口令
function promptPassword() {
  return new Promise((resolve) => {
    rl.question('请输入口令 (6个字符以上): ', (password) => {
      if (!password || password.length < 6) {
        console.log('⚠️  口令至少需要 6 个字符');
        resolve(promptPassword());
      } else {
        rl.question('请再次输入口令确认: ', (confirm) => {
          if (password !== confirm) {
            console.log('⚠️  两次输入不一致');
            resolve(promptPassword());
          } else {
            rl.close();
            resolve(password);
          }
        });
      }
    });
  });
}

// 将口令派生为 AES-256 密钥
function deriveKey(passphrase) {
  // 使用 PBKDF2 从口令派生固定的 256 位密钥
  const salt = 'diary-encryption-salt-2025'; // 固定盐值,保证相同口令产生相同密钥
  return crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha256').toString('hex');
}

async function main() {
  console.log('🔑 设置加密口令...');
  console.log('');

  // 获取用户口令
  const passphrase = await promptPassword();
  
  // 计算口令哈希(用于前端验证)
  const passphraseHash = crypto.createHash('sha256').update(passphrase).digest('hex');
  
  // 从口令派生加密密钥
  const encryptionKey = deriveKey(passphrase);
  
  console.log('');
  console.log('✅ 密钥派生完成!');
  
  // 保存口令哈希(用于前端验证,可以提交到 GitHub)
  const hashPath = path.join(keysDir, 'passphrase-hash.txt');
  fs.writeFileSync(hashPath, passphraseHash);
  console.log(`✅ 口令哈希: ${hashPath}`);
  
  // 保存加密密钥到 .env 文件(本地加密用)
  const envPath = path.join(__dirname, '../.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    // 移除旧的密钥行
    envContent = envContent.split('\n')
      .filter(line => !line.startsWith('DIARY_ENCRYPTION_KEY=') && !line.startsWith('DIARY_KEY='))
      .join('\n');
  }
  
  envContent += `\n# 日记加密密钥 - 从口令派生\nDIARY_ENCRYPTION_KEY=${encryptionKey}\n`;
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log(`✅ 加密密钥已保存到 .env`);

  console.log('');
  console.log('📋 接下来的步骤:');
  console.log('');
  console.log('1️⃣  将加密密钥添加到 GitHub Secrets:');
  console.log('   访问: https://github.com/coperlm/dairy/settings/secrets/actions');
  console.log('   名称: DIARY_ENCRYPTION_KEY');
  console.log(`   值: ${encryptionKey}`);
  console.log('');
  console.log('2️⃣  测试加密:');
  console.log('   npm run encrypt');
  console.log('');
  console.log('3️⃣  提交到 GitHub:');
  console.log('   git add keys/passphrase-hash.txt');
  console.log('   git commit -m "添加口令验证"');
  console.log('   git push');
  console.log('');
  console.log('💡 工作原理:');
  console.log(`   - 用户输入口令: "${passphrase}"`);
  console.log('   - 前端验证哈希是否匹配');
  console.log('   - 前端用相同算法派生密钥');
  console.log('   - 用派生的密钥解密日记');
  console.log('');
  console.log('⚠️  重要:');
  console.log('   - 口令哈希文件可以提交');
  console.log('   - .env 文件不要提交');
  console.log('   - GitHub Secret 和 .env 的密钥必须一致');
  console.log('   - 请牢记你的口令!');
  console.log('');
}

main();
