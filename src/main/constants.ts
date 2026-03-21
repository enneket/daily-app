export const SUBMIT_STRATEGY = {
  BATCH_SIZE: 10,
  AUTO_PUSH_INTERVAL: 4 * 60 * 60 * 1000,
  AUTO_CHECK_INTERVAL: 60 * 60 * 1000,
} as const;

export const API_CONFIG = {
  MAX_CONCURRENT_UPLOADS: 5,
} as const;
