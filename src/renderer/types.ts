export interface GitHubConfig {
  githubToken: string;
  repoOwner: string;
  repoName: string;
  branch: string;
}

export interface CommitStatus {
  pendingCommits: number;
  lastPushTime: number;
  nextPushTime: number;
}

export interface ManualPushResult {
  success: boolean;
  message: string;
  pushed: number;
}

export interface ElectronAPI {
  getConfig: () => Promise<GitHubConfig | undefined>;
  saveConfig: (config: GitHubConfig) => Promise<{ success: boolean }>;
  testConnection: () => Promise<{ success: boolean; error?: string }>;
  getTodayReport: () => Promise<{ success: boolean; content?: string; error?: string }>;
  submitReport: (content: string) => Promise<{ success: boolean; error?: string }>;
  getCommitStatus: () => Promise<CommitStatus>;
  manualPush: () => Promise<ManualPushResult>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
