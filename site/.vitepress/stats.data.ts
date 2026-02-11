import { defineLoader } from 'vitepress';
import fs from 'fs';
import path from 'path';

export default defineLoader({
  async load() {
    const statsPath = path.join(__dirname, 'stats.json');
    
    // 默认统计数据
    const defaultStats = {
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
    
    // 如果统计文件不存在，返回默认值
    if (!fs.existsSync(statsPath)) {
      console.warn('stats.json 不存在，返回默认值');
      return defaultStats;
    }
    
    try {
      const content = fs.readFileSync(statsPath, 'utf-8');
      const data = JSON.parse(content);
      return { ...defaultStats, ...data };
    } catch (error) {
      console.error('读取 stats.json 失败:', error);
      return defaultStats;
    }
  }
});
