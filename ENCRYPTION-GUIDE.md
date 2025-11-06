# 🔐 加密日记系统完整指南

## 📋 加密流程概览

### 1️⃣ 本地加密过程

**脚本**: `scripts/encrypt-diaries.js`

```
diary/*.md (原始日记) 
    ↓ 读取并解析
JSON 数组 [{title, date, content, tags}, ...]
    ↓ CryptoJS.AES.encrypt(JSON, password)
加密字符串 "U2FsdGVkX1/..."
    ↓ 包装成 JSON
{ "data": "U2FsdGVkX1/...", "timestamp": "...", "count": 7 }
    ↓ 写入文件并提交到 GitHub
public/diary-data.json → Git → GitHub
```

**执行命令**:
```bash
node scripts/encrypt-diaries.js
```

**使用的密码**: 从 `.env` 文件读取 `DIARY_PASSWORD=123457`

---

### 2️⃣ GitHub 存储和部署

**加密文件直接提交到仓库**: `public/diary-data.json`

**优势**:
- ✅ 无需手动复制粘贴到 GitHub Secrets
- ✅ 方便调试和版本控制
- ✅ 自动化部署流程简单
- ✅ 加密数据本身不泄露原文

**GitHub Actions**: `.github/workflows/deploy.yml`
```yaml
- name: Verify encrypted diary data
  run: |
    if [ -f "public/diary-data.json" ]; then
      echo "✅ Found encrypted diary data file"
    fi
```

**流程**:
```
本地: public/diary-data.json (已加密)
    ↓ git push
GitHub 仓库: public/diary-data.json
    ↓ GitHub Actions 构建
网站部署: https://coperlm.github.io/dairy/diary-data.json
```

---

### 3️⃣ 浏览器解密过程

**文件**: `src/components/DiaryList.astro`

```
用户输入密码 "123457"
    ↓ SHA-256 哈希验证
登录成功，密码存入 sessionStorage
    ↓ 读取加密数据
fetch('/dairy/diary-data.json') → { "data": "U2FsdGVkX1/...", ... }
    ↓ CryptoJS.AES.decrypt(data.data, password)
解密后的 JSON 字符串
    ↓ JSON.parse()
日记数组 [{title, date, content, tags}, ...]
    ↓ 渲染
显示在页面上
```

---

## � 快速开始

### 方式 1: 一键更新部署（推荐）

**Windows 用户**:
```powershell
.\update-and-deploy.bat
```

或直接运行:
```powershell
node scripts/update-and-deploy.js
```

**脚本会自动完成**:
1. ✅ 更新 diary 子模块（拉取最新日记）
2. ✅ 加密所有日记
3. ✅ 提交加密后的文件到 Git
4. ✅ 推送到 GitHub 触发自动部署

---

### 方式 2: 手动步骤

#### 步骤 1: 更新子模块（如果日记有更新）
```powershell
git submodule update --remote diary
```

#### 步骤 2: 加密日记
```powershell
node scripts/encrypt-diaries.js
```

#### 步骤 3: 提交和推送
```powershell
git add public/diary-data.json diary
git commit -m "更新加密日记"
git push origin main
```

#### 步骤 4: 等待部署
访问 https://github.com/coperlm/dairy/actions 查看部署进度

---

## 📝 日常使用流程

1. 在 `diary/` 子模块中编写或修改日记
2. 在子模块中提交: `cd diary && git add . && git commit -m "新日记" && git push`
3. 回到主项目: `cd ..`
4. 运行一键部署: `.\update-and-deploy.bat`
5. 完成！等待几分钟后访问网站查看

---

## 🧪 测试解密

创建测试脚本验证加密是否正确：

```javascript
import CryptoJS from 'crypto-js';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./public/diary-data.json', 'utf-8'));
const password = '123457';

const decrypted = CryptoJS.AES.decrypt(data.data, password).toString(CryptoJS.enc.Utf8);

if (decrypted) {
  const diaries = JSON.parse(decrypted);
  console.log('✅ 解密成功！');
  console.log(`📖 日记数量: ${diaries.length}`);
  console.log(`📝 第一篇: ${diaries[0].title}`);
} else {
  console.log('❌ 解密失败！');
}
```

---

## 📝 注意事项

1. **密码一致性**: 确保 `.env` 中的 `DIARY_PASSWORD` 与 `Login.astro` 中的密码哈希匹配
2. **JSON 完整性**: 复制 Secret 时必须包含完整的 JSON（包括花括号）
3. **特殊字符**: GitHub Secret 会自动处理换行，但要确保 JSON 格式正确
4. **不要提交 .env**: `.env` 文件包含真实密码，已在 `.gitignore` 中排除

---

## 🔒 安全建议

- ✅ 使用强密码（当前示例密码 "123457" 仅用于演示）
- ✅ 定期更换密码
- ✅ 不要在公开代码中包含密码
- ✅ 使用 HTTPS 访问网站
- ✅ 私有子模块存储原始日记

