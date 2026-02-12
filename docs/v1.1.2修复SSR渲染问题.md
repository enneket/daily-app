# v1.1.2 修复 SSR 渲染问题

## 问题描述

v1.1.1 添加了清理缓存步骤，但构建仍然失败，报错 `Cannot read properties of undefined (reading 'day')`。

**真正的根本原因**：`calendar.md` 中的模板代码在 SSR（服务器端渲染）时访问了可能为 `null` 的对象属性。

## 错误分析

### 错误位置
```
at file:///home/runner/work/daily/daily/site/.vitepress/.temp/calendar.md.js:55:76
```

### 问题代码
```vue
<span class="day-number">{{ day.day }}</span>
```

### 为什么会出错？

在 `monthDays` 数组中，前面的空白日期被填充为 `null`：

```javascript
// 填充前面的空白
for (let i = 0; i < startWeekday; i++) {
  days.push(null);  // 这里是 null
}
```

虽然我们有 `v-if="day"` 检查：

```vue
<template v-if="day">
  <span class="day-number">{{ day.day }}</span>
</template>
```

但在 VitePress 的 SSR 过程中，Vue 编译器可能会在条件检查之前就尝试访问 `day.day`，导致错误。

## 解决方案

使用可选链操作符 `?.` 和默认值，确保即使在 SSR 时也不会访问 `null` 的属性：

### 修改前
```vue
<span class="day-number">{{ day.day }}</span>
```

### 修改后
```vue
<span class="day-number">{{ day?.day || '' }}</span>
```

### 完整修复
```vue
<template v-if="day">
  <a v-if="day.hasReport" :href="day.report?.path || '#'" class="day-link">
    <span class="day-number">{{ day?.day || '' }}</span>
    <span class="day-indicator">●</span>
  </a>
  <span v-else class="day-number">{{ day?.day || '' }}</span>
</template>
```

## 技术细节

### 什么是 SSR？

SSR（Server-Side Rendering，服务器端渲染）是指在服务器上执行 Vue 组件，生成 HTML 字符串，然后发送给客户端。VitePress 使用 SSR 来生成静态网站。

### 为什么 SSR 会有这个问题？

在客户端渲染时，Vue 的响应式系统会正确处理 `v-if` 条件。但在 SSR 时：

1. Vue 编译器会将模板编译成 JavaScript 代码
2. 编译后的代码可能会在条件检查之前访问属性
3. 如果属性访问发生在 `null` 对象上，就会抛出错误

### 可选链操作符 `?.`

可选链操作符是 ES2020 引入的特性：

```javascript
// 传统写法
const value = obj && obj.prop && obj.prop.value;

// 可选链写法
const value = obj?.prop?.value;
```

如果链中任何一个引用是 `null` 或 `undefined`，整个表达式会短路返回 `undefined`，而不是抛出错误。

## 使用方法

1. **重新打包桌面应用**（v1.1.2）
2. **运行应用，保存配置**（会更新 `calendar.md` 文件）
3. **触发构建**
4. **验证构建成功**

## 修改的文件

- `site/calendar.md` - 修复 SSR 渲染问题
- `src/main/github-service.ts` - 更新版本号到 1.1.2
- `src/renderer/components/Settings.tsx` - 更新显示版本号

## 版本历史

### v1.1.2 (2026-02-12)
- 修复 `calendar.md` 的 SSR 渲染问题
- 使用可选链操作符避免访问 null 属性

### v1.1.1 (2026-02-12)
- 添加构建前清理缓存步骤
- 修复 GitHub Actions 缓存问题

### v1.1.0 (2026-02-12)
- 引入版本管理机制
- 实现自动更新功能

## 为什么之前没发现这个问题？

这个问题只在以下情况下才会出现：

1. **使用 VitePress 的 SSR 构建**：开发模式（`vitepress dev`）不会触发
2. **月份的第一天不是周日**：如果第一天是周日，就不会有前置的 `null` 值
3. **严格的 SSR 编译**：VitePress 1.6.4 可能对 SSR 的检查更严格

## 其他页面是否有类似问题？

我检查了其他页面（`archive.md`、`stats.md`、`index.md`、`latest.md`），它们都使用了安全的访问方式：

```vue
{{ report?.title || '' }}
{{ report?.date || '' }}
```

只有 `calendar.md` 遗漏了这个安全检查。

## 验证方法

构建成功的标志：
1. GitHub Actions 显示绿色勾号 ✅
2. 没有 `Cannot read properties of undefined` 错误
3. 日历页面可以正常显示

## 相关文档

- [v1.1.1 修复构建缓存问题](./v1.1.1修复构建缓存问题.md)
- [版本管理和自动更新机制](./版本管理和自动更新机制.md)
- [v1.1.0 更新说明](./v1.1.0更新说明.md)
