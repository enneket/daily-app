#!/bin/bash

# 日报桌面应用 v1.0.0 发布脚本
# 使用方法：bash 发布v1.0.0命令.sh

echo "=========================================="
echo "  日报桌面应用 v1.0.0 发布脚本"
echo "=========================================="
echo ""

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "⚠️  检测到未提交的更改"
    echo ""
    git status -s
    echo ""
    read -p "是否继续？(y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 发布已取消"
        exit 1
    fi
fi

echo "📝 步骤 1/4: 提交所有更改..."
git add .
git commit -m "Release v1.0.0

## 核心功能
- 跨平台桌面应用（Windows、macOS、Linux）
- GitHub 集成和自动提交
- 日报展示网站（日历、归档、统计）
- 自动初始化和版本管理
- 全文搜索功能

## 修复
- 修复日报详情页 404 问题
- 修复统计页面对象遍历问题
- 自动迁移日报文件
- 修复详情页链接 base 前缀"

if [ $? -eq 0 ]; then
    echo "✅ 提交成功"
else
    echo "❌ 提交失败"
    exit 1
fi

echo ""
echo "🚀 步骤 2/4: 推送到远程仓库..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功"
else
    echo "❌ 推送失败"
    exit 1
fi

echo ""
echo "🏷️  步骤 3/4: 创建 tag v1.0.0..."
git tag -a v1.0.0 -m "Release v1.0.0

## 核心功能
- 跨平台桌面应用（Windows、macOS、Linux）
- GitHub 集成和自动提交
- 日报展示网站（日历、归档、统计）
- 自动初始化和版本管理
- 全文搜索功能

## 修复
- 修复日报详情页 404 问题
- 修复统计页面对象遍历问题
- 自动迁移日报文件
- 修复详情页链接 base 前缀

详见：https://github.com/你的用户名/daily-app/blob/main/docs/v1.0.0正式版发布.md"

if [ $? -eq 0 ]; then
    echo "✅ Tag 创建成功"
else
    echo "❌ Tag 创建失败"
    exit 1
fi

echo ""
echo "📤 步骤 4/4: 推送 tag 到远程仓库..."
git push origin v1.0.0

if [ $? -eq 0 ]; then
    echo "✅ Tag 推送成功"
else
    echo "❌ Tag 推送失败"
    exit 1
fi

echo ""
echo "=========================================="
echo "  🎉 发布流程已启动！"
echo "=========================================="
echo ""
echo "接下来："
echo "1. 访问 GitHub Actions 查看构建进度"
echo "   https://github.com/你的用户名/daily-app/actions"
echo ""
echo "2. 等待构建完成（约 10-20 分钟）"
echo ""
echo "3. 查看 Release 页面"
echo "   https://github.com/你的用户名/daily-app/releases"
echo ""
echo "4. 下载并测试安装包"
echo ""
echo "祝发布顺利！🚀"
