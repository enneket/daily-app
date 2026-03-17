const { Octokit } = require('@octokit/rest');
const fsModule = require('fs');
const pathModule = require('path');

interface LocalConfig {
  githubToken: string;
  repoOwner: string;
  repoName: string;
  branch: string;
}

interface RepoConfig {
  dailyReportPath: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

class GitHubService {
  private octokit: any;
  private config: LocalConfig;
  private repoConfig?: RepoConfig;
  private store: any;

  // 提交策略配置
  private readonly BATCH_SIZE = 10;  // 累积 10 个 commit 后提交
  // 提交锁，防止并发提交
  private isSubmitting = false;
  private readonly AUTO_PUSH_INTERVAL = 4 * 60 * 60 * 1000;  // 4 小时（毫秒）

  // 版本管理
  private readonly CURRENT_VERSION = '1.0.3';
  private readonly FILE_VERSIONS: Record<string, string> = {
    'site/.vitepress/config.ts': '1.0.3',
    'site/.vitepress/reports-index.data.ts': '1.1.0',
    'site/.vitepress/stats.data.ts': '1.1.0',
    'site/.vitepress/reports-index.json': '1.1.0',
    'site/.vitepress/stats.json': '1.1.0',
    'site/index.md': '1.0.3',
    'site/archive.md': '1.2.0',
    'site/stats.md': '1.2.6',
    'site/latest.md': '1.1.0',
    'site/public/favicon.png': '1.2.7',
    'scripts/generate-index.js': '1.2.4',
    'scripts/migrate-reports.js': '1.2.3',
    'package.json': '1.1.0',
    '.gitignore': '1.0.0',
    '.github/workflows/deploy-site.yml': '1.1.1',
    'README.md': '1.0.0'
  };

  constructor(config: LocalConfig, store: any) {
    this.config = config;
    this.store = store;
    this.octokit = new Octokit({
      auth: config.githubToken,
    });

    if (!this.store.get('pendingCommits')) {
      this.store.set('pendingCommits', 0);
    }
  }

  async testConnection(): Promise<void> {
    await this.octokit.repos.get({
      owner: this.config.repoOwner,
      repo: this.config.repoName,
    });
  }

  /**
   * 测试连接并初始化/更新仓库
   */
  async testConnectionAndInitialize(): Promise<{
    initialized: boolean;
    skipped: boolean;
    updated: boolean;
    updatedFiles: string[];
  }> {
    await this.testConnection();

    const { needsUpdate, outdatedFiles } = await this.checkVersion();

    if (needsUpdate) {
      await this.updateRepoFiles(outdatedFiles);
      return {
        initialized: true,
        skipped: false,
        updated: true,
        updatedFiles: outdatedFiles
      };
    }

    return {
      initialized: false,
      skipped: true,
      updated: false,
      updatedFiles: []
    };
  }

