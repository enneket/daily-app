import { readdir, readFile, writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { constants } from 'fs';
import { access } from 'fs/promises';

/**
 * 迁移日报文件从 docs/ 到 site/docs/
 * 用于将旧版本的日报文件迁移到新位置
 */
async function migrateReports() {
  console.log('开始检查是否需要迁移日报文件...');
  
  const oldDir = 'docs';
  const newDir = 'site/docs';
  
  // 检查旧目录是否存在
  try {
    await access(oldDir, constants.F_OK);
  } catch {
    console.log('未找到旧的 docs/ 目录，无需迁移');
    return { migrated: false, count: 0 };
  }
  
  // 检查旧目录是否包含日报文件（年份目录）
  const entries = await readdir(oldDir, { withFileTypes: true });
  const hasReports = entries.some(entry => 
    entry.isDirectory() && /^\d{4}$/.test(entry.name)
  );
  
  if (!hasReports) {
    console.log('docs/ 目录中没有日报文件，无需迁移');
    return { migrated: false, count: 0 };
  }
  
  console.log('发现旧的日报文件，开始迁移...');
  
  let migratedCount = 0;
  
  // 递归迁移文件
  async function migrateDirectory(srcDir, destDir) {
    const entries = await readdir(srcDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = join(srcDir, entry.name);
      const destPath = join(destDir, entry.name);
      
      if (entry.isDirectory()) {
        // 创建目标目录
        await mkdir(destPath, { recursive: true });
        // 递归处理子目录
        await migrateDirectory(srcPath, destPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // 复制 Markdown 文件
        const content = await readFile(srcPath, 'utf-8');
        await writeFile(destPath, content, 'utf-8');
        migratedCount++;
        console.log(`  ✓ 迁移: ${srcPath} -> ${destPath}`);
      }
    }
  }
  
  // 确保目标目录存在
  await mkdir(newDir, { recursive: true });
  
  // 开始迁移
  await migrateDirectory(oldDir, newDir);
  
  // 删除旧目录
  try {
    await rm(oldDir, { recursive: true, force: true });
    console.log(`\n✓ 已删除旧目录: ${oldDir}`);
  } catch (error) {
    console.warn(`警告: 无法删除旧目录 ${oldDir}:`, error.message);
  }
  
  console.log(`\n✓ 迁移完成！共迁移 ${migratedCount} 个日报文件`);
  
  return { migrated: true, count: migratedCount };
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateReports()
    .then(result => {
      if (result.migrated) {
        console.log(`\n成功迁移 ${result.count} 个日报文件`);
        process.exit(0);
      } else {
        console.log('\n无需迁移');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('迁移失败:', error);
      process.exit(1);
    });
}

export { migrateReports };
