# 为日报仓库添加 CI

## 问题

https://github.com/enneket/daily 目前还没有 GitHub CI 配置，无法自动部署日报展示网站。

## 解决方案

按照以下步骤为日报仓库添加 CI：

### 1. 在日报仓库创建 workflow 文件

在 `https://github.com/enneket/daily` 仓库中创建文件：

```
.github/workflows/deploy-site.yml
```

内容使用本仓库的 `docs/添加workflow到日报仓库.yml` 文件。

### 2. 快速操作方法

#### 方法 A：通过 GitHub 网页创建

1. 访问 https://github.com/enneket/daily
2. 点击 "Add file" → "Create new file"
3. 文件名输入：`.github/workflows/deploy-site.yml`
4. 复制 `docs/添加workflow到日报仓库.yml` 的内容
5. 提交

#### 方法 B：通过命令行

```bash
# 克隆日报仓库
git clone https://github.com/enneket/daily.git
cd daily

# 创建 workflow 目录
mkdir -p .github/workflows

# 复制 workflow 文件（从桌面应用仓库）
cp /path/to/daily-app/docs/添加workflow到日报仓库.yml .github/workflows/deploy-site.yml

# 提交
git add .github/workflows/deploy-site.yml
git commit -m "添加 GitHub Actions 自动部署配置"
git push
```

### 3. 配置 GitHub Pages

1. 访问 https://github.com/enneket/daily/settings/pages
2. 在 "Source" 下拉菜单中选择 "GitHub Actions"
3. 保存

### 4. 验证配置

1. 访问 https://github.com/enneket/daily/actions
2. 查看是否有 "部署日报展示网站" workflow
3. 可以点击 "Run workflow" 手动触发一次

### 5. 等待部署完成

- 首次部署需要 2-3 分钟
- 部署完成后访问：https://enneket.github.io/daily/

## CI 工作流程

添加 CI 后，每次提交日报时会自动：

1. 检测到 `.md` 文件变化
2. 运行 `node scripts/generate-index.js` 生成索引
3. 运行 `npm run build:site` 构建网站
4. 自动部署到 GitHub Pages

## 触发条件

CI 会在以下情况自动运行：

- 推送任何 `.md` 文件到 `main` 分支
- 修改 workflow 配置文件
- 修改 `scripts/` 目录下的文件
- 手动触发（在 Actions 页面点击 "Run workflow"）

## 前置要求

确保日报仓库已经包含：

- ✅ `site/` 目录（网站源码）
- ✅ `scripts/generate-index.js`（索引生成脚本）
- ✅ `package.json`（包含 `build:site` 脚本）

如果缺少这些文件，参考 `docs/日报仓库快速设置.md` 完成初始化。

## 故障排除

### Actions 失败：找不到 scripts/generate-index.js

确保日报仓库包含 `scripts/generate-index.js` 文件。

### Actions 失败：npm run build:site 命令不存在

确保 `package.json` 包含：

```json
{
  "scripts": {
    "build:site": "vitepress build site"
  }
}
```

### 网站显示 404

检查 `site/.vitepress/config.ts` 中的 `base` 配置：

```typescript
base: '/daily/',  // 必须与仓库名一致
```

### 权限错误

确保在仓库 Settings → Actions → General 中：
- Workflow permissions 设置为 "Read and write permissions"

## 总结

完成以上步骤后，https://github.com/enneket/daily 就有了完整的 CI/CD 流程，每次提交日报都会自动更新展示网站。
