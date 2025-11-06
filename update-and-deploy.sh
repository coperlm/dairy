#!/bin/bash

# 加密日记自动更新部署脚本

echo "=========================================="
echo "🚀 加密日记自动更新和部署"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 1. 更新子模块
echo "📥 步骤 1/4: 更新 diary 子模块..."
if git submodule update --remote diary; then
    echo "✅ 子模块更新完成"
else
    echo "⚠️  子模块更新失败或无更新，继续..."
fi
echo ""

# 2. 加密日记
echo "🔐 步骤 2/4: 加密日记..."
if node scripts/encrypt-diaries.js; then
    echo "✅ 日记加密完成"
else
    echo "❌ 加密失败"
    exit 1
fi
echo ""

# 3. 检查是否有变化
echo "📝 步骤 3/4: 检查文件变化..."
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 没有需要提交的变化"
    echo "💡 日记内容可能没有更新，或加密结果相同"
    exit 0
fi

echo "发现以下变化:"
git status --short
echo ""

# 4. 提交和推送
echo "📦 步骤 4/4: 提交并推送到 GitHub..."
git add public/diary-data.json diary

# 生成提交信息
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
COMMIT_MSG="更新加密日记 - ${TIMESTAMP}"

if git commit -m "${COMMIT_MSG}"; then
    echo "✅ 提交完成"
else
    echo "❌ 提交失败"
    exit 1
fi
echo ""

echo "🚀 推送到 GitHub..."
if git push origin main; then
    echo ""
    echo "=========================================="
    echo "✅ 部署完成！"
    echo "=========================================="
    echo ""
    echo "🌐 等待 GitHub Actions 构建完成后访问:"
    echo "   https://coperlm.github.io/dairy/"
    echo ""
    echo "📊 查看部署进度:"
    echo "   https://github.com/coperlm/dairy/actions"
    echo ""
else
    echo "❌ 推送失败"
    exit 1
fi
