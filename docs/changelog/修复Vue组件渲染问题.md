# v1.1.3 修复 Vue 组件渲染问题

## 问题描述

网站部署成功后，访问日历、归档、统计等页面时，显示的是原始的 Vue 模板代码，而不是渲染后的内容：

```html
<div class="days">
  <div
    v-for="(day, index) in monthDays"
    :key="index"
    :class="['day', { 'has-report': day?.hasReport, 'empty': !day }]"
  >
```

这说明 Vue 组件没有被正确编译或客户端 JavaScript 没有执行。

## 可能的原因

1. **VitePress 配置缺失**：没有明确启用 Vue 支持
2. **客户端 hydration 失败**：SSR 生成的 HTML 与客户端 JavaScript 不匹配
3. **JavaScript 加载失败**：客户端脚本没有正确加载

## 解决方案

### 方案 1：添加 Vue 配置（已实施）

在 `site/.vitepress/config.ts` 中添加 `vue` 配置：

```typescript
export default defineConfig({
  // ... 其他配置
  
  // 启用 Vue 支持
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => false
      }
    }
  },
  
  // ... 其他配置
});
```

### 方案 2：检查浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签页是否有错误信息：

- JavaScript 加载错误
- Vue hydration 错误
- 网络请求失败

### 方案 3：清除浏览器缓存

有时浏览器缓存会导致旧版本的 JavaScript 被使用：

1. 打开浏览器开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

### 方案 4：检查 base 路径

确保 VitePress 配置中的 `base` 路径正确：

```typescript
base: '/daily/',  // 必须与仓库名匹配
```

如果仓库名是 `daily`，base 必须是 `/daily/`（注意前后的斜杠）。

## 使用方法

1. **重新打包桌面应用**（v1.1.3）
2. **运行应用，保存配置**（会更新 `config.ts` 文件）
3. **清除浏览器缓存**
4. **重新访问网站**

## 调试步骤

### 步骤 1：检查网页源代码

1. 访问问题页面（如日历页面）
2. 右键 → "查看网页源代码"
3. 搜索 `<script` 标签
4. 确认是否有 Vue 相关的 JavaScript 文件

### 步骤 2：检查网络请求

1. 打开开发者工具 → Network 标签
2. 刷新页面
3. 查看是否有 `.js` 文件加载失败（红色）
4. 特别注意 `app.js`、`framework.js` 等文件

### 步骤 3：检查控制台错误

1. 打开开发者工具 → Console 标签
2. 查看是否有错误信息
3. 常见错误：
   - `Failed to load module`
   - `Hydration mismatch`
   - `Cannot find module`

## 常见问题

### Q: 为什么首页正常，其他页面不正常？

A: 可能是因为首页使用的 Vue 组件较简单，而其他页面使用了更复杂的响应式数据和计算属性。

### Q: 本地开发时正常，部署后不正常？

A: 可能是 `base` 路径配置问题。本地开发时 base 是 `/`，部署到 GitHub Pages 时需要是 `/仓库名/`。

### Q: 清除缓存后还是不行？

A: 尝试使用无痕模式（隐私模式）访问，排除浏览器扩展的影响。

## 技术细节

### VitePress 的渲染流程

1. **构建时（SSR）**：
   - VitePress 在服务器端执行 Vue 组件
   - 生成静态 HTML 文件
   - 包含初始状态的数据

2. **运行时（客户端）**：
   - 浏览器加载 HTML
   - 加载 Vue 运行时和应用代码
   - 执行 hydration（激活）
   - Vue 接管 DOM，使其变为响应式

### Hydration 是什么？

Hydration 是指 Vue 在客户端"激活"服务器端渲染的 HTML 的过程：

1. 服务器生成静态 HTML
2. 客户端加载 Vue 和应用代码
3. Vue 将静态 HTML 转换为响应式的 Vue 组件
4. 绑定事件监听器和响应式数据

如果 hydration 失败，页面会显示静态 HTML（即原始模板代码）。

## 修改的文件

- `site/.vitepress/config.ts` - 添加 Vue 配置
- `src/main/github-service.ts` - 更新版本号到 1.1.3
- `src/renderer/components/Settings.tsx` - 更新显示版本号

## 版本历史

### v1.1.3 (2026-02-12)
- 添加 Vue 配置到 VitePress
- 尝试修复 Vue 组件渲染问题

### v1.1.2 (2026-02-12)
- 修复 calendar.md 的 SSR 渲染问题

### v1.1.1 (2026-02-12)
- 添加构建前清理缓存步骤

## 如果问题仍然存在

如果更新配置后问题仍然存在，请提供以下信息以便进一步诊断：

1. 浏览器控制台的完整错误信息
2. Network 标签中失败的请求（如果有）
3. 网页源代码中的 `<script>` 标签内容
4. 使用的浏览器和版本

## 相关文档

- [v1.1.2 修复 SSR 渲染问题](./v1.1.2修复SSR渲染问题.md)
- [启用 GitHub Pages](./启用GitHub-Pages.md)
- [VitePress 官方文档](https://vitepress.dev/)
