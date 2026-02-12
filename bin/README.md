# 脚本目录

这个目录包含项目的各种实用脚本。

## 发布脚本

### 发布v1.0.0命令.sh

Linux/macOS 发布脚本，用于自动化发布流程。

**使用方法**：
```bash
bash bin/发布v1.0.0命令.sh
```

**功能**：
1. 提交所有更改
2. 推送到远程仓库
3. 创建 git tag v1.0.0
4. 推送 tag 触发 GitHub Actions 构建

### 发布v1.0.0命令.bat

Windows 发布脚本，功能与 .sh 版本相同。

**使用方法**：
```cmd
bin\发布v1.0.0命令.bat
```

## 注意事项

1. 运行发布脚本前，请确保：
   - 所有功能测试通过
   - 文档已更新
   - package.json 版本号正确

2. 发布脚本会自动：
   - 提交所有未提交的更改
   - 创建 git tag
   - 触发 GitHub Actions 构建

3. 构建完成后（10-20 分钟），可以在 GitHub Releases 页面下载安装包

## 相关文档

- [准备发布v1.0.0.md](../准备发布v1.0.0.md) - 发布准备指南
- [RELEASE.md](../RELEASE.md) - 详细发布流程
- [.github/RELEASE_CHECKLIST.md](../.github/RELEASE_CHECKLIST.md) - 发布检查清单
