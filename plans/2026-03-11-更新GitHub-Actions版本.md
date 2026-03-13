# 更新 GitHub Actions 版本

## 问题描述
GitHub Actions 提示 Node.js 20 actions 已弃用，需要更新到支持 Node.js 24 的版本。

## 当前使用的 Actions
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/upload-artifact@v4`
- `actions/download-artifact@v4`

## 解决方案
更新到最新版本的 actions，这些版本支持 Node.js 24：
- `actions/checkout@v5`
- `actions/setup-node@v5`
- `actions/upload-artifact@v5`
- `actions/download-artifact@v5`

## 实施步骤
1. 更新 `.github/workflows/build.yml` 中的所有 action 版本
2. 保持现有的 Node.js 24 配置
3. 保持 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` 环境变量

## 预期结果
- 消除 Node.js 20 弃用警告
- 确保 CI/CD 流程在未来继续正常工作
- 提高构建的稳定性和性能