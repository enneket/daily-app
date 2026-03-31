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
  const encryptionAvailable = isEncryptionAvailable();

  if (encryptionAvailable) {
    const encrypted = encryptToken(token);
    const base64Token = encrypted.toString('base64');
    store.set(TOKEN_KEY, base64Token);
    store.set(ENCRYPTED_FLAG, true);
  } else {
    store.set(TOKEN_KEY, token);
    store.set(ENCRYPTED_FLAG, false);
  }
}

export function loadToken(store: AppStore): string | null {
  const token = store.get(TOKEN_KEY);
  const isEncrypted = store.get(ENCRYPTED_FLAG) as boolean;

  if (token) {
    if (isEncrypted && isEncryptionAvailable()) {
      if (typeof token === 'string') {
        const buffer = Buffer.from(token, 'base64');
        return decryptToken(buffer);
      }
    }
    if (typeof token === 'string') {
      return token;
    }
  }

  const config = store.get('github-config') as { githubToken?: string } | undefined;
  if (config?.githubToken) {
    saveToken(config.githubToken, store);
    const newConfig = { ...config, githubToken: undefined };
    store.set('github-config', newConfig);
    return config.githubToken;
  }

  return null;
}

export function debugCrypto(store: AppStore): object {
  const token = store.get(TOKEN_KEY);
  const isEncrypted = store.get(ENCRYPTED_FLAG);
  const encryptionAvailable = isEncryptionAvailable();

  return {
    tokenType: token ? token.constructor.name : 'undefined',
    tokenIsBuffer: Buffer.isBuffer(token),
    tokenIsUint8Array: token instanceof Uint8Array,
    tokenIsString: typeof token === 'string',
    tokenLength: token ? (typeof token === 'string' ? token.length : 'binary') : 0,
    isEncrypted,
    encryptionAvailable,
    hasToken: !!token,
    configHasToken: !!(store.get('github-config') as any)?.githubToken,
  };
}
