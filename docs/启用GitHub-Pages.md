# 启用 GitHub Pages

## 问题描述

构建成功后，部署到 GitHub Pages 时失败，错误信息：

```
Error: Failed to create deployment (status: 404)
Ensure GitHub Pages has been enabled
```

这说明 GitHub Pages 功能没有在仓库中启用。

## 解决方法

### 步骤 1：访问仓库设置

1. 打开你的日报仓库：https://github.com/enneket/daily
2. 点击顶部的 "Settings"（设置）标签
3. 在左侧菜单中找到 "Pages"

或者直接访问：https://github.com/enneket/daily/settings/pages

### 步骤 2：配置 GitHub Pages

在 Pages 设置页面：

1. **Source（来源）**：
   - 找到 "Build and deployment" 部分
   - 在 "Source" 下拉菜单中选择 **"GitHub Actions"**
   - 不要选择 "Deploy from a branch"

2. **保存**：
   - 选择后会自动保存
   - 页面会显示 "Your site is ready to be published at https://enneket.github.io/daily/"

### 步骤 3：重新触发构建

配置完成后，有两种方式触发构建：

**方法 1：提交新日报**
- 使用桌面应用提交一篇新日报
- 会自动触发构建和部署

**方法 2：手动触发 Workflow**
1. 访问 https://github.com/enneket/daily/actions
2. 点击左侧的 "部署日报展示网站" workflow
3. 点击右上角的 "Run workflow" 按钮
4. 选择 "main" 分支
5. 点击绿色的 "Run workflow" 按钮

### 步骤 4：验证部署成功

1. 等待 workflow 执行完成（约 1-2 分钟）
2. 访问你的网站：https://enneket.github.io/daily/
3. 确认网站可以正常访问

## 为什么需要这个设置？

GitHub Pages 有两种部署方式：

1. **Deploy from a branch**（从分支部署）
   - 直接从 `gh-pages` 或 `main` 分支的某个目录部署
   - 适合简单的静态网站

2. **GitHub Actions**（使用 Actions 部署）
   - 通过 GitHub Actions workflow 构建和部署
   - 适合需要构建步骤的网站（如 VitePress）
   - 我们的日报网站使用这种方式

## 常见问题

### Q: 为什么之前没有启用？

A: GitHub Pages 默认是关闭的，需要手动启用。桌面应用只能创建文件和 workflow，无法通过 API 启用 Pages 功能。

### Q: 启用后需要重新配置吗？

A: 不需要。启用一次后，以后每次推送都会自动构建和部署。

### Q: 网站地址是什么？

A: 格式为 `https://<用户名>.github.io/<仓库名>/`
- 你的网站：https://enneket.github.io/daily/

### Q: 可以使用自定义域名吗？

A: 可以。在 Pages 设置页面的 "Custom domain" 部分配置。

### Q: 部署需要多长时间？

A: 通常 1-2 分钟。可以在 Actions 页面查看进度。

## 完整流程回顾

1. ✅ 桌面应用配置 GitHub 信息
2. ✅ 桌面应用初始化日报仓库（创建文件和 workflow）
3. ✅ 构建成功（生成静态网站）
4. ⚠️ **启用 GitHub Pages**（需要手动操作）← 你现在在这一步
5. ✅ 部署成功
6. ✅ 访问网站

## 截图参考

### Pages 设置页面应该是这样的：

```
Build and deployment
├─ Source: GitHub Actions  ← 选择这个
└─ Custom domain: (可选)

Your site is live at https://enneket.github.io/daily/
```

## 相关链接

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [使用 GitHub Actions 部署](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)
- [你的仓库 Pages 设置](https://github.com/enneket/daily/settings/pages)
- [你的仓库 Actions](https://github.com/enneket/daily/actions)

## 下一步

启用 GitHub Pages 后：
1. 重新触发构建（提交日报或手动触发）
2. 等待部署完成
3. 访问 https://enneket.github.io/daily/
4. 开始使用你的日报网站！
