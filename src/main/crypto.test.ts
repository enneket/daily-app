import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to handle top-level variables for vi.mock
const { mockEncryptString, mockDecryptString, mockIsEncryptionAvailable } = vi.hoisted(() => ({
  mockEncryptString: vi.fn(),
  mockDecryptString: vi.fn(),
  mockIsEncryptionAvailable: vi.fn(),
}));

// Mock electron safeStorage
vi.mock('electron', () => ({
  safeStorage: {
    encryptString: mockEncryptString,
    decryptString: mockDecryptString,
    isEncryptionAvailable: mockIsEncryptionAvailable,
  },
}));

// Import after mock
import { encryptToken, decryptToken, isEncryptionAvailable, saveToken, loadToken } from './crypto';

describe('crypto module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isEncryptionAvailable', () => {
    it('应该返回 safeStorage 的加密可用状态', () => {
      mockIsEncryptionAvailable.mockReturnValue(true);
      expect(isEncryptionAvailable()).toBe(true);

      mockIsEncryptionAvailable.mockReturnValue(false);
      expect(isEncryptionAvailable()).toBe(false);
    });
  });

  describe('encryptToken', () => {
    it('应该使用 safeStorage 加密 token', () => {
      const token = 'ghp_test123';
      const encryptedBuffer = Buffer.from('encrypted');
      mockEncryptString.mockReturnValue(encryptedBuffer);

      const result = encryptToken(token);

      expect(mockEncryptString).toHaveBeenCalledWith(token);
      expect(result).toBe(encryptedBuffer);
    });
  });

  describe('decryptToken', () => {
    it('应该使用 safeStorage 解密 token', () => {
      const encrypted = Buffer.from('encrypted');
      const decryptedToken = 'ghp_test123';
      mockDecryptString.mockReturnValue(decryptedToken);

      const result = decryptToken(encrypted);

      expect(mockDecryptString).toHaveBeenCalledWith(encrypted);
      expect(result).toBe(decryptedToken);
    });
  });

  describe('saveToken', () => {
    it('加密可用时应该加密存储 token', () => {
      mockIsEncryptionAvailable.mockReturnValue(true);
      mockEncryptString.mockReturnValue(Buffer.from('encrypted'));

      const store = {
        set: vi.fn(),
      } as any;

      saveToken('ghp_test123', store);

      expect(store.set).toHaveBeenCalledWith('github-token', Buffer.from('encrypted'));
      expect(store.set).toHaveBeenCalledWith('github-token-encrypted', true);
      expect(mockEncryptString).toHaveBeenCalledWith('ghp_test123');
    });

    it('加密不可用时应该明文存储 token', () => {
      mockIsEncryptionAvailable.mockReturnValue(false);

      const store = {
        set: vi.fn(),
      } as any;

      saveToken('ghp_test123', store);

      expect(store.set).toHaveBeenCalledWith('github-token', 'ghp_test123');
      expect(store.set).toHaveBeenCalledWith('github-token-encrypted', false);
      expect(mockEncryptString).not.toHaveBeenCalled();
    });
  });

  describe('loadToken', () => {
    it('应该从加密存储加载 token（加密可用时）', () => {
      mockIsEncryptionAvailable.mockReturnValue(true);
      mockDecryptString.mockReturnValue('ghp_decrypted');
      const encryptedToken = Buffer.from('encrypted');

      const store = {
        get: vi.fn((key: string) => {
          if (key === 'github-token') return encryptedToken;
          if (key === 'github-token-encrypted') return true;
          return undefined;
        }),
      } as any;

      const result = loadToken(store);

      expect(result).toBe('ghp_decrypted');
      expect(mockDecryptString).toHaveBeenCalledWith(encryptedToken);
    });

    it('应该从明文存储加载 token（加密不可用时）', () => {
      mockIsEncryptionAvailable.mockReturnValue(false);

      const store = {
        get: vi.fn((key: string) => {
          if (key === 'github-token') return 'ghp_plain_text';
          if (key === 'github-token-encrypted') return false;
          return undefined;
        }),
      } as any;

      const result = loadToken(store);

      expect(result).toBe('ghp_plain_text');
      expect(mockDecryptString).not.toHaveBeenCalled();
    });

    it('应该从旧配置迁移 token', () => {
      // 加密不可用时，token 应以明文存储（降级场景）
      mockIsEncryptionAvailable.mockReturnValue(false);

      const store = {
        get: vi.fn((key: string) => {
          if (key === 'github-token') return undefined;
          if (key === 'github-token-encrypted') return undefined;
          if (key === 'github-config') return { githubToken: 'ghp_migrated', repoOwner: 'test' };
          return undefined;
        }),
        set: vi.fn(),
      } as any;

      const result = loadToken(store);

      expect(result).toBe('ghp_migrated');
      // 应该保存到新存储并清除旧配置
      expect(store.set).toHaveBeenCalledWith('github-token', 'ghp_migrated');
      expect(store.set).toHaveBeenCalledWith('github-token-encrypted', false);
    });

    it('应该从旧配置迁移 token（加密可用时）', () => {
      // 加密可用时，token 应被加密后存储
      mockIsEncryptionAvailable.mockReturnValue(true);
      mockDecryptString.mockReturnValue('ghp_migrated');

      const store = {
        get: vi.fn((key: string) => {
          if (key === 'github-token') return undefined;
          if (key === 'github-token-encrypted') return undefined;
          if (key === 'github-config') return { githubToken: 'ghp_migrated', repoOwner: 'test' };
          return undefined;
        }),
        set: vi.fn(),
      } as any;

      const result = loadToken(store);

      expect(result).toBe('ghp_migrated');
      // 加密存储时，github-token-encrypted 应为 true
      expect(store.set).toHaveBeenCalledWith('github-token-encrypted', true);
    });

    it('没有 token 时应该返回 null', () => {
      const store = {
        get: vi.fn(() => undefined),
      } as any;

      const result = loadToken(store);

      expect(result).toBeNull();
    });

    it('token 不是 Buffer 类型且加密标志为 true 时应该返回 string', () => {
      mockIsEncryptionAvailable.mockReturnValue(true);

      const store = {
        get: vi.fn((key: string) => {
          if (key === 'github-token') return 'string_token';
          if (key === 'github-token-encrypted') return true;
          return undefined;
        }),
      } as any;

      const result = loadToken(store);

      expect(result).toBe('string_token');
      expect(mockDecryptString).not.toHaveBeenCalled();
    });
  });
});
