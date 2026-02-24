#!/bin/bash

# 发布脚本
# 用法: ./bin/release.sh

set -e

VERSION="1.0.2"

echo "=== 发布 v${VERSION} 版本 ==="

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
  echo "检测到未提交的更改，正在提交..."
  git add .
  git commit -m "chore: 发布 v${VERSION} 版本

- 修复窗口图标显示问题
- 添加单实例锁定功能
- 优化打包配置
- 添加调试日志功能"
else
  echo "没有未提交的更改"
fi

# 创建标签
echo "创建 Git 标签..."
git tag -a "v${VERSION}" -m "Release v${VERSION}

## 更新内容

### Bug 修复
- 修复 Windows 打包应用中窗口图标显示不正确的问题
- 使用 extraResources 配置将图标文件放在 asar 外部
- 添加多路径尝试机制，提高图标加载成功率

### 新增功能
- 添加单实例锁定功能，防止应用被多次打开
- 尝试打开第二个实例时自动激活已存在的窗口
- 添加详细的调试日志输出

### 技术改进
- 优化图标加载逻辑
- 改善错误处理
- 增强调试能力"

echo "标签创建成功: v${VERSION}"

# 显示最近的标签
echo ""
echo "最近的标签:"
git tag -l | tail -5

echo ""
echo "=== 发布准备完成 ==="
echo ""
echo "下一步操作:"
echo "1. 推送代码和标签到远程仓库:"
echo "   git push origin main"
echo "   git push origin v${VERSION}"
echo ""
echo "2. 打包应用:"
echo "   npm run package:win"
echo "   npm run package:mac"
echo "   npm run package:linux"
echo ""
echo "3. 在 GitHub 上创建 Release 并上传打包文件"
