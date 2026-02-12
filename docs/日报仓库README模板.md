# 我的日报

这是我的个人日报仓库，使用 [日报桌面应用](https://github.com/你的用户名/daily-app) 记录每天的工作和学习。

## 📝 在线查看

访问日报展示网站：**[https://你的用户名.github.io/仓库名/](https://你的用户名.github.io/仓库名/)**

## ✨ 功能特性

- 📅 **日历视图** - 按月查看所有日报
- 📚 **归档浏览** - 按年月分组浏览
- 📊 **统计分析** - 自动统计日报数据
- 🔍 **全文搜索** - 快速查找内容
- 🎨 **精美界面** - 基于 VitePress 构建
- 🚀 **自动部署** - GitHub Actions 自动构建

## 🗂️ 目录结构

```
.
├── site/
│   ├── docs/           # 日报存储目录
│   │   └── 2026/       # 按年份组织
│   │       ├── 01/     # 按月份组织
│   │       │   ├── 01.md
│   │       │   ├── 02.md
│   │       │   └── ...
│   │       └── 02/
│   │           └── ...
│   ├── .vitepress/     # VitePress 配置
│   ├── index.md        # 首页
│   ├── calendar.md     # 日历视图
│   ├── archive.md      # 归档页面
│   └── stats.md        # 统计页面
├── scripts/
│   └── generate-index.js   # 索引生成脚本
├── .github/
│   └── workflows/
│       └── deploy-site.yml # 自动部署配置
├── package.json
└── README.md
```

## 📱 如何使用

### 方式 1：使用桌面应用（推荐）

1. 下载并安装 [日报桌面应用](https://github.com/你的用户名/daily-app/releases)
2. 配置 GitHub Token 和仓库信息
3. 点击"保存并初始化"（首次使用会自动创建所有必需文件）
4. 开始写日报，点击提交即可

### 方式 2：手动提交

直接在 GitHub 上编辑对应日期的文件，例如 `site/docs/2026/02/12.md`。

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 生成日报索引
node scripts/generate-index.js

# 启动开发服务器
npm run dev:site

# 构建网站
npm run build:site

# 预览构建结果
npm run preview:site
```

## 📊 自动统计

网站会自动统计以下数据：

- 📝 总日报数
- 🔥 连续天数
- 📅 今年/本月日报数
- 📖 总字数和平均字数
- 📈 按年/月统计

## 🚀 自动部署

每次提交日报后，GitHub Actions 会自动：

1. 生成日报索引
2. 构建 VitePress 网站
3. 部署到 GitHub Pages

无需手动操作！

## 🎯 快速链接

- [首页](https://你的用户名.github.io/仓库名/) - 查看最新日报
- [日历](https://你的用户名.github.io/仓库名/calendar) - 日历视图
- [归档](https://你的用户名.github.io/仓库名/archive) - 浏览所有日报
- [统计](https://你的用户名.github.io/仓库名/stats) - 查看统计数据

## 📄 日报格式

```markdown
# 2026-02-12 日报

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

## 🔐 隐私说明

- 本仓库为公开仓库，所有日报内容都是公开的
- 如需私密日报，请将仓库设置为 Private
- GitHub Token 仅存储在本地，不会上传到任何服务器

## 📝 许可

MIT License

---

**技术栈**: Electron + React + VitePress + GitHub Actions

**构建工具**: [日报桌面应用](https://github.com/你的用户名/daily-app)

**当前版本**: v1.2.2
