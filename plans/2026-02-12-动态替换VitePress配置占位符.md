# 动态替换 VitePress 配置占位符

## 问题描述

当前 VitePress 配置文件（`site/.vitepress/config.ts`）中的以下内容是写死的：
- `base: '/daily/'` - 仓库名
- `socialLinks` 中的 GitHub 链接 - 用户名和仓库名
- `sitemap.hostname` - 用户名和仓库名

这导致不同用户使用时需要手动修改配置文件，不够灵活。

## 需求

希望这些配置能够根据用户在桌面应用中填写的仓库信息（仓库所有者、仓库名称）动态生成。

## 解决方案

### 方案：使用占位符 + 动态替换

1. **在模板文件中使用占位符**：
   ```typescript
   base: '/{{REPO_NAME}}/',
   socialLinks: [
     { icon: 'github', link: 'https://github.com/{{REPO_OWNER}}/{{REPO_NAME}}' }
   ],
   sitemap: {
     hostname: 'https://{{REPO_OWNER}}.github.io/{{REPO_NAME}}'
   }
   ```

2. **在上传文件时替换占位符**：
   在 `github-service.ts` 的 `updateRepoFiles()` 方法中，读取文件内容后，替换占位符为实际的配置值。

### 实现细节

#### 1. 修改模板文件

**文件**：`site/.vitepress/config.ts`

使用占位符：
- `{{REPO_OWNER}}` - 仓库所有者
- `{{REPO_NAME}}` - 仓库名称

#### 2. 添加替换方法

**文件**：`src/main/github-service.ts`

添加 `replacePlaceholders()` 方法：
```typescript
private replacePlaceholders(content: string): string {
  return content
    .replace(/\{\{REPO_OWNER\}\}/g, this.config.repoOwner)
    .replace(/\{\{REPO_NAME\}\}/g, this.config.repoName);
}
```

#### 3. 在文件上传时应用替换

修改文件复制逻辑：
```typescript
for (const file of filesToCopy) {
  if (filesToUpdate.includes(file.remote)) {
    try {
      let content = this.readLocalFile(file.local);
      
      // 对特定文件进行占位符替换
      if (file.remote === 'site/.vitepress/config.ts') {
        content = this.replacePlaceholders(content);
      }
      
      files.push({ path: file.remote, content });
    } catch (error) {
      console.warn(`跳过文件 ${file.local}:`, error);
    }
  }
}
```

## 需要替换的文件

目前只需要替换 `site/.vitepress/config.ts`，但设计上支持扩展到其他文件。

## 占位符列表

- `{{REPO_OWNER}}` - 仓库所有者（GitHub 用户名）
- `{{REPO_NAME}}` - 仓库名称

## 优点

1. **灵活性**：用户只需在桌面应用中配置一次
2. **自动化**：初始化时自动替换，无需手动修改
3. **可扩展**：可以轻松添加更多占位符
4. **向后兼容**：不影响已有功能

## 影响范围

- `site/.vitepress/config.ts` - 添加占位符
- `src/main/github-service.ts` - 添加替换逻辑

## 版本

- 版本号：v1.2.5
- 更新内容：支持动态替换 VitePress 配置占位符

## 测试验证

- [ ] 占位符正确替换为实际配置
- [ ] GitHub 图标链接正确
- [ ] base 路径正确
- [ ] sitemap 主机名正确
- [ ] 网站可以正常访问
- [ ] 不同用户使用不同配置时都能正常工作
