import { readdir, readFile, writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { constants } from 'fs';

/**
 * 生成日报索引
 * 扫描所有日报文件，生成索引和统计数据
 */
async function generateIndex() {
  console.log('开始生成日报索引...');
  
  const reportsDir = 'site/docs';
  const reports = [];
  
  // 检查 site/docs 目录是否存在
  try {
    await access(reportsDir, constants.F_OK);
  } catch {
    console.log('site/docs 目录不存在，创建空索引');
    await mkdir('site/.vitepress', { recursive: true });
    await writeFile('site/.vitepress/reports-index.json', JSON.stringify([], null, 2));
    await writeFile('site/.vitepress/stats.json', JSON.stringify(generateStats([]), null, 2));
    return;
  }
  
  // 递归扫描日报文件
  async function scanReports(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      // 跳过特殊目录
      if (entry.name.startsWith('.') || 
          entry.name === 'node_modules' || 
          entry.name === 'site' ||
          entry.name === 'scripts') {
        continue;
      }
      
      if (entry.isDirectory()) {
        // 检查是否是年份目录
        if (/^\d{4}$/.test(entry.name)) {
          await scanYear(fullPath, entry.name);
        }
      }
    }
  }
  
  // 扫描年份目录
  async function scanYear(yearPath, year) {
    const months = await readdir(yearPath, { withFileTypes: true });
    
    for (const month of months) {
      if (month.isDirectory() && /^\d{2}$/.test(month.name)) {
        await scanMonth(join(yearPath, month.name), year, month.name);
      }
    }
  }
  
  // 扫描月份目录
  async function scanMonth(monthPath, year, month) {
    const files = await readdir(monthPath);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const day = file.replace('.md', '');
        if (/^\d{2}$/.test(day)) {
          await processReport(join(monthPath, file), year, month, day);
        }
      }
    }
  }
  
  // 处理单个日报文件
  async function processReport(filePath, year, month, day) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const date = `${year}-${month}-${day}`;
      
      // 提取标题
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : `${date} 日报`;
      
      // 提取摘要（第一段非标题内容）
      const summary = extractSummary(content);
      
      // 提取时间条目
      const timeEntries = extractTimeEntries(content);
      
      // 计算字数
      const wordCount = content.replace(/[#\s\n]/g, '').length;
      
      reports.push({
        date,
        year,
        month,
        day,
        title,
        summary,
        timeEntries,
        wordCount,
        path: `/daily/docs/${year}/${month}/${day}`
      });
      
      console.log(`  ✓ ${date}`);
    } catch (error) {
      console.error(`  ✗ 处理失败: ${filePath}`, error.message);
    }
  }
  
  // 提取摘要
  function extractSummary(content, maxLength = 150) {
    // 移除标题
    let text = content.replace(/^#.+$/gm, '');
    // 移除代码块
    text = text.replace(/```[\s\S]*?```/g, '');
    // 移除行内代码
    text = text.replace(/`[^`]+`/g, '');
    // 移除时间标记
    text = text.replace(/^##\s+\d{1,2}:\d{2}$/gm, '');
    // 清理空白
    text = text.trim();
    
    // 截取
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    
    return text;
  }
  
  // 提取时间条目
  function extractTimeEntries(content) {
    const entries = [];
    const lines = content.split('\n');
    let currentTime = null;
    let currentContent = [];
    
    for (const line of lines) {
      const timeMatch = line.match(/^##\s+(\d{1,2}:\d{2})$/);
      if (timeMatch) {
        // 保存上一个条目
        if (currentTime) {
          entries.push({
            time: currentTime,
            content: currentContent.join('\n').trim()
          });
        }
        // 开始新条目
        currentTime = timeMatch[1];
        currentContent = [];
      } else if (currentTime) {
        currentContent.push(line);
      }
    }
    
    // 保存最后一个条目
    if (currentTime) {
      entries.push({
        time: currentTime,
        content: currentContent.join('\n').trim()
      });
    }
    
    return entries;
  }
  
  // 开始扫描
  await scanReports(reportsDir);
  
  // 按日期倒序排序
  reports.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 生成统计数据
  const stats = generateStats(reports);
  
  // 确保输出目录存在
  await mkdir('site/.vitepress', { recursive: true });
  
  // 写入索引文件
  await writeFile('site/.vitepress/reports-index.json', JSON.stringify(reports, null, 2));
  await writeFile('site/.vitepress/stats.json', JSON.stringify(stats, null, 2));
  
  console.log(`\n✓ 索引生成完成！`);
  console.log(`  - 总日报数: ${reports.length}`);
  console.log(`  - 连续天数: ${stats.streak}`);
  console.log(`  - 总字数: ${stats.totalWords.toLocaleString()}`);
  console.log(`  - 索引文件: site/.vitepress/reports-index.json`);
  console.log(`  - 统计文件: site/.vitepress/stats.json`);
}

/**
 * 生成统计数据
 */
function generateStats(reports) {
  if (reports.length === 0) {
    return {
      total: 0,
      streak: 0,
      thisYear: 0,
      thisMonth: 0,
      totalWords: 0,
      avgWords: 0,
      byMonth: {},
      byYear: {}
    };
  }
  
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = String(now.getMonth() + 1).padStart(2, '0');
  
  // 计算连续天数
  let streak = 0;
  const sortedDates = [...new Set(reports.map(r => r.date))].sort().reverse();
  
  // 从今天或最近一天开始计算
  let checkDate = new Date(sortedDates[0]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 如果最近的日报不是今天，从最近的日报开始
  if (checkDate < today) {
    const diffDays = Math.floor((today - checkDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      // 超过1天没写，连续天数为0
      streak = 0;
    } else {
      // 昨天写了，开始计算
      for (const dateStr of sortedDates) {
        const date = new Date(dateStr);
        const diff = Math.floor((checkDate - date) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) {
          streak++;
          checkDate = new Date(date);
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (diff === 1) {
          streak++;
          checkDate = date;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  } else {
    // 今天写了
    for (const dateStr of sortedDates) {
      const date = new Date(dateStr);
      const diff = Math.floor((checkDate - date) / (1000 * 60 * 60 * 24));
      
      if (diff === 0) {
        streak++;
        checkDate = new Date(date);
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (diff === 1) {
        streak++;
        checkDate = date;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }
  
  // 按月统计
  const byMonth = {};
  const byYear = {};
  
  reports.forEach(r => {
    const monthKey = `${r.year}-${r.month}`;
    byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    byYear[r.year] = (byYear[r.year] || 0) + 1;
  });
  
  const totalWords = reports.reduce((sum, r) => sum + r.wordCount, 0);
  
  return {
    total: reports.length,
    streak,
    thisYear: reports.filter(r => r.year === String(thisYear)).length,
    thisMonth: reports.filter(r => r.year === String(thisYear) && r.month === thisMonth).length,
    totalWords,
    avgWords: Math.round(totalWords / reports.length),
    byMonth,
    byYear,
    firstDate: sortedDates[sortedDates.length - 1],
    lastDate: sortedDates[0]
  };
}

// 运行
generateIndex().catch(error => {
  console.error('生成索引失败:', error);
  process.exit(1);
});
