import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions at top level (hoisted automatically by vitest)
const mockStoreGet = vi.fn();
const mockStoreSet = vi.fn();
const mockStoreDelete = vi.fn();

// Mocks are hoisted to top of file by vitest
vi.mock('electron-store', () => ({
  default: vi.fn().mockImplementation(() => ({
    get: mockStoreGet,
    set: mockStoreSet,
    delete: mockStoreDelete,
  })),
}));

vi.mock('@octokit/rest', () => ({
  Octokit: class {
    repos = {
      get: vi.fn(),
      getContent: vi.fn(),
      createOrUpdateFileContents: vi.fn(),
      deleteFile: vi.fn(),
    };
  },
}));

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}));

vi.mock('path', () => ({
  join: vi.fn().mockImplementation((...args: string[]) => args.join('/')),
}));

// Import after mocks
import { GitHubService } from './github-service';

describe('GitHubService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreGet.mockImplementation((key: string) => {
      if (key === 'pendingCommits') return 0;
      return undefined;
    });
  });

  describe('generateFilePath', () => {
    it('应该生成正确格式的文件路径', () => {
      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'test', repoName: 'repo', branch: 'main', githubToken: 'token' }, mockStore as any);
      const date = new Date(2026, 2, 21);
      const path = (service as any).generateFilePath(date);
      expect(path).toBe('site/docs/2026/03/21.md');
    });

    it('应该处理个位数月份和日期', () => {
      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'test', repoName: 'repo', branch: 'main', githubToken: 'token' }, mockStore as any);
      const date = new Date(2026, 0, 5);
      const path = (service as any).generateFilePath(date);
      expect(path).toBe('site/docs/2026/01/05.md');
    });
  });

  describe('replacePlaceholders', () => {
    it('应该替换 REPO_OWNER 占位符', () => {
      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'myowner', repoName: 'myname', branch: 'main', githubToken: 'token' }, mockStore as any);
      const result = (service as any).replacePlaceholders('Owner: {{REPO_OWNER}}');
      expect(result).toBe('Owner: myowner');
    });

    it('应该替换 REPO_NAME 占位符', () => {
      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'myowner', repoName: 'myname', branch: 'main', githubToken: 'token' }, mockStore as any);
      const result = (service as any).replacePlaceholders('Repo: {{REPO_NAME}}');
      expect(result).toBe('Repo: myname');
    });

    it('应该替换所有占位符', () => {
      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'myowner', repoName: 'myname', branch: 'main', githubToken: 'token' }, mockStore as any);
      const result = (service as any).replacePlaceholders('{{REPO_OWNER}}/{{REPO_NAME}}');
      expect(result).toBe('myowner/myname');
    });
  });

  describe('isDuplicateContent', () => {
    it('空内容时应该返回 false', () => {
      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'test', repoName: 'repo', branch: 'main', githubToken: 'token' }, mockStore as any);
      const result = (service as any).isDuplicateContent('', 'new content', '10:00:00');
      expect(result).toBe(false);
    });

    it('已存在相同时间戳时应该返回 true', () => {
      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'test', repoName: 'repo', branch: 'main', githubToken: 'token' }, mockStore as any);
      const existingContent = `# 2026/3/21 日报\n\n## 10:00:00\n内容1\n## 11:00:00\n内容2`;
      const result = (service as any).isDuplicateContent(existingContent, '新内容', '10:00:00');
      expect(result).toBe(true);
    });

    it('不存在相同时间戳时应该返回 false', () => {
      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'test', repoName: 'repo', branch: 'main', githubToken: 'token' }, mockStore as any);
      const existingContent = `# 2026/3/21 日报\n\n## 10:00:00\n内容1`;
      const result = (service as any).isDuplicateContent(existingContent, '新内容', '11:00:00');
      expect(result).toBe(false);
    });
  });

  describe('getCommitStatus', () => {
    it('应该返回正确的提交状态', () => {
      mockStoreGet.mockImplementation((key: string) => {
        if (key === 'pendingCommits') return 5;
        if (key === 'lastPushTime') return 1000000000000;
        return undefined;
      });

      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'test', repoName: 'repo', branch: 'main', githubToken: 'token' }, mockStore as any);
      const status = service.getCommitStatus();

      expect(status.pendingCommits).toBe(5);
      expect(status.lastPushTime).toBe(1000000000000);
      expect(status.nextPushTime).toBe(1000000000000 + 4 * 60 * 60 * 1000);
    });

    it('没有数据时应该返回默认值', () => {
      mockStoreGet.mockReturnValue(undefined);
      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'test', repoName: 'repo', branch: 'main', githubToken: 'token' }, mockStore as any);
      const status = service.getCommitStatus();

      expect(status.pendingCommits).toBe(0);
      expect(status.lastPushTime).toBe(0);
      expect(status.nextPushTime).toBe(4 * 60 * 60 * 1000);
    });
  });

  describe('shouldAutoPush', () => {
    it('待提交数达到批次大小时应该返回 true', () => {
      mockStoreGet.mockImplementation((key: string) => {
        if (key === 'pendingCommits') return 10; // BATCH_SIZE
        return undefined;
      });

      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'test', repoName: 'repo', branch: 'main', githubToken: 'token' }, mockStore as any);
      const result = (service as any).shouldAutoPush();
      expect(result).toBe(true);
    });

    it('待提交数未达到批次大小且未超时应该返回 false', () => {
      const now = Date.now();
      mockStoreGet.mockImplementation((key: string) => {
        if (key === 'pendingCommits') return 5;
        if (key === 'lastPushTime') return now - 1000;
        return undefined;
      });

      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'test', repoName: 'repo', branch: 'main', githubToken: 'token' }, mockStore as any);
      const result = (service as any).shouldAutoPush();
      expect(result).toBe(false);
    });

    it('有待提交且超过间隔时间应该返回 true', () => {
      const now = Date.now();
      const fourHoursAgo = now - (4 * 60 * 60 * 1000 + 1);
      mockStoreGet.mockImplementation((key: string) => {
        if (key === 'pendingCommits') return 3;
        if (key === 'lastPushTime') return fourHoursAgo;
        return undefined;
      });

      const mockStore = { get: mockStoreGet, set: mockStoreSet, delete: mockStoreDelete };
      const service = new GitHubService({ repoOwner: 'test', repoName: 'repo', branch: 'main', githubToken: 'token' }, mockStore as any);
      const result = (service as any).shouldAutoPush();
      expect(result).toBe(true);
    });
  });
});
