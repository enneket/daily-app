# v1.2.4 修复详情页链接 base 前缀

## 问题描述

用户反馈详情页链接不正确，缺少 VitePress 的 base 路径前缀：

- ❌ 错误链接：`https://enneket.github.io/docs/2026/02/12.html`
- ✅ 正确链接：`https://enneket.github.io/daily/docs/2026/02/12.html`

缺少了 `/daily` 前缀（仓库名）。

## 问题原因

在 `scripts/generate-index.js` 生成日报索引时，`path` 字段直接写为 `/docs/${year}/${month}/${day}`，没有包含 VitePress 配置中的 `base` 路径。

### VitePress base 配置

在 `site/.vitepress/config.ts` 中：
```typescript
base: '/daily/',  // GitHub Pages 的子路径
```

这意味着所有页面的 URL 都应该以 `/daily/` 开头。

### 错误的路径生成

```javascript
// 生成的索引
{
  date: '2026-02-12',
  path: '/docs/2026/02/12'  // ❌ 缺少 /daily 前缀
}
```

### 导致的问题

1. 首页的"最近日报"链接错误
2. 日历页面的日期链接错误
3. 归档页面的日报链接错误
4. 点击链接跳转到 404 页面

## 解决方案

在生成路径时添加 base 前缀。

### 修改前

```javascript
reports.push({
  date,
  year,
  month,
  day,
  title,
  summary,
  timeEntries,
  wordCount,
  path: `/docs/${year}/${month}/${day}`  // ❌ 缺少 base
});
```

### 修改后

```javascript
reports.push({
  date,
  year,
  month,
  day,
  title,
  summary,
  timeEntries,
  wordCount,
  path: `/daily/docs/${year}/${month}/${day}`  // ✅ 包含 base
});
```

## 技术实现

### 修改文件

**文件**：`scripts/generate-index.js`

**行号**：第 103 行

**修改**：
```diff
- path: `/docs/${year}/${month}/${day}`
+ path: `/daily/docs/${year}/${month}/${day}`
```

### 版本更新

- 版本号：v1.2.4
- 更新 `FILE_VERSIONS` 中 `scripts/generate-index.js` 的版本为 `1.2.4`

## 影响范围

### 受影响的页面

1. **首页** (`site/index.md`)
   - "最近日报"部分的链接

2. **日历页** (`site/calendar.md`)
   - 日期链接

3. **归档页** (`site/archive.md`)
   - 日报列表链接

### 受影响的文件

- `site/.vitepress/reports-index.json` - 索引文件会被重新生成

### 不受影响的内容

- 日报文件本身（`site/docs/YYYY/MM/DD.md`）
- VitePress 配置
- 其他页面

## 使用方法

### 对于新用户

直接使用 v1.2.4 或更高版本，链接会自动正确。

### 对于已有用户

1. **更新桌面应用**到 v1.2.4
2. **打开应用**，点击"保存并初始化"
3. **等待更新完成**，应用会自动更新 `scripts/generate-index.js`
4. **等待 GitHub Actions 构建**（2-5 分钟）
5. **刷新网站**，测试链接

### 验证步骤

1. 访问首页：`https://你的用户名.github.io/daily/`
2. 点击"最近日报"中的日期链接
3. 应该能正确跳转到详情页，而不是 404

## 路径说明

### URL 结构

```
https://你的用户名.github.io/daily/docs/2026/02/12
       ↑                        ↑     ↑
       域名                    base   路径
```

- **域名**：`你的用户名.github.io`
- **base**：`/daily/`（仓库名）
- **路径**：`docs/2026/02/12`（日报路径）

### 为什么需要 base？

GitHub Pages 的项目站点 URL 格式为：
```
https://用户名.github.io/仓库名/
```

如果仓库名是 `daily`，那么所有页面都在 `/daily/` 路径下，所以：
- 首页：`/daily/`
- 日历：`/daily/calendar`
- 详情：`/daily/docs/2026/02/12`

## 注意事项

### 如果仓库名不是 daily

如果您的仓库名不是 `daily`（例如是 `my-reports`），需要修改两个地方：

1. **VitePress 配置**（`site/.vitepress/config.ts`）：
```typescript
base: '/my-reports/',  // 改为你的仓库名
```

2. **索引生成脚本**（`scripts/generate-index.js`）：
```javascript
path: `/my-reports/docs/${year}/${month}/${day}`  // 改为你的仓库名
```

### 硬编码的权衡

当前实现将 base 路径硬编码为 `/daily/`，这是一个权衡：

**优点**：
- 简单直接，不需要额外配置
- 适用于大多数用户（仓库名就是 `daily`）
- 不引入额外的依赖和复杂度

**缺点**：
- 如果仓库名不同，需要手动修改
- 不够灵活

**未来改进**：
可以考虑从 VitePress 配置文件读取 base，但需要处理 TypeScript 导入等问题。

## 修改的文件

- `scripts/generate-index.js` - 修改路径生成逻辑
- `src/main/github-service.ts` - 更新版本号
- `plans/2026-02-12-修复详情页链接缺少base前缀.md` - 修复方案
- `docs/v1.2.4修复详情页链接base前缀.md` - 本文档

## 测试验证

- [ ] 生成的 `reports-index.json` 中 path 包含 `/daily` 前缀
- [ ] 首页"最近日报"链接正确
- [ ] 日历页面日期链接正确
- [ ] 归档页面日报链接正确
- [ ] 点击链接能正确跳转到详情页
- [ ] 详情页内容正确显示

## 相关问题

### 为什么之前没发现？

之前的测试主要关注：
1. 文件是否在正确位置（`site/docs/`）
2. VitePress 是否能构建
3. 直接访问 URL 是否正常

但没有测试从其他页面点击链接跳转的情况。

### 为什么直接访问 URL 可以？

直接在浏览器地址栏输入完整 URL（包含 `/daily`）是可以访问的，问题是页面内的链接生成错误，导致点击链接时跳转到错误的 URL。

## 版本历史

### v1.2.4 (2026-02-12)
- 修复详情页链接缺少 base 前缀问题
- 更新 `scripts/generate-index.js` 路径生成逻辑

### v1.2.3 (2026-02-12)
- 添加日报文件自动迁移功能

### v1.2.2 (2026-02-12)
- 修改日报存储路径到 `site/docs/`

## 相关文档

- [修复详情页链接缺少 base 前缀方案](../plans/2026-02-12-修复详情页链接缺少base前缀.md)
- [v1.2.3 自动迁移日报文件](./v1.2.3自动迁移日报文件.md)
- [v1.2.2 修复日报详情页 404 问题](./v1.2.2修复日报详情页404问题.md)
- [解决详情页 404 用户指南](./解决详情页404-用户指南.md)
