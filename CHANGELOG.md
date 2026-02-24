# 变更日志

本项目的所有重要变更都将记录在此文件中。

版本格式遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.2] - 2026-02-24

### 修复

- 修复 Windows 打包应用中窗口图标显示不正确的问题
- 使用 `extraResources` 配置将图标文件放在 asar 外部
- 添加多路径尝试机制，提高图标加载成功率
- 添加详细的调试日志输出功能

### 新增

- 添加单实例锁定功能，防止应用被多次打开
- 尝试打开第二个实例时自动激活已存在的窗口
- 窗口最小化后自动恢复和聚焦

### 技术改进

- 优化图标加载逻辑
- 改善错误处理
- 增强调试能力

### 详细变更

- 修复窗口图标显示问题 ([详情](./docs/changelog/修复窗口图标显示问题.md))
- 添加单实例锁定功能 ([详情](./docs/changelog/添加单实例锁定功能.md))

## [1.0.1] - 2026-02-12

### 修复

- 修复统计页面 ClientOnly 渲染问题
- 修复详情页链接缺少 base 前缀问题
- 修复日报详情页 404 问题
- 修复 README 模板 emoji 显示问题
- 修复统计页面对象遍历问题
- 修复构建错误

### 新增

- 支持动态配置（占位符自动替换）
- 自动迁移日报文件功能
- 为日报网站添加 favicon 图标

### 改进

- 简化页面实现
- 优化统计页面显示
- 简化用户配置流程
- 改善日报仓库文件同步

### 详细变更

- 动态配置支持 ([详情](./docs/changelog/动态配置支持.md))
- 修复统计页面渲染 ([详情](./docs/changelog/修复统计页面渲染.md))
- 修复详情页链接 base 前缀 ([详情](./docs/changelog/修复详情页链接base前缀.md))
- 自动迁移日报文件 ([详情](./docs/changelog/自动迁移日报文件.md))
- 修复日报详情页 404 问题 ([详情](./docs/changelog/修复日报详情页404问题.md))
- 修复 README 模板 emoji 显示 ([详情](./docs/changelog/修复README模板emoji显示.md))
- 修复统计页面对象遍历问题 ([详情](./docs/changelog/修复统计页面对象遍历问题.md))
- 为日报网站添加 favicon ([详情](./docs/changelog/为日报网站添加favicon.md))
- 简化页面实现 ([详情](./docs/changelog/简化页面实现.md))
- 修复 Vue 组件渲染问题 ([详情](./docs/changelog/修复Vue组件渲染问题.md))
- 修复 SSR 渲染问题 ([详情](./docs/changelog/修复SSR渲染问题.md))
- 修复构建缓存问题 ([详情](./docs/changelog/修复构建缓存问题.md))

## [1.0.0] - 2026-02-12

### 首次发布

这是日报助手的首个正式版本。

### 核心功能

- ✅ 跨平台桌面应用（Windows、macOS、Linux）
- ✅ 简洁的日报编写界面
- ✅ GitHub 集成和自动提交
- ✅ 自动生成日报展示网站
- ✅ 日历视图、归档浏览、统计分析
- ✅ 全文搜索功能
- ✅ 自动初始化和版本管理
- ✅ 安全的本地配置存储
- ✅ 快捷键支持（Cmd/Ctrl + Enter）

### 技术栈

- Electron + React + TypeScript
- Tailwind CSS
- VitePress
- Vite + electron-builder
- Octokit (GitHub API)

---

## 版本说明

### 版本号规则

本项目遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/) 规范：

- **主版本号（1.x.x）**：不兼容的 API 修改
- **次版本号（x.1.x）**：向下兼容的功能性新增
- **修订号（x.x.1）**：向下兼容的问题修正

### 开发文档版本

在开发过程中，我们使用增量版本号（如 v1.1.0, v1.2.0 等）记录每个小的更新。这些更新会在正式发布时整合到对应的发布版本中。

所有开发文档都保存在 `docs/changelog/` 目录中，供开发者参考。

### 链接

- [发布页面](https://github.com/enneket/daily-app/releases)
- [问题追踪](https://github.com/enneket/daily-app/issues)
- [文档](./docs/README.md)
