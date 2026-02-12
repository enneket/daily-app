# 发布 v1.0.0 版本指南

## 准备工作

### 1. 确认代码状态

确保所有修改已提交：
```bash
git status
```

### 2. 确认构建成功

本地测试构建：
```bash
npm run build
```

### 3. 确认版本号

检查 `package.json` 中的版本号是否为 `1.0.0`：
```json
{
  "version": "1.0.0"
}
```

## 发布步骤

### 步骤 1：提交所有更改

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "Release v1.0.0"

# 推送到远程仓库
git push origin main
```

### 步骤 2：创建并推送 tag

```bash
# 创建 tag
git tag -a v1.0.0 -m "Release v1.0.0

## 核心功能
- 跨平台桌面应用（Windows、macOS、Linux）
- GitHub 集成和自动提交
- 日报展示网站（日历、归档、统计）
- 自动初始化和版本管理
- 全文搜索功能

## 修复
- 修复日报详情页 404 问题
- 修复统计页面对象遍历问题
- 自动迁移日报文件
- 修复详情页链接 base 前缀

详见：https://github.com/你的用户名/daily-app/blob/main/docs/v1.0.0正式版发布.md"

# 推送 tag
git push origin v1.0.0
```

### 步骤 3：等待 GitHub Actions 构建

1. 访问：https://github.com/你的用户名/daily-app/actions
2. 查看 "构建和发布" workflow 的运行状态
3. 等待所有平台构建完成（约 10-20 分钟）

构建内容：
- ✅ macOS: `DailyReport-1.0.0.dmg`
- ✅ Windows: `DailyReport-Setup-1.0.0.exe`
- ✅ Linux: `DailyReport-1.0.0.AppImage` 和 `daily-report-app_1.0.0_amd64.deb`

### 步骤 4：验证 Release

1. 访问：https://github.com/你的用户名/daily-app/releases
2. 确认 v1.0.0 release 已创建
3. 确认所有安装包都已上传
4. 检查 release notes 是否正确

### 步骤 5：测试安装包

下载并测试各平台的安装包：

**Windows**:
1. 下载 `DailyReport-Setup-1.0.0.exe`
2. 运行安装程序
3. 测试应用功能

**macOS**:
1. 下载 `DailyReport-1.0.0.dmg`
2. 打开 dmg 文件
3. 拖动到 Applications
4. 测试应用功能

**Linux**:
1. 下载 `DailyReport-1.0.0.AppImage`
2. 添加执行权限：`chmod +x DailyReport-1.0.0.AppImage`
3. 运行：`./DailyReport-1.0.0.AppImage`
4. 测试应用功能

## 发布后工作

### 1. 更新 README

确保 README.md 中的下载链接指向最新版本：
```markdown
## 下载

从 [Releases](https://github.com/你的用户名/daily-app/releases/latest) 页面下载最新版本。
```

### 2. 发布公告

在以下渠道发布公告：
- GitHub Discussions
- 项目主页
- 社交媒体

### 3. 收集反馈

关注：
- GitHub Issues
- 用户反馈
- Bug 报告

## 快速命令

如果你已经确认一切就绪，可以直接运行：

```bash
# 使用发布脚本（推荐）
bash bin/发布v1.0.0命令.sh

# 或手动执行
git add .
git commit -m "Release v1.0.0"
git push origin main

# 创建并推送 tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

然后等待 GitHub Actions 自动构建和发布。

## 故障排除

### 构建失败

1. 查看 Actions 日志
2. 修复问题
3. 删除 tag：`git tag -d v1.0.0 && git push origin :refs/tags/v1.0.0`
4. 重新创建 tag

### Release 未创建

1. 检查 workflow 权限（Settings → Actions → General → Workflow permissions）
2. 确保选择了 "Read and write permissions"
3. 重新运行 workflow

### 安装包缺失

1. 检查 Actions artifacts
2. 确认所有平台都构建成功
3. 如果某个平台失败，可以手动重新运行该任务

## 注意事项

1. **Tag 命名**：必须以 `v` 开头（如 `v1.0.0`）
2. **版本号**：遵循语义化版本规范（Semantic Versioning）
3. **构建时间**：完整构建需要 10-20 分钟
4. **网络问题**：如果构建超时，可以重新运行
5. **权限问题**：确保 GitHub Actions 有写入权限

## 版本号规范

遵循语义化版本：`主版本号.次版本号.修订号`

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

示例：
- `1.0.0` - 第一个正式版本
- `1.1.0` - 新增功能
- `1.1.1` - Bug 修复
- `2.0.0` - 重大更新

## 下一步

发布完成后，可以开始规划下一个版本的功能。

祝发布顺利！🎉
