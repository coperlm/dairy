# 🚀 快速设置指南

## 已完成的设置

✅ Astro + Tailwind CSS 项目结构已创建  
✅ Git 子模块已添加 (git@github.com:coperlm/diary.git)  
✅ 密码加密系统已配置  
✅ GitHub Actions 部署流程已设置  
✅ 开发服务器正在运行: http://localhost:4321/dairy

## 下一步操作

### 1. 设置你的密码

编辑 `.env` 文件，修改密码：

```bash
DIARY_PASSWORD=你的强密码
```

### 2. 重新生成密码哈希

```bash
node scripts/encrypt-diaries.js
```

将输出的密码哈希复制到 `src/components/Login.astro` 中的 `PASSWORD_HASH`。

### 3. 测试本地网站

访问: http://localhost:4321/dairy

- 默认密码: `your_secret_password_here`
- 系统会读取 `diary` 子模块中的 markdown 文件

### 4. 准备部署

#### 在 GitHub 设置 Secret:

1. 访问 https://github.com/coperlm/dairy/settings/secrets/actions
2. 点击 "New repository secret"
3. Name: `DIARY_PASSWORD`
4. Value: 你的密码（与 .env 中相同）

#### 启用 GitHub Pages:

1. 访问 https://github.com/coperlm/dairy/settings/pages
2. Source 选择: "GitHub Actions"

### 5. 推送代码部署

```bash
git add .
git commit -m "Setup encrypted diary with Astro"
git push origin main
```

等待几分钟后，访问: https://coperlm.github.io/dairy/

## 日记格式说明

在 `diary` 子模块中创建 `.md` 文件，支持两种格式：

### 格式 1: 带 Frontmatter (推荐)

```markdown
---
title: 今天的心情
date: 2025-11-06
tags: [心情, 生活]
---

今天天气很好，心情也不错...
```

### 格式 2: 简单格式

文件名: `2025-11-06-title.md`

```markdown
# 今天的心情

今天天气很好，心情也不错...
```

## 重要提示

⚠️ `.env` 文件已添加到 `.gitignore`，不会被提交  
⚠️ `diary/` 目录已添加到 `.gitignore`，原始日记不会上传到主仓库  
⚠️ 只有加密后的数据会被部署到 GitHub Pages  
⚠️ 记得定期备份 `diary` 子模块的内容

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 加密日记数据
node scripts/encrypt-diaries.js

# 更新子模块
git submodule update --remote diary
```

## 故障排除

### 问题: 页面显示 "加载日记失败"

**解决方案:**
1. 确保 `public/diary-data.json` 文件存在
2. 运行 `node scripts/encrypt-diaries.js` 重新生成
3. 检查密码是否正确

### 问题: 子模块为空

**解决方案:**
```bash
git submodule update --init --recursive
```

### 问题: 部署失败

**解决方案:**
1. 确保 GitHub Secret `DIARY_PASSWORD` 已设置
2. 检查 `.github/workflows/deploy.yml` 配置
3. 查看 Actions 标签页的错误日志

## 安全最佳实践

1. ✅ 使用强密码 (至少 16 个字符)
2. ✅ 定期更改密码
3. ✅ 将 diary 子模块设为私有仓库
4. ✅ 不要在代码中硬编码密码
5. ✅ 使用 HTTPS 访问网站

---

享受你的私密日记本！📔✨
