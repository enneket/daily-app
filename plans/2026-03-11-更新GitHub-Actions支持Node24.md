# 更新 GitHub Actions 支持 Node.js 24

## 问题描述
GitHub Actions 显示 Node.js 20 弃用警告，需要更新到 Node.js 24 以避免未来的兼容性问题。

## 警告信息
```
Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: 
- actions/checkout@v4
- actions/setup-node@v4  
- actions/upload-artifact@v4

Actions will be forced to run with Node.js 24 by default starting June 2nd, 2026.
```

## 解决方案
1. 更新 Node.js 版本从 20 到 24
2. 检查并更新相关 Actions 到最新版本
3. 添加环境变量强制使用 Node.js 24

## 具体修改
1. 将 `node-version: '20'` 更新为 `node-version: '24'`
2. 检查 actions 版本是否需要更新
3. 可选：添加 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` 环境变量

## 预期效果
- 消除 Node.js 20 弃用警告
- 确保 GitHub Actions 在 2026 年 6 月后仍能正常工作
- 提前适配最新的 Node.js 版本