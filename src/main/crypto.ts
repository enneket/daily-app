import { safeStorage } from 'electron';

export function encryptToken(token: string): Buffer {
  if (!isEncryptionAvailable()) {
    throw new Error('Safe storage encryption is not available');
  }
  return safeStorage.encryptString(token);
}

export function decryptToken(encrypted: Buffer): string {
  if (!isEncryptionAvailable()) {
    throw new Error('Safe storage encryption is not available');
  }
  return safeStorage.decryptString(encrypted);
}

export function isEncryptionAvailable(): boolean {
  return safeStorage.isEncryptionAvailable();
}
