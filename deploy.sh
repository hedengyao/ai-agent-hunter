#!/bin/bash

# AI Agent Hunter 部署脚本
# 用于快速部署到 Vercel

echo "🚀 开始部署 AI Agent Hunter..."

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "请运行：npm i -g vercel"
    exit 1
fi

# 检查登录状态
echo "📝 检查 Vercel 登录状态..."
vercel whoami

if [ $? -ne 0 ]; then
    echo "❌ 未登录 Vercel"
    echo "请运行：vercel login"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建检查
echo "🔨 构建检查..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功！"

# 部署
echo "🌐 开始部署..."
read -p "是否部署到生产环境？(y/n): " confirm

if [ "$confirm" = "y" ]; then
    echo "🚀 部署到生产环境..."
    vercel --prod
else
    echo "🧪 部署到预览环境..."
    vercel
fi

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 下一步:"
echo "1. 在 Vercel 控制台配置环境变量"
echo "2. 测试在线演示"
echo "3. 准备比赛提交材料"
echo ""
echo "🎉 祝你好运！"
