# GitHub Pages 部署指南

## 部署步骤

### 1. 设置 GitHub Repository Secrets

为了保护你的日记内容，我们需要将加密后的数据存储为 GitHub Secrets。

1. 在本地运行加密脚本：
   ```bash
   node scripts/encrypt-diaries.js
   ```

2. 这会生成 `public/encrypted-diaries.json` 文件

3. 复制该文件的全部内容

4. 前往 GitHub 仓库设置：
   - 点击仓库的 **Settings** 标签
   - 在左侧菜单选择 **Secrets and variables** > **Actions**
   - 点击 **New repository secret**

5. 创建以下 Secrets：

   **Secret 1: ENCRYPTION_KEY**
   - Name: `ENCRYPTION_KEY`
   - Value: 你在 `.env` 文件中设置的密钥（32字符）
   
   **Secret 2: ENCRYPTED_DIARIES**
   - Name: `ENCRYPTED_DIARIES`
   - Value: 将 `public/encrypted-diaries.json` 文件的完整内容粘贴进去

### 2. 启用 GitHub Pages

1. 前往仓库的 **Settings** > **Pages**
2. 在 **Source** 下选择 **GitHub Actions**
3. 保存设置

### 3. 触发部署

有两种方式触发部署：

**方式 1: 推送代码**
```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

**方式 2: 手动触发**
1. 前往仓库的 **Actions** 标签
2. 选择 "Deploy to GitHub Pages" 工作流
3. 点击 **Run workflow** 按钮

### 4. 查看部署状态

1. 在 **Actions** 标签中可以看到部署进度
2. 部署成功后，网站地址为：`https://coperlm.github.io/dairy/`

### 5. 更新日记内容

当你在 `diary` 子模块中添加或修改日记后：

1. 在主仓库本地运行：
   ```bash
   node scripts/encrypt-diaries.js
   ```

2. 复制生成的 `public/encrypted-diaries.json` 内容

3. 更新 GitHub Secret `ENCRYPTED_DIARIES`：
   - Settings > Secrets and variables > Actions
   - 点击 `ENCRYPTED_DIARIES` 右侧的 **Update**
   - 粘贴新的内容

4. 手动触发部署或推送代码触发

## 安全说明

### 为什么这样做？

1. **子模块不上传**: `submodules: false` 确保 GitHub Actions 不会克隆你的私密 `diary` 子模块
2. **加密数据**: 所有日记内容在本地加密后才上传
3. **Secrets 保护**: 敏感数据存储在 GitHub Secrets 中，不会出现在代码仓库
4. **前端解密**: 只有输入正确密码才能在浏览器中解密内容

### 密码设置

你的访问密码设置在本地 `.env` 文件中：
```
DIARY_PASSWORD=你的密码
ENCRYPTION_KEY=32位随机密钥
```

修改密码后，需要：
1. 重新运行 `node scripts/encrypt-diaries.js`
2. 更新 GitHub Secrets
3. 重新部署

## 故障排除

### 问题：部署失败显示 "Invalid YAML front matter"

**原因**: GitHub Pages 默认使用 Jekyll 构建

**解决方案**: 
- 确保仓库根目录有 `.nojekyll` 文件（已创建）
- 在 Settings > Pages 中选择 **GitHub Actions** 作为 Source

### 问题：网站显示空白或无法加载日记

**检查清单**:
1. 确认 `ENCRYPTED_DIARIES` Secret 已正确设置
2. 检查浏览器控制台是否有错误
3. 确认输入的密码正确
4. 查看 Actions 日志确认构建成功

### 问题：如何查看解密后的密码哈希？

运行加密脚本时，会显示密码哈希：
```bash
node scripts/encrypt-diaries.js
# 输出会包含: Password hash for Login.astro: ...
```

## 本地开发

```bash
# 安装依赖
npm install

# 加密日记数据
node scripts/encrypt-diaries.js

# 启动开发服务器
npm run dev

# 访问 http://localhost:4321
```

## 目录结构

```
dairy/                          # 主仓库（公开）
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions 工作流
├── diary/                      # Git 子模块（私密，不上传）
│   ├── index.json             # 日记索引
│   └── *.md                   # 日记文件
├── public/
│   └── encrypted-diaries.json # 加密后的日记（本地生成）
├── scripts/
│   └── encrypt-diaries.js     # 加密脚本
├── src/
│   ├── components/
│   ├── layouts/
│   └── pages/
├── .env                        # 本地环境变量（不上传）
├── .gitignore
├── .nojekyll                   # 禁用 Jekyll
└── package.json
```

## 维护建议

1. **定期备份**: 定期备份 `diary` 子模块
2. **密钥安全**: 不要将 `.env` 文件提交到 Git
3. **访问控制**: 考虑将 `diary` 子模块设为私有仓库
4. **密码强度**: 使用强密码并定期更换

## 自动化更新（可选）

如果你想要自动化更新过程，可以创建一个脚本：

```bash
# update-and-deploy.sh
#!/bin/bash

# 1. 加密日记
node scripts/encrypt-diaries.js

# 2. 提示更新 Secret
echo "请将以下内容复制到 GitHub Secret ENCRYPTED_DIARIES："
cat public/encrypted-diaries.json

# 3. 等待用户确认
read -p "已更新 Secret？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 4. 触发部署
    git add .
    git commit -m "Update diary content"
    git push origin main
    echo "部署已触发！"
fi
```

使用方法：
```bash
chmod +x update-and-deploy.sh
./update-and-deploy.sh
```
