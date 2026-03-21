import { GitHubService } from './github-service';
import { LocalConfig, AppStore } from './types';
import { loadToken } from './crypto';

let githubServiceInstance: GitHubService | null = null;

export function getGitHubService(store: AppStore, config: LocalConfig): GitHubService {
  // 从加密存储加载 token
  const token = loadToken(store);
  if (!token) {
    throw new Error('GitHub token not found. Please reconfigure GitHub settings.');
  }

  const fullConfig: LocalConfig = {
    ...config,
    githubToken: token,
  };

  if (!githubServiceInstance) {
    githubServiceInstance = new GitHubService(fullConfig, store);
  }
  return githubServiceInstance;
}

export function resetGitHubService(): void {
  githubServiceInstance = null;
}
