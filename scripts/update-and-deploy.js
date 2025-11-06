#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 自动更新和部署日记\n');

try {
  // 1. 检查子模块是否有更新
  console.log('📥 检查子模块更新...');
  try {
    execSync('git submodule update --remote diary', { stdio: 'inherit' });
    console.log('✅ 子模块已更新\n');
  } catch (error) {
    console.log('ℹ️  子模块无更新或出错，继续...\n');
  }

  // 2. 运行加密脚本
  console.log('🔐 正在加密日记...');
  execSync('node scripts/encrypt-diaries.js', { stdio: 'inherit' });
  
  // 3. 检查是否有文件变化
  console.log('\n📝 检查文件变化...');
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  
  if (!status.trim()) {
    console.log('✅ 没有需要提交的变化');
    console.log('💡 日记内容可能没有更新，或加密结果相同');
    return;
  }
  
  console.log('发现以下变化:');
  console.log(status);
  
  // 4. 提交变化
  console.log('\n📦 提交变化...');
  execSync('git add public/diary-data.json diary', { stdio: 'inherit' });
  
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const commitMessage = `更新加密日记 - ${timestamp}`;
  
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  console.log('✅ 提交完成\n');
  
  // 5. 推送到 GitHub
  console.log('🚀 推送到 GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('\n✅ 部署完成！');
  console.log('🌐 等待 GitHub Actions 构建完成后访问:');
  console.log('   https://coperlm.github.io/dairy/');
  
} catch (error) {
  console.error('\n❌ 错误:', error.message);
  process.exit(1);
}
