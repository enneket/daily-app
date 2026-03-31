import { safeStorage } from 'electron';
import { AppStore } from './types';

const TOKEN_KEY = 'github-token';
const ENCRYPTED_FLAG = 'github-token-encrypted';

export function encryptToken(token: string): Buffer {
  return safeStorage.encryptString(token);
}

export function decryptToken(encrypted: Buffer): string {
  return safeStorage.decryptString(encrypted);
}

export function isEncryptionAvailable(): boolean {
  return safeStorage.isEncryptionAvailable();
}

export function saveToken(token: string, store: AppStore): void {
  if (isEncryptionAvailable()) {
    const encrypted = encryptToken(token);
    store.set(TOKEN_KEY, encrypted);
    store.set(ENCRYPTED_FLAG, true);
  } else {
    // 如果加密不可用，降级为明文存储
    store.set(TOKEN_KEY, token);
    store.set(ENCRYPTED_FLAG, false);
  }
}

export function loadToken(store: AppStore): string | null {
  // 1. 首先尝试从新的加密存储加载
  const token = store.get(TOKEN_KEY);
  const isEncrypted = store.get(ENCRYPTED_FLAG) as boolean;

  if (token) {
    if (isEncrypted && isEncryptionAvailable()) {
      // 加密存储且加密可用
      if (Buffer.isBuffer(token)) {
        return decryptToken(token);
      }
      // 处理 Uint8Array 类型（electron-store 反序列化后可能是这个类型）
      if (token instanceof Uint8Array) {
        return decryptToken(Buffer.from(token));
      }
    }
    // 降级情况：非加密存储或加密不可用
    if (typeof token === 'string') {
      return token;
    }
  }

  // 2. 尝试从旧配置 (github-config) 加载 token（兼容旧版本）
  const config = store.get('github-config') as { githubToken?: string } | undefined;
  if (config?.githubToken) {
    // 旧配置中有 token，需要迁移到新存储
    saveToken(config.githubToken, store);
    // 清除旧配置中的 token
    const newConfig = { ...config, githubToken: undefined };
    store.set('github-config', newConfig);
    return config.githubToken;
  }

  return null;
}