  /**
   * 检查仓库版本，判断是否需要更新
   */
  private async checkVersion(): Promise<{ needsUpdate: boolean; outdatedFiles: string[] }> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.repoOwner,
        repo: this.config.repoName,
        path: '.daily-version.json',
        ref: this.config.branch,
      });

      if ('content' in data) {
        const versionInfo = JSON.parse(Buffer.from(data.content, 'base64').toString());

        // 比较整体版本
        if (versionInfo.version !== this.CURRENT_VERSION) {
          console.log(`版本不匹配: ${versionInfo.version} -> ${this.CURRENT_VERSION}`);
          return { needsUpdate: true, outdatedFiles: Object.keys(this.FILE_VERSIONS) };
        }

        // 检查单个文件版本
        const outdatedFiles: string[] = [];
        for (const [file, version] of Object.entries(this.FILE_VERSIONS)) {
          if (!versionInfo.files || versionInfo.files[file] !== version) {
            outdatedFiles.push(file);
          }
        }

        if (outdatedFiles.length > 0) {
          console.log(`发现 ${outdatedFiles.length} 个过期文件`);
          return { needsUpdate: true, outdatedFiles };
        }

        console.log('仓库已是最新版本');
        return { needsUpdate: false, outdatedFiles: [] };
      }
    } catch (error) {
      // 没有版本文件，需要完整初始化
      console.log('未找到版本文件，需要初始化');
      return { needsUpdate: true, outdatedFiles: Object.keys(this.FILE_VERSIONS) };
    }

    return { needsUpdate: false, outdatedFiles: [] };
  }


  /**
   * 读取本地文件内容
   */
  private readLocalFile(relativePath: string): string | Buffer {
    const filePath = pathModule.join(__dirname, '../../', relativePath);
    // 判断是否为二进制文件（图片等）
    const isBinary = /\.(png|jpg|jpeg|gif|ico|icns|svg|webp)$/i.test(relativePath);
    if (isBinary) {
      return fsModule.readFileSync(filePath);
    }
    return fsModule.readFileSync(filePath, 'utf-8');
  }
  /**
   * 替换内容中的占位符
   */
  private replacePlaceholders(content: string): string {
    return content
      .replace(/\{\{REPO_OWNER\}\}/g, this.config.repoOwner)
      .replace(/\{\{REPO_NAME\}\}/g, this.config.repoName);
  }

  /**
   * 清理已移除的文件
   */
  private async cleanupRemovedFiles(): Promise<void> {
    const removedFiles = [
      'site/calendar.md',
      'site/calendar-simple.md',
      'site/calendar-complex.md.bak'
    ];

    console.log('检查并清理已移除的文件...');

    for (const filePath of removedFiles) {
      try {
        const { data } = await this.octokit.repos.getContent({
          owner: this.config.repoOwner,
          repo: this.config.repoName,
          path: filePath,
          ref: this.config.branch,
        });

        if ('sha' in data) {
          await this.octokit.repos.deleteFile({
            owner: this.config.repoOwner,
            repo: this.config.repoName,
            path: filePath,
            message: `Remove deprecated file: ${filePath}`,
            sha: data.sha,
            branch: this.config.branch,
          });
          console.log(`  ✓ 已删除: ${filePath}`);
        }
      } catch (error: any) {
        if (error.status === 404) {
          // 文件不存在，无需删除
        } else {
          console.warn(`清理文件失败 ${filePath}:`, error.message);
        }
      }
    }
  }

  /**
   * 迁移旧的日报文件从 docs/ 到 site/docs/
   */
  private async migrateOldReports(): Promise<void> {
    console.log('检查是否需要迁移旧的日报文件...');

    try {
      // 检查 docs/ 目录是否存在
      const { data: docsContent } = await this.octokit.repos.getContent({
        owner: this.config.repoOwner,
        repo: this.config.repoName,
        path: 'docs',
        ref: this.config.branch,
      });

      if (!Array.isArray(docsContent)) {
        console.log('docs/ 不是目录，无需迁移');
        return;
      }

      // 检查是否包含年份目录（日报文件）
      const hasReports = docsContent.some(item =>
        item.type === 'dir' && /^\d{4}$/.test(item.name)
      );

      if (!hasReports) {
        console.log('docs/ 目录中没有日报文件，无需迁移');
        return;
      }

      console.log('发现旧的日报文件，开始迁移...');

      // 递归获取所有日报文件
      const reportFiles: Array<{ path: string; content: string; sha: string }> = [];

      const scanDirectory = async (path: string): Promise<void> => {
        const { data: items } = await this.octokit.repos.getContent({
          owner: this.config.repoOwner,
          repo: this.config.repoName,
          path,
          ref: this.config.branch,
        });

        if (!Array.isArray(items)) return;

        for (const item of items) {
          if (item.type === 'dir') {
            await scanDirectory(item.path);
          } else if (item.type === 'file' && item.name.endsWith('.md')) {
            // 读取文件内容
            const { data: fileData } = await this.octokit.repos.getContent({
              owner: this.config.repoOwner,
              repo: this.config.repoName,
              path: item.path,
              ref: this.config.branch,
            });

            if ('content' in fileData) {
              reportFiles.push({
                path: item.path,
                content: Buffer.from(fileData.content, 'base64').toString(),
                sha: fileData.sha
              });
            }
          }
        }
      };

      await scanDirectory('docs');

      console.log(`找到 ${reportFiles.length} 个日报文件，开始迁移...`);

      // 迁移文件
      for (const file of reportFiles) {
        // 计算新路径：docs/2026/02/12.md -> site/docs/2026/02/12.md
        const newPath = file.path.replace(/^docs\//, 'site/docs/');

        try {
          // 创建新文件
          await this.octokit.repos.createOrUpdateFileContents({
            owner: this.config.repoOwner,
            repo: this.config.repoName,
            path: newPath,
            message: `Migrate: ${file.path} -> ${newPath}`,
            content: Buffer.from(file.content).toString('base64'),
            branch: this.config.branch,
          });

          console.log(`  ✓ 迁移: ${file.path} -> ${newPath}`);

          // 删除旧文件
          await this.octokit.repos.deleteFile({
            owner: this.config.repoOwner,
            repo: this.config.repoName,
            path: file.path,
            message: `Remove old file: ${file.path}`,
            sha: file.sha,
            branch: this.config.branch,
          });
        } catch (error: any) {
          console.error(`迁移文件失败 ${file.path}:`, error.message);
        }
      }

      console.log(`✓ 迁移完成！共迁移 ${reportFiles.length} 个日报文件`);

    } catch (error: any) {
      if (error.status === 404) {
        console.log('未找到 docs/ 目录，无需迁移');
      } else {
        console.error('迁移过程出错:', error.message);
      }
    }
  }

  /**
   * 更新日报仓库文件
   */
  private async updateRepoFiles(filesToUpdate: string[]): Promise<void> {
    console.log(`开始更新日报仓库，共 ${filesToUpdate.length} 个文件...`);

    // 检查并迁移旧的日报文件
    await this.migrateOldReports();

    // 清理已移除的文件
    await this.cleanupRemovedFiles();

    const filesToCopy = [
      // 网站配置
      { local: 'site/.vitepress/config.ts', remote: 'site/.vitepress/config.ts' },
      { local: 'site/.vitepress/reports-index.data.ts', remote: 'site/.vitepress/reports-index.data.ts' },
      { local: 'site/.vitepress/stats.data.ts', remote: 'site/.vitepress/stats.data.ts' },
      { local: 'site/.vitepress/reports-index.json', remote: 'site/.vitepress/reports-index.json' },
      { local: 'site/.vitepress/stats.json', remote: 'site/.vitepress/stats.json' },

      // 网站页面
      { local: 'site/index.md', remote: 'site/index.md' },
      { local: 'site/archive.md', remote: 'site/archive.md' },
      { local: 'site/stats.md', remote: 'site/stats.md' },
      { local: 'site/latest.md', remote: 'site/latest.md' },

      // 静态资源
      { local: 'site/public/favicon.png', remote: 'site/public/favicon.png' },

      // 脚本
      { local: 'scripts/generate-index.js', remote: 'scripts/generate-index.js' },
      { local: 'scripts/migrate-reports.js', remote: 'scripts/migrate-reports.js' },

      // 配置文件
      { local: 'docs/日报仓库README模板.md', remote: 'README.md' },
    ];

    // package.json
    const packageJson = {
      name: this.config.repoName,
      version: '1.0.0',
      description: '我的日报',
      type: 'module',
      scripts: {
        'build:site': 'vitepress build site',
        'dev:site': 'vitepress dev site',
        'preview:site': 'vitepress preview site'
      },
      devDependencies: {
        'vitepress': '^1.0.0'
      }
    };

    // .gitignore
    const gitignore = `node_modules
site/.vitepress/dist
site/.vitepress/cache
site/.vitepress/reports-index.json
site/.vitepress/stats.json
.DS_Store
`;

    // GitHub Actions workflow
    const workflow = `name: 部署日报展示网站

on:
  push:
    branches: [${this.config.branch}]
    paths:
      - '**.md'
      - '.github/workflows/deploy-site.yml'
      - 'scripts/**'
      - 'site/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
      
      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: 清理缓存
        run: |
          rm -rf site/.vitepress/cache
          rm -rf site/.vitepress/dist
          rm -f site/.vitepress/reports-index.json
          rm -f site/.vitepress/stats.json
      
      - name: 安装依赖
        run: npm install
      
      - name: 生成日报索引
        run: node scripts/generate-index.js
      
      - name: 构建网站
        run: npm run build:site
      
      - name: 上传构建产物
        uses: actions/upload-pages-artifact@v3
        with:
          path: site/.vitepress/dist
  
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: 部署到 GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

    // 版本文件
    const versionInfo = {
      version: this.CURRENT_VERSION,
      updatedAt: new Date().toISOString(),
      files: this.FILE_VERSIONS
    };

    try {
      // 批量创建文件
      const files: Array<{ path: string; content: string | Buffer }> = [];

      // 复制本地文件
      for (const file of filesToCopy) {
        if (filesToUpdate.includes(file.remote)) {
          try {
            let content = this.readLocalFile(file.local);

            // 对需要替换占位符的文件进行处理（只处理文本文件）
            if (typeof content === 'string' &&
              (file.remote === 'site/.vitepress/config.ts' ||
                file.remote === 'scripts/generate-index.js')) {
              content = this.replacePlaceholders(content);
            }

            files.push({ path: file.remote, content });
          } catch (error) {
            console.warn(`跳过文件 ${file.local}:`, error);
          }
        }
      }

      // 添加生成的文件（如果需要更新）
      if (filesToUpdate.includes('package.json')) {
        files.push({ path: 'package.json', content: JSON.stringify(packageJson, null, 2) });
      }
      if (filesToUpdate.includes('.gitignore')) {
        files.push({ path: '.gitignore', content: gitignore });
      }
      if (filesToUpdate.includes('.github/workflows/deploy-site.yml')) {
        files.push({ path: '.github/workflows/deploy-site.yml', content: workflow });
      }

      // 始终更新版本文件
      files.push({ path: '.daily-version.json', content: JSON.stringify(versionInfo, null, 2) });

      // 逐个上传文件
      const failedFiles: string[] = [];
      for (const file of files) {
        try {
          // 获取现有文件的 SHA（如果存在）
          let sha: string | undefined;
          try {
            const { data } = await this.octokit.repos.getContent({
              owner: this.config.repoOwner,
              repo: this.config.repoName,
              path: file.path,
              ref: this.config.branch,
            });
            if ('sha' in data) {
              sha = data.sha;
            }
          } catch (error) {
            // 文件不存在，不需要 SHA
          }

          await this.octokit.repos.createOrUpdateFileContents({
            owner: this.config.repoOwner,
            repo: this.config.repoName,
            path: file.path,
            message: `Update: ${file.path} to v${this.CURRENT_VERSION}`,
            content: Buffer.isBuffer(file.content)
              ? file.content.toString('base64')
              : Buffer.from(file.content).toString('base64'),
            branch: this.config.branch,
            sha: sha,
          });
          console.log(`已更新: ${file.path}`);
        } catch (error: any) {
          console.error(`更新文件失败 ${file.path}:`, error.message);
          failedFiles.push(file.path);
        }
      }

      if (failedFiles.length > 0) {
        console.warn(`以下文件更新失败: ${failedFiles.join(', ')}`);
        throw new Error(`部分文件更新失败: ${failedFiles.join(', ')}`);
      }

      console.log('日报仓库更新完成！');
    } catch (error) {
      console.error('更新仓库失败:', error);
      throw new Error('更新仓库失败，请检查权限和网络连接');
    }
  }

  /**
   * 初始化日报仓库（复制网站文件）
   * @deprecated 使用 updateRepoFiles 替代
   */
  private async initializeRepo(): Promise<void> {
    // 调用 updateRepoFiles 进行完整初始化
    await this.updateRepoFiles(Object.keys(this.FILE_VERSIONS));
  }

  private generateFilePath(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `site/docs/${year}/${month}/${day}.md`;
  }

  async getTodayReport(): Promise<string> {
    const today = new Date();
    const todayDateString = today.toLocaleDateString('zh-CN');
    const filePath = this.generateFilePath(today);

    // 1. 先检查本地缓存
    const cachedReport = this.store.get('cachedReport');
    if (cachedReport && cachedReport.filePath === filePath) {
      return this.filterTodayContent(cachedReport.content, todayDateString);
    }

    // 2. 从 GitHub 获取
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.repoOwner,
        repo: this.config.repoName,
        path: filePath,
        ref: this.config.branch,
      });

      if ('content' in data) {
        const content = Buffer.from(data.content, 'base64').toString();
        return this.filterTodayContent(content, todayDateString);
      }
      return '';
    } catch (error) {
      return '';
    }
  }
  /**
   * 过滤今天的内容
   */
  private filterTodayContent(content: string, todayDateString: string): string {
    if (!content) return '';

    const lines = content.split('\n');
    const todayLines: string[] = [];
    let isInTodaySection = false;
    let foundTodayHeader = false;

    for (const line of lines) {
      // 检查是否是今天的日期标题 (格式: # 2026/3/10 日报)
      if (line.match(/^# \d{4}\/\d{1,2}\/\d{1,2}/) && line.includes(todayDateString)) {
        isInTodaySection = true;
        foundTodayHeader = true;
        todayLines.push(line);
        continue;
      }

      // 检查是否遇到其他日期标题（结束今天的内容）
      if (line.match(/^# \d{4}\/\d{1,2}\/\d{1,2}/) && !line.includes(todayDateString)) {
        isInTodaySection = false;
        continue;
      }

      // 如果在今天的内容区域，添加到结果
      if (isInTodaySection) {
        todayLines.push(line);
      }
    }

    // 如果没有找到今天的标题，返回空字符串
    if (!foundTodayHeader) {
      return '';
    }

    return todayLines.join('\n').trim();
  }
  /**
   * 检查是否为重复内容
   */
  private isDuplicateContent(existingContent: string, newContent: string, timestamp: string): boolean {
    if (!existingContent) return false;

    const lines = existingContent.split('\n');
    const timestampPattern = `## ${timestamp}`;

    // 检查是否已经存在相同时间戳的记录
    return lines.some(line => line.trim() === timestampPattern);
  }

  /**
   * 获取提交状态信息
   */
  getCommitStatus(): { pendingCommits: number; lastPushTime: number; nextPushTime: number } {
    const pendingCommits = this.store.get('pendingCommits') || 0;
    const lastPushTime = this.store.get('lastPushTime') || 0; // 修复：使用 0 而不是 Date.now()
    const nextPushTime = lastPushTime + this.AUTO_PUSH_INTERVAL;

    return {
      pendingCommits,
      lastPushTime,
      nextPushTime
    };
  }

  /**
   * 检查是否需要自动提交到 GitHub
   */
  private shouldAutoPush(): boolean {
    // 立即获取所有相关数据
    const pendingCommits = this.store.get('pendingCommits') || 0;
    const lastPushTime = this.store.get('lastPushTime');
    const now = Date.now();

    const condition1 = pendingCommits >= this.BATCH_SIZE;

    if (condition1) {
      console.log(`shouldAutoPush: 累积 ${pendingCommits} 个提交，触发自动推送`);
      return true;
    }

    const hasPendingCommits = pendingCommits > 0;
    const hasLastPushTime = !!lastPushTime;

    if (lastPushTime) {
      const timeDiff = now - lastPushTime;
      const timeExceeded = timeDiff >= this.AUTO_PUSH_INTERVAL;

      const condition2 = hasPendingCommits && timeExceeded;

      if (condition2) {
        console.log(`shouldAutoPush: 距离上次推送 ${Math.round(timeDiff / 1000 / 60)} 分钟，触发自动推送`);
        return true;
      }
    }

    return false;
  }

  /**
   * 将本地缓存的日报提交到 GitHub
   */
  private async pushToGitHub(filePath: string, content: string, sha?: string): Promise<void> {
    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.config.repoOwner,
      repo: this.config.repoName,
      path: filePath,
      message: `Update daily report: ${new Date().toLocaleDateString('zh-CN')}`,
      content: Buffer.from(content).toString('base64'),
      branch: this.config.branch,
      sha: sha,
    });
  }

  /**
   * 手动触发提交到 GitHub
   */
  async manualPush(): Promise<{ success: boolean; message: string; pushed: number }> {
    const pendingCommits = this.store.get('pendingCommits') || 0;

    if (pendingCommits === 0) {
      return { success: false, message: '没有待提交的内容', pushed: 0 };
    }

    try {
      // 获取本地缓存的日报内容
      const cachedReport = this.store.get('cachedReport');
      if (!cachedReport) {
        return { success: false, message: '没有缓存的日报内容', pushed: 0 };
      }

      // 提交到 GitHub
      await this.pushToGitHub(cachedReport.filePath, cachedReport.content, cachedReport.sha);

      // 清除缓存和计数
      this.store.delete('cachedReport');
      this.store.set('pendingCommits', 0);
      this.store.set('lastPushTime', Date.now());

      return {
        success: true,
        message: `已提交 ${pendingCommits} 个更新到 GitHub`,
        pushed: pendingCommits
      };
    } catch (error: any) {
      return {
        success: false,
        message: `提交失败: ${error.message}`,
        pushed: 0
      };
    }
  }

  async submitReport(content: string): Promise<void> {
    // 防止并发提交
    if (this.isSubmitting) {
      console.log('正在提交中，跳过重复请求');
      throw new Error('正在提交中，请稍后再试');
    }

    this.isSubmitting = true;

    try {
      const filePath = this.generateFilePath(new Date());
      // 提高时间戳精度，精确到秒
      const timestamp = new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      let existingContent = '';
      let sha: string | undefined;

      // 先尝试从缓存获取
      const cachedReport = this.store.get('cachedReport');
      if (cachedReport && cachedReport.filePath === filePath) {
        existingContent = cachedReport.content;
        sha = cachedReport.sha;
      } else {
        // 从 GitHub 获取现有内容
        try {
          const { data } = await this.octokit.repos.getContent({
            owner: this.config.repoOwner,
            repo: this.config.repoName,
            path: filePath,
            ref: this.config.branch,
          });

          if ('content' in data) {
            existingContent = Buffer.from(data.content, 'base64').toString();
            sha = data.sha;
          }
        } catch (error) {
          existingContent = `# ${new Date().toLocaleDateString('zh-CN')} 日报\n\n`;
        }
      }

      // 检查是否为重复内容
      if (this.isDuplicateContent(existingContent, content, timestamp)) {
        console.log('检测到重复内容，跳过提交');
        return;
      }

      // 追加新内容
      const newContent = `${existingContent}\n## ${timestamp}\n${content}\n`;

      // 原子性更新缓存和计数
      const currentPending = this.store.get('pendingCommits') || 0;
      const newPendingCommits = currentPending + 1;

      this.store.set('cachedReport', {
        filePath,
        content: newContent,
        sha
      });
      this.store.set('pendingCommits', newPendingCommits);

      // 检查是否需要自动提交到 GitHub
      const shouldPush = this.shouldAutoPush();

      if (shouldPush) {
        await this.pushToGitHub(filePath, newContent, sha);

        // 清除缓存和计数
        this.store.delete('cachedReport');
        this.store.set('pendingCommits', 0);
        this.store.set('lastPushTime', Date.now());
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}

module.exports = { GitHubService };
