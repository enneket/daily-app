import { describe, it, expect } from 'vitest';
import { getBatchSize, getAutoPushInterval, getAutoCheckInterval } from './constants';

describe('SUBMIT_STRATEGY constants', () => {
  describe('getBatchSize', () => {
    it('应该返回正确的批次大小', () => {
      expect(getBatchSize()).toBe(10);
    });
  });

  describe('getAutoPushInterval', () => {
    it('应该返回自动推送间隔（毫秒）', () => {
      expect(getAutoPushInterval()).toBe(4 * 60 * 60 * 1000);
    });
  });

  describe('getAutoCheckInterval', () => {
    it('应该返回自动检查间隔（毫秒）', () => {
      expect(getAutoCheckInterval()).toBe(60 * 60 * 1000);
    });
  });
});
