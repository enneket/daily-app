import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  async load() {
    const indexPath = path.join(__dirname, 'reports-index.json');
    
    // 如果索引文件不存在，返回空数组
    if (!fs.existsSync(indexPath)) {
      console.warn('reports-index.json 不存在，返回空数组');
      return [];
    }
    
    try {
      const content = fs.readFileSync(indexPath, 'utf-8');
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('读取 reports-index.json 失败:', error);
      return [];
    }
  }
};
