# 优化 GitHub 提交频率

## 功能描述

优化日报提交到 GitHub 的频率策略，避免频繁提交，采用批量提交和定时提交的方式。

## 提交策略

### 策略 1：批量提交
- 用户每次提交日报时，先保存到本地缓存
- 累积满 **10 个提交**时，自动推送到 GitHub
- 减少网络请求，提高效率

### 策略 2：定时提交
- 如果有未提交的内容，每 **4 小时**自动推送一次
- 避免长时间不同步
- 后台定时检查（每小时检查一次）

### 策略 3：手动提交
- 用户可以随时手动触发提交
- 立即将所有未提交的内容推送到 GitHub

## 实现细节

### 1. 本地缓存机制

使用 electron-store 存储：

```typescript
// 缓存的日报内容
cachedReport: {
  filePath: string,    // 文件路径
  content: string,     // 完整内容
  sha?: string        // GitHub 文件 SHA
}

// 待提交计数
pendingCommits: number

// 最后提交时间
lastPushTime: number
```

### 2. 提交流程

```
用户提交日报
    ↓
保存到本地缓存
    ↓
增加待提交计数
    ↓
检查是否满足提交条件
    ↓
是 → 推送到 GitHub → 清除缓存
否 → 等待下次提交
```

### 3. 自动检查

- 应用启动时启动定时器
- 每小时检查一次
- 满足条件时自动推送

### 4. 新增 API

#### getCommitStatus()
获取当前提交状态：
```typescript
{
  pendingCommits: number,    // 待提交数量
  lastPushTime: number,      // 最后提交时间
  nextPushTime: number       // 下次自动提交时间
}
```

#### manualPush()
手动触发提交：
```typescript
{
  success: boolean,
  message: string,
  pushed: number            // 已提交数量
}
```

## 代码变更

### 1. src/main/github-service.ts

**新增属性**：
```typescript
private store: any;
private readonly BATCH_SIZE = 10;
private readonly AUTO_PUSH_INTERVAL = 4 * 60 * 60 * 1000;
```

**修改构造函数**：
```typescript
constructor(config: LocalConfig, store: any) {
  this.config = config;
  this.store = store;
  // 初始化计数器
}
```

**新增方法**：
- `getCommitStatus()` - 获取提交状态
- `shouldAutoPush()` - 检查是否需要自动提交
- `pushToGitHub()` - 推送到 GitHub
- `manualPush()` - 手动提交

**修改方法**：
- `submitReport()` - 改为先保存到本地，满足条件时才推送

### 2. src/main/main.ts

**修改 GitHubService 实例化**：
```typescript
githubService = new GitHubServiceClass(config, store);
```

**新增 IPC Handlers**：
```typescript
ipcMain.handle('get-commit-status', async () => {...});
ipcMain.handle('manual-push', async () => {...});
```

**新增定时检查**：
```typescript
setInterval(async () => {
  // 每小时检查一次
  if (需要自动提交) {
    await githubService.manualPush();
  }
}, 60 * 60 * 1000);
```

## 使用场景

### 场景 1：正常使用
1. 用户提交第 1-9 次日报：保存到本地
2. 用户提交第 10 次日报：自动推送到 GitHub
3. 计数器重置，继续累积

### 场景 2：间隔较长
1. 用户提交 5 次日报后停止
2. 4 小时后，自动推送这 5 次提交
3. 计数器重置

### 场景 3：手动提交
1. 用户提交 3 次日报
2. 用户点击"立即提交"按钮
3. 立即推送这 3 次提交

## 优势

### 1. 减少网络请求
- 批量提交，减少 API 调用次数
- 降低网络开销

### 2. 提高性能
- 本地缓存，响应更快
- 减少等待时间

### 3. 避免频繁提交
- 不会每次都触发 GitHub Actions
- 节省 CI/CD 资源

### 4. 数据安全
- 本地缓存保证数据不丢失
- 定时提交保证数据同步

## 注意事项

### 1. 数据一致性
- 本地缓存与 GitHub 可能存在延迟
- 用户需要了解提交状态

### 2. 错误处理
- 网络错误时，数据保留在本地
- 下次提交时重试

### 3. 跨设备同步
- 如果在多个设备上使用，可能存在冲突
- 建议只在一个设备上使用

## 后续优化

### 1. UI 显示
- 显示待提交数量
- 显示距离下次自动提交的时间
- 添加"立即提交"按钮

### 2. 配置选项
- 允许用户自定义批量大小
- 允许用户自定义自动提交间隔

### 3. 冲突处理
- 检测远程是否有新提交
- 提供合并策略

## 测试建议

### 功能测试
1. 提交 1-9 次，验证不推送到 GitHub
2. 提交第 10 次，验证自动推送
3. 等待 4 小时，验证自动推送
4. 手动触发提交，验证立即推送

### 边界测试
1. 网络断开时提交
2. GitHub API 错误时提交
3. 应用重启后的状态恢复

### 性能测试
1. 批量提交的响应时间
2. 定时检查的资源占用

## 版本信息

- 功能类型：优化
- 影响范围：日报提交流程
- 向后兼容：是
- 计划版本：v1.1.0

---

**注意**：此功能改变了提交行为，用户需要了解新的提交策略。
