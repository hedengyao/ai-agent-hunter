#!/bin/bash

# AI Agent Hunter - GitHub 快速设置脚本

echo "🚀 设置 GitHub 仓库..."

# 检查 Git
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装"
    echo "请先安装 Git: https://git-scm.com/"
    exit 1
fi

# 初始化 Git
echo "📝 初始化 Git 仓库..."
git init

# 添加所有文件
echo "📦 添加文件..."
git add .

# 创建提交
echo "💾 创建提交..."
read -p "输入提交信息 (默认: Initial commit): " commit_msg
commit_msg=${commit_msg:-"🎉 AI Agent Hunter - Initial commit for OKX Hackathon"}

git commit -m "$commit_msg"

# 设置默认分支
git branch -M main

# 添加远程仓库
echo ""
echo "🔗 添加远程仓库..."
read -p "输入 GitHub 仓库 URL (例如：https://github.com/yourusername/ai-agent-hunter.git): " repo_url

if [ -n "$repo_url" ]; then
    git remote add origin "$repo_url"
    echo "✅ 远程仓库已添加: $repo_url"
    
    # 推送到 GitHub
    echo ""
    echo "📤 推送到 GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ 推送成功！"
        echo ""
        echo "📋 下一步:"
        echo "1. 访问 GitHub 仓库查看代码"
        echo "2. 运行 ./deploy.sh 部署到 Vercel"
        echo "3. 准备比赛提交材料"
    else
        echo ""
        echo "❌ 推送失败"
        echo "请检查:"
        echo "1. GitHub 仓库是否存在"
        echo "2. 是否有推送权限"
        echo "3. 网络连接是否正常"
    fi
else
    echo ""
    echo "⚠️ 未输入仓库 URL"
    echo "可以稍后手动添加:"
    echo "  git remote add origin <your-repo-url>"
    echo "  git push -u origin main"
fi

echo ""
echo "🎉 GitHub 设置完成！"
