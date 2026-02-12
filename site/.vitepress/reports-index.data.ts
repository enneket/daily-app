import { defineLoader } from 'vitepress';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

declare const data: any[];
export { data };

export default defineLoader({
  watch: ['./reports-index.json'],
  load() {
    const filePath = resolve(__dirname, './reports-index.json');
    
    if (!existsSync(filePath)) {
      console.warn('reports-index.json 不存在，返回空数组');
      return [];
    }
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('读取 reports-index.json 失败:', error);
      return [];
    }
  }
});
