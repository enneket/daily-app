export interface GitHubConfig {
  githubToken: string;
  repoOwner: string;
  repoName: string;
  branch: string;
}

export interface ElectronAPI {
  getConfig: () => Promise<GitHubConfig | undefined>;
  saveConfig: (config: GitHubConfig) => Promise<{ success: boolean }>;
  testConnection: () => Promise<{ success: boolean; error?: string }>;
  getTodayReport: () => Promise<{ success: boolean; content?: string; error?: string }>;
  submitReport: (content: string) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
