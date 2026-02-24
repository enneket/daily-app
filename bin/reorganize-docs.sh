#!/bin/bash

# 整理文档脚本
# 将开发过程中的版本文档移动到 changelog 目录

set -e

echo "=== 整理版本文档 ==="

# 确保 changelog 目录存在
mkdir -p docs/changelog

# 移动 v1.1.x 文档
echo "移动 v1.1.x 文档..."
mv docs/v1.1.2修复SSR渲染问题.md docs/changelog/修复SSR渲染问题.md 2>/dev/null || true
mv docs/v1.1.3修复Vue组件渲染问题.md docs/changelog/修复Vue组件渲染问题.md 2>/dev/null || true

# 移动 v1.2.x 文档
echo "移动 v1.2.x 文档..."
mv docs/v1.2.0简化页面实现.md docs/changelog/简化页面实现.md 2>/dev/null || true
mv docs/v1.2.1修复统计页面对象遍历问题.md docs/changelog/修复统计页面对象遍历问题.md 2>/dev/null || true
mv docs/v1.2.2修复日报详情页404问题.md docs/changelog/修复日报详情页404问题.md 2>/dev/null || true
mv docs/v1.2.2.1修复README模板emoji显示.md docs/changelog/修复README模板emoji显示.md 2>/dev/null || true
mv docs/v1.2.3自动迁移日报文件.md docs/changelog/自动迁移日报文件.md 2>/dev/null || true
mv docs/v1.2.4修复详情页链接base前缀.md docs/changelog/修复详情页链接base前缀.md 2>/dev/null || true
mv docs/v1.2.4.1修复构建错误.md docs/changelog/修复构建错误.md 2>/dev/null || true
mv docs/v1.2.5动态配置支持.md docs/changelog/动态配置支持.md 2>/dev/null || true
mv docs/v1.2.6修复统计页面渲染.md docs/changelog/修复统计页面渲染.md 2>/dev/null || true
mv docs/v1.2.7为日报网站添加favicon.md docs/changelog/为日报网站添加favicon.md 2>/dev/null || true
mv docs/v1.2.8修复窗口图标显示问题.md docs/changelog/修复窗口图标显示问题.md 2>/dev/null || true
mv docs/v1.2.9添加单实例锁定功能.md docs/changelog/添加单实例锁定功能.md 2>/dev/null || true

echo "=== 文档整理完成 ==="
echo ""
echo "changelog 目录内容："
ls -1 docs/changelog/
