#!/bin/bash

# 使用方法：
# 1. 克隆你的日报仓库
# 2. 在日报仓库目录中运行此脚本
# 或者：./添加workflow到日报仓库.sh /path/to/your/daily-repo

REPO_DIR="${1:-.}"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "错误：$REPO_DIR 不是一个 Git 仓库"
  exit 1
fi

cd "$REPO_DIR"

# 创建目录
mkdir -p .github/workflows

# 创建 workflow 文件
cat > .github/workflows/deploy-site.yml << 'EOF'
name: 部署日报展示网站

on:
  push:
    branches: [main]
    paths:
      - '**.md'
      - '.github/workflows/deploy-site.yml'
      - 'scripts/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
      
      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: 安装依赖
        run: npm install
      
      - name: 生成日报索引
        run: node scripts/generate-index.js
      
      - name: 构建网站
        run: npm run build:site
      
      - name: 上传构建产物
        uses: actions/upload-pages-artifact@v3
        with:
          path: site/.vitepress/dist
  
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: 部署到 GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF

echo "✅ 已创建 .github/workflows/deploy-site.yml"

# 提交
git add .github/workflows/deploy-site.yml
git commit -m "ci: 添加自动部署配置"

echo "✅ 已提交更改"
echo ""
echo "现在运行以下命令推送到 GitHub："
echo "  cd $REPO_DIR && git push"
