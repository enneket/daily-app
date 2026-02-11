const { Octokit } = require('@octokit/rest');

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
