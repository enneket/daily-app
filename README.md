# 日报助手

一个跨平台（Mac & Windows）的桌面应用，用于快速编写和提交日报到 GitHub 仓库。

## 🚀 快速开始

### ⚠️ 首次使用必读

在使用前，请先配置你的信息：

1. 打开 `package.json`，修改 `author` 字段：
   ```json
   "author": {
     "name": "你的名字",
     "email": "your.email@example.com"
   }
   ```

2. 修改 Linux 打包配置（在 `package.json` 的 `build.linux` 中）：
   ```json
   "maintainer": "你的名字 <your.email@example.com>"
   ```

👉 **详细配置**: [docs/配置说明.md](./docs/配置说明.md)

### 安装和运行

```bash
npm install
npm run dev
```

访问 http://localhost:5173

👉 **详细说明**: [docs/从这里开始.md](./docs/从这里开始.md)

## 📊 日报展示网站

本项目包含日报展示网站的源码（`site/` 目录），但网站应该部署在你的日报仓库中。

### 设置日报仓库

1. 创建一个新的 GitHub 仓库用于存储日报（例如：`daily-reports`）
2. 将 `site/` 和 `scripts/` 目录复制到日报仓库
3. 配置 GitHub Actions 自动部署

👉 **详细步骤**: [docs/日报仓库设置指南.md](./docs/日报仓库设置指南.md)

### 本地预览网站（在日报仓库）

```bash
# 在日报仓库目录
node scripts/generate-index.js
npm run dev:site
```

👉 **网站文档**: [docs/网站快速开始.md](./docs/网站快速开始.md) | [docs/日报网站使用指南.md](./docs/日报网站使用指南.md)

## 📚 文档导航

- 🎯 [docs/从这里开始.md](./docs/从这里开始.md) - 3 步快速开始
- 📖 [docs/快速开始.md](./docs/快速开始.md) - 详细启动指南
- 💻 [docs/使用说明.md](./docs/使用说明.md) - 开发和使用说明
- 📦 [docs/打包指南.md](./docs/打包指南.md) - 打包和发布指南
- 🖥️ [docs/当前环境打包说明.md](./docs/当前环境打包说明.md) - Linux 环境打包方案
- 🖥️ [docs/平台说明.md](./docs/平台说明.md) - 平台特定说明
- 📊 [docs/项目状态.md](./docs/项目状态.md) - 项目状态

## 功能特性

- ✅ 跨平台支持（Mac & Windows）
- ✅ 简洁的界面设计
- ✅ 支持同一天多次提交
- ✅ 自动按日期组织（YYYY/MM/DD.md）
- ✅ 本地存储 GitHub 配置
- ✅ 支持 Markdown 格式
- ✅ 快捷键支持（Cmd/Ctrl + Enter 提交）

## 技术栈

- Electron - 跨平台桌面应用框架
- React 18 - UI 框架
- TypeScript - 类型安全
- Tailwind CSS - 样式框架
- Octokit - GitHub API 客户端
- electron-store - 本地配置存储
- Vite - 构建工具

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

**网页模式（快速开发）：**
```bash
npm run dev
```
在浏览器打开 http://localhost:5173

**桌面模式（完整功能）：**
```bash
npm run dev:electron
```
自动启动 Electron 桌面应用

### 打包应用

```bash
# 打包 Mac 版本
npm run package:mac

# 打包 Windows 版本
npm run package:win

# 打包所有平台
npm run package:all
```

打包后的应用会在 `release` 目录中。

## 使用说明

### 1. 首次配置

首次启动应用时，需要配置 GitHub 信息：

- **GitHub Token**: 需要有 `repo` 权限的 Personal Access Token
- **仓库所有者**: GitHub 用户名
- **仓库名称**: 存储日报的仓库名
- **分支名称**: 默认为 `main`

### 2. 获取 GitHub Token

1. 访问 [GitHub Settings → Developer settings](https://github.com/settings/tokens)
2. 选择 "Personal access tokens" → "Tokens (classic)"
3. 点击 "Generate new token (classic)"
4. 勾选 `repo` 权限
5. 生成并复制 token

### 3. 编写日报

在主界面的文本框中输入今天的工作内容，支持 Markdown 格式。

### 4. 提交日报

点击右下角的"提交"按钮，或使用快捷键 `Cmd/Ctrl + Enter`。

日报会自动提交到 GitHub 仓库，路径格式为：`YYYY/MM/DD.md`

### 5. 多次提交

同一天可以多次提交，新内容会自动追加到当天的文件中，每次提交会带上时间戳。

## GitHub 仓库结构

```
your-repo/
├── 2026/
│   ├── 01/
│   │   ├── 01.md
│   │   ├── 02.md
│   │   └── ...
│   ├── 02/
│   │   ├── 01.md
│   │   ├── 11.md
│   │   └── ...
│   └── ...
└── README.md
```

## 日报格式示例

```markdown
# 2026-02-11 日报

## 10:30
- 完成了功能 A 的开发
- 修复了 Bug B

## 14:20
- 参加了项目会议
- 更新了文档

## 17:00
- 代码审查
- 部署测试环境
```

## 项目结构

```
daily-report-app/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   └── github-service.ts
│   └── renderer/          # React 渲染进程
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── types.ts
│       └── components/
│           ├── MainEditor.tsx
│           └── Settings.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 常见问题

### Q: Token 存储安全吗？

A: Token 使用 electron-store 加密存储在本地，不会上传到任何服务器。

### Q: 可以在多台设备上使用吗？

A: 可以，只需在每台设备上配置相同的 GitHub 仓库信息即可。

### Q: 支持离线使用吗？

A: 不支持，需要网络连接才能提交到 GitHub。

### Q: 可以修改已提交的日报吗？

A: 可以直接在 GitHub 仓库中编辑对应日期的文件。

## 许可证

MIT
