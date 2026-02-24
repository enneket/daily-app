#!/bin/bash

# 发布脚本
# 用法: ./bin/release.sh

set -e

VERSION="1.0.3"

echo "=== 发布 v${VERSION} 版本 ==="

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
  echo "检测到未提交的更改，正在提交..."
  git add .
  git commit -m "chore: 发布 v${VERSION} 版本

- 移除日历视图模块，简化网站结构
- 自动清理用户仓库中的旧日历文件
- 优化配置同步流程
- 增强自动清理机制"
else
  echo "没有未提交的更改"
fi

# 创建标签
echo "创建 Git 标签..."
git tag -a "v${VERSION}" -m "Release v${VERSION}

## 更新内容

### 移除功能
- 移除日历视图模块，简化网站结构
- 自动清理用户仓库中的旧日历文件

### 变更
- 更新配置同步版本到 v1.0.3
- 首页按钮改为"归档浏览"
- 导航栏移除日历链接

### 改进
- 增强自动清理机制，自动删除废弃文件
- 优化配置同步流程"

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
