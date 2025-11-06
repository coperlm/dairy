# 快速部署指南

## 第一步：设置 GitHub Secrets

### 1. 复制加密数据

已经为你生成了加密的日记数据。请复制以下内容：

**文件位置**: `public/diary-data.json`

你需要复制整个文件的内容（已经在上面的输出中显示）。

### 2. 在 GitHub 设置 Secrets

1. 打开你的 GitHub 仓库：https://github.com/coperlm/dairy

2. 点击 **Settings** 标签

3. 在左侧菜单选择 **Secrets and variables** > **Actions**

4. 点击 **New repository secret** 按钮

5. 创建第一个 Secret：
   - Name: `ENCRYPTION_KEY`
   - Value: `your-32-character-encryption-key-here`
   - 点击 **Add secret**

6. 再次点击 **New repository secret** 创建第二个 Secret：
   - Name: `ENCRYPTED_DIARIES`
   - Value: 粘贴 `public/diary-data.json` 的完整内容
   - 点击 **Add secret**

## 第二步：启用 GitHub Pages

1. 在 GitHub 仓库，点击 **Settings** 标签

2. 在左侧菜单找到 **Pages**

3. 在 **Build and deployment** 部分：
   - Source: 选择 **GitHub Actions**
   - 保存

## 第三步：推送代码并部署

```bash
git add .
git commit -m "Setup Astro diary with encryption"
git push origin main
```

## 第四步：查看部署

1. 前往仓库的 **Actions** 标签

2. 你会看到 "Deploy to GitHub Pages" 工作流正在运行

3. 等待部署完成（通常需要 2-3 分钟）

4. 部署成功后，访问：**https://coperlm.github.io/dairy/**

## 访问密码

你在 `.env` 文件中设置的密码。默认密码的哈希已经设置好了。

## 更新日记内容

当你添加新日记后：

1. 本地运行加密脚本：
   ```bash
   node scripts/encrypt-diaries.js
   ```

2. 复制生成的 `public/diary-data.json` 内容

3. 更新 GitHub Secret `ENCRYPTED_DIARIES`

4. 手动触发工作流或推送代码

---

## 常见问题

### Q: 部署失败怎么办？

A: 检查 Actions 标签中的错误日志。常见问题：
- Secrets 没有正确设置
- GitHub Pages 没有启用
- 工作流文件语法错误

### Q: 网站显示空白？

A: 
1. 检查浏览器控制台是否有错误
2. 确认 `ENCRYPTED_DIARIES` Secret 已设置
3. 清除浏览器缓存重试

### Q: 如何修改密码？

A: 
1. 修改 `.env` 文件中的 `DIARY_PASSWORD`
2. 重新运行 `node scripts/encrypt-diaries.js`
3. 更新 GitHub Secrets
4. 重新部署

---

## 技术架构

- **前端框架**: Astro
- **样式**: Tailwind CSS
- **加密**: AES-256 (CryptoJS)
- **部署**: GitHub Actions + GitHub Pages
- **隐私保护**: 
  - 原始日记在子模块（不上传）
  - 只上传加密后的数据
  - 客户端解密（密码不离开浏览器）

## 安全性说明

✅ **高度安全**:
- 原始日记保存在私密子模块
- 数据使用 AES-256 加密
- 密码使用 SHA-256 哈希
- 解密只在客户端进行

⚠️ **注意事项**:
- 不要在公开场合分享 `.env` 文件
- 定期更换密码
- 定期备份 diary 子模块
