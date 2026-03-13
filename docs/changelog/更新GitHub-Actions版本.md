# 更新 GitHub Actions 版本

## 更新内容
更新 GitHub Actions 工作流中使用的 actions 版本，以解决 Node.js 20 弃用警告。

## 具体修改

### 1. 更新 Actions 版本
- `actions/checkout@v4` → `actions/checkout@v5`
- `actions/setup-node@v4` → `actions/setup-node@v5`
- `actions/upload-artifact@v4` → `actions/upload-artifact@v5`
- `actions/download-artifact@v4` → `actions/download-artifact@v5`
- `softprops/action-gh-release@v1` → `softprops/action-gh-release@v2`

### 2. 优化环境变量配置
- 将 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` 移到全局 `env` 配置
- 简化了各个步骤的配置

### 3. 保持现有功能
- 继续使用 Node.js 24
- 保持所有构建和发布流程不变
- 保持超时设置和依赖安装配置

## 解决的问题
- 消除了 "Node.js 20 actions are deprecated" 警告
- 确保 CI/CD 流程在 2026 年 6 月 2 日后继续正常工作
- 提高了构建的稳定性和未来兼容性

## 影响范围
- 仅影响 GitHub Actions 工作流
- 不影响应用程序本身的功能
- 不影响本地开发和构建过程

## 文件修改
- `.github/workflows/build.yml`：更新所有 actions 到最新版本