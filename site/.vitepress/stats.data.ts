import { defineLoader } from 'vitepress';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface Stats {
  total: number;
  streak: number;
  thisYear: number;
  thisMonth: number;
  totalWords: number;
  avgWords: number;
  byMonth: Record<string, number>;
  byYear: Record<string, number>;
  firstDate: string;
  lastDate: string;
}

declare const data: Stats;
export { data };

export default defineLoader({
  watch: ['./stats.json'],
  load(): Stats {
    const filePath = resolve(__dirname, './stats.json');
    
    const defaultStats: Stats = {
      total: 0,
      streak: 0,
      thisYear: 0,
      thisMonth: 0,
      totalWords: 0,
      avgWords: 0,
      byMonth: {},
      byYear: {},
      firstDate: '',
      lastDate: ''
    };
    
    if (!existsSync(filePath)) {
      console.warn('stats.json 不存在，返回默认值');
      return defaultStats;
    }
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      return { ...defaultStats, ...JSON.parse(content) };
    } catch (error) {
      console.error('读取 stats.json 失败:', error);
      return defaultStats;
    }
  }
});
