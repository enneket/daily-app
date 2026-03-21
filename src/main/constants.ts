export const SUBMIT_STRATEGY = {
  BATCH_SIZE: 10,
  AUTO_PUSH_INTERVAL: 4 * 60 * 60 * 1000,
  AUTO_CHECK_INTERVAL: 60 * 60 * 1000,
} as const;

export const API_CONFIG = {
  MAX_CONCURRENT_UPLOADS: 5,
} as const;

// 测试用的 getter 函数
export function getBatchSize(): number {
  return SUBMIT_STRATEGY.BATCH_SIZE;
}

export function getAutoPushInterval(): number {
  return SUBMIT_STRATEGY.AUTO_PUSH_INTERVAL;
}

export function getAutoCheckInterval(): number {
  return SUBMIT_STRATEGY.AUTO_CHECK_INTERVAL;
}
