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

  constructor(config: LocalConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.githubToken,
    });
  }

  async testConnection(): Promise<void> {
    await this.octokit.repos.get({
      owner: this.config.repoOwner,
      repo: this.config.repoName,
    });
  }

  /**
   * 检查仓库是否已初始化（是否存在网站配置文件）
   */
  private async checkRepoInitialized(): Promise<boolean> {
    try {
      await this.octokit.repos.getContent({
        owner: this.config.repoOwner,
        repo: this.config.repoName,
        path: 'site/.vitepress/config.ts',
        ref: this.config.branch,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 读取本地文件内容
   */
  private readLocalFile(relativePath: string): string {
    const filePath = pathModule.join(__dirname, '../../', relativePath);
    return fsModule.readFileSync(filePath, 'utf-8');
  }

  /**
   * 初始化日报仓库（复制网站文件）
   */
  private async initializeRepo(): Promise<void> {
    console.log('开始初始化日报仓库...');

    const filesToCopy = [
      // 网站配置
      { local: 'site/.vitepress/config.ts', remote: 'site/.vitepress/config.ts' },
      { local: 'site/.vitepress/reports-index.data.ts', remote: 'site/.vitepress/reports-index.data.ts' },
      { local: 'site/.vitepress/stats.data.ts', remote: 'site/.vitepress/stats.data.ts' },
      
      // 网站页面
      { local: 'site/index.md', remote: 'site/index.md' },
      { local: 'site/calendar.md', remote: 'site/calendar.md' },
      { local: 'site/archive.md', remote: 'site/archive.md' },
      { local: 'site/stats.md', remote: 'site/stats.md' },
      { local: 'site/latest.md', remote: 'site/latest.md' },
      
      // 脚本
      { local: 'scripts/generate-index.js', remote: 'scripts/generate-index.js' },
      
      // 配置文件
      { local: 'docs/日报仓库README模板.md', remote: 'README.md' },
    ];

    // package.json
    const packageJson = {
      name: this.config.repoName,
      version: '1.0.0',
      description: '我的日报',
      scripts: {
        'build:site': 'vitepress build site',
        'dev:site': 'vitepress dev site',
        'preview:site': 'vitepress preview site'
      },
      devDependencies: {
        'fs-extra': '^11.2.0',
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

    try {
      // 批量创建文件
      const files: Array<{ path: string; content: string }> = [];

      // 复制本地文件
      for (const file of filesToCopy) {
        try {
          const content = this.readLocalFile(file.local);
          files.push({ path: file.remote, content });
        } catch (error) {
          console.warn(`跳过文件 ${file.local}:`, error);
        }
      }

      // 添加生成的文件
      files.push({ path: 'package.json', content: JSON.stringify(packageJson, null, 2) });
      files.push({ path: '.gitignore', content: gitignore });
      files.push({ path: '.github/workflows/deploy-site.yml', content: workflow });

      // 逐个上传文件
      for (const file of files) {
        try {
          await this.octokit.repos.createOrUpdateFileContents({
            owner: this.config.repoOwner,
            repo: this.config.repoName,
            path: file.path,
            message: `Initialize: Add ${file.path}`,
            content: Buffer.from(file.content).toString('base64'),
            branch: this.config.branch,
          });
          console.log(`已创建: ${file.path}`);
        } catch (error: any) {
          console.error(`创建文件失败 ${file.path}:`, error.message);
        }
      }

      console.log('日报仓库初始化完成！');
    } catch (error) {
      console.error('初始化仓库失败:', error);
      throw new Error('初始化仓库失败，请检查权限和网络连接');
    }
  }

  private generateFilePath(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}.md`;
  }

  async getTodayReport(): Promise<string> {
    const filePath = this.generateFilePath(new Date());
    
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.repoOwner,
        repo: this.config.repoName,
        path: filePath,
        ref: this.config.branch,
      });
      
      if ('content' in data) {
        return Buffer.from(data.content, 'base64').toString();
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  async submitReport(content: string): Promise<void> {
    // 每次提交时检查并初始化仓库（如果需要）
    const isInitialized = await this.checkRepoInitialized();
    if (!isInitialized) {
      await this.initializeRepo();
    }

    const filePath = this.generateFilePath(new Date());
    const timestamp = new Date().toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    let existingContent = '';
    let sha: string | undefined;
    
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
    
    const newContent = `${existingContent}\n## ${timestamp}\n${content}\n`;
    
    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.config.repoOwner,
      repo: this.config.repoName,
      path: filePath,
      message: `Update daily report: ${new Date().toLocaleDateString('zh-CN')}`,
      content: Buffer.from(newContent).toString('base64'),
      branch: this.config.branch,
      sha: sha,
    });
  }
}

module.exports = { GitHubService };
