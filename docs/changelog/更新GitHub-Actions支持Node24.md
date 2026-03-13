# 更新 GitHub Actions 支持 Node.js 24

## 更新内容
更新 GitHub Actions 工作流以支持 Node.js 24，解决 Node.js 20 弃用警告。

## 具体修改

### 1. 更新 Node.js 版本
- 将 `node-version` 从 '20' 更新为 '24'
- 添加 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` 环境变量

### 2. 解决的问题
- 消除 GitHub Actions 中的 Node.js 20 弃用警告
- 确保构建流程在 2026 年 6 月后仍能正常工作
- 提前适配最新的 Node.js 版本

### 3. 影响范围
- 所有平台的构建流程（macOS、Windows、Linux）
- 自动化打包和发布流程
- 依赖安装和项目构建

## 兼容性
- Node.js 24 向后兼容 Node.js 20 的功能
- 项目代码无需修改
- 构建脚本保持不变

## 验证方法
1. 推送代码到 GitHub 触发 Actions
2. 检查构建日志中是否还有弃用警告
3. 确认所有平台的打包流程正常工作

## 文件修改
- `.github/workflows/build.yml`：更新 Node.js 版本和环境变量