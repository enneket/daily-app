import { GitHubService } from './github-service';
import { LocalConfig, AppStore } from './types';

let githubServiceInstance: GitHubService | null = null;

export function getGitHubService(store: AppStore, config: LocalConfig): GitHubService {
  if (!githubServiceInstance) {
    githubServiceInstance = new GitHubService(config, store);
  }
  return githubServiceInstance;
}

export function resetGitHubService(): void {
  githubServiceInstance = null;
}
