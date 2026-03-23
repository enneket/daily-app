/* eslint-disable @typescript-eslint/no-explicit-any */
import Store from 'electron-store';

// electron-store instance type
export type AppStore = Store;

export interface LocalConfig {
  githubToken?: string; // 现在token单独存储，这个字段可能为空
  repoOwner: string;
  repoName: string;
  branch: string;
}

export interface RepoConfig {
  dailyReportPath: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

export interface VersionInfo {
  version: string;
  updatedAt: string;
  files: Record<string, string>;
}

export interface CommitStatusResult {
  pendingCommits: number;
  lastPushTime: number;
  lastCommitTime: number;
  nextPushTime: number;
}

export interface InitializeResult {
  initialized: boolean;
  skipped: boolean;
  updated: boolean;
  updatedFiles: string[];
}

export interface ManualPushResult {
  success: boolean;
  message: string;
  pushed: number;
}

export interface CachedReport {
  filePath: string;
  content: string;
  sha?: string;
}
