# v1.2.7 为日报网站添加 favicon

## 更新内容

为生成的日报网站添加了 favicon 图标，提升网站的专业性和品牌识别度。同时修复了二进制文件上传损坏的问题。

## 修改文件

### 1. site/.vitepress/config.ts

在 VitePress 配置中添加了 `head` 配置，引入 favicon：

```typescript
head: [
  ['link', { rel: 'icon', type: 'image/png', href: '/{{REPO_NAME}}/favicon.png' }]
],
```

这样配置后，浏览器会使用 PNG 格式的 favicon，路径包含 `{{REPO_NAME}}` 占位符，会在上传时自动替换。

### 2. site/public/favicon.png

添加了 PNG 格式的 favicon 图标，使用应用图标（build/icon.png）作为网站 favicon。

### 3. src/main/github-service.ts

更新了版本号和文件列表，并修复了二进制文件上传问题：

1. 版本号从 v1.2.6 升级到 v1.2.7
2. 在 `FILE_VERSIONS` 中添加了新文件：
   ```typescript
   'site/public/favicon.png': '1.2.7',
   ```
3. 在 `filesToCopy` 列表中添加了静态资源：
   ```typescript
   // 静态资源
   { local: 'site/public/favicon.png', remote: 'site/public/favicon.png' },
   ```
4. 修复了 `readLocalFile()` 方法，对图片等二进制文件使用二进制模式读取：
   ```typescript
   private readLocalFile(relativePath: string): string | Buffer {
     const filePath = pathModule.join(__dirname, '../../', relativePath);
     // 判断是否为二进制文件（图片等）
     const isBinary = /\.(png|jpg|jpeg|gif|ico|icns|svg|webp)$/i.test(relativePath);
     if (isBinary) {
       return fsModule.readFileSync(filePath);
     }
     return fsModule.readFileSync(filePath, 'utf-8');
   }
   ```
5. 修复了文件上传逻辑，正确处理 Buffer 类型：
   ```typescript
   content: Buffer.isBuffer(file.content) 
     ? file.content.toString('base64')
     : Buffer.from(file.content).toString('base64')
   ```

## 问题修复

之前的实现存在一个严重问题：所有文件都使用 `utf-8` 编码读取，这会导致图片等二进制文件损坏。现在：
- 根据文件扩展名判断是否为二进制文件
- 二进制文件直接读取为 Buffer
- 上传时正确处理 Buffer 和字符串两种类型

## 效果

更新后，日报网站将显示：
- 浏览器标签页显示自定义 favicon
- 书签中显示自定义图标

## 技术说明

VitePress 的 `public` 目录：
- 该目录下的文件会被复制到构建输出的根目录
- 可以通过 `/base/filename` 的方式访问
- 适合存放 favicon、logo、robots.txt 等静态资源

## 自定义图标

如果用户想使用自己的图标：
1. 替换 `site/public/favicon.png`（建议 32x32 或 64x64 像素）
2. 重新保存配置，应用会自动更新到日报仓库

## 相关文件

- `site/.vitepress/config.ts` - VitePress 配置
- `site/public/favicon.png` - PNG 格式 favicon
- `src/main/github-service.ts` - 版本管理和文件上传
