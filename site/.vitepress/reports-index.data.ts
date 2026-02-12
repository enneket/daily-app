import { defineLoader } from 'vitepress';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

declare const data: any[];
export { data };

export default defineLoader({
  watch: ['./reports-index.json'],
  load() {
    try {
      const filePath = resolve(__dirname, './reports-index.json');
      
      if (!existsSync(filePath)) {
        console.warn('reports-index.json 不存在，返回空数组');
        return [];
      }
      
      const content = readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      
      // 确保返回的是数组，且每个元素都有必需的字段
      if (!Array.isArray(parsed)) {
        return [];
      }
      
      return parsed.map(item => ({
        date: item.date || '',
        year: item.year || '',
        month: item.month || '',
        day: item.day || '',
        title: item.title || '',
        summary: item.summary || '',
        timeEntries: Array.isArray(item.timeEntries) ? item.timeEntries : [],
        wordCount: item.wordCount || 0,
        path: item.path || ''
      }));
    } catch (error) {
      console.error('读取 reports-index.json 失败:', error);
      return [];
    }
  }
});
