// discovery-sync.js — discovery 和 Wiki 双向同步
// 用法：node discovery-sync.js --direction "wiki-to-discovery|discovery-to-wiki|both"
// 功能：保持 discovery/ 和 wiki/ 知识一致

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const WIKI = path.join(ROOT, 'wiki');
const DISCOVERY_PATH = 'D:\ai_schedule\discovery'; // 外部路径
const SYNC_LOG = path.join(ROOT, 'wiki', '99-temp', 'sync-log.md');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { direction: 'both', dryRun: false, verbose: false };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--direction') {
      opts.direction = args[++i] || 'both';
    } else if (args[i] === '--dry-run') {
      opts.dryRun = true;
    } else if (args[i] === '--verbose') {
      opts.verbose = true;
    }
  }
  
  return opts;
}

function listDiscoveryFiles() {
  if (!fs.existsSync(DISCOVERY_PATH)) {
    return [];
  }
  
  const files = [];
  
  function walkDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          walkDir(fullPath);
        } else if (entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (e) {
      console.log('⚠️ 无法读取目录:', dir);
    }
  }
  
  walkDir(DISCOVERY_PATH);
  return files;
}

function extractDiscoveryKey(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 尝试提取标题作为 key
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].trim().toLowerCase().replace(/\s+/g, '-');
  }
  
  // 使用文件名作为 key
  return path.basename(filePath, '.md').toLowerCase();
}

function syncDiscoveryToWiki() {
  console.log('🔄 Discovery → Wiki 同步');
  
  const discoveryFiles = listDiscoveryFiles();
  const synced = 0;
  const skipped = 0;
  
  if (discoveryFiles.length === 0) {
    console.log('📭 Discovery 目录为空或不存在');
    return { synced: 0, skipped: 0 };
  }
  
  console.log(`🔍 发现 ${discoveryFiles.length} 个 discovery 文件`);
  
  for (const discoveryFile of discoveryFiles) {
    const discoveryKey = extractDiscoveryKey(discoveryFile);
    const discoveryContent = fs.readFileSync(discoveryFile, 'utf8');
    const discoveryStat = fs.statSync(discoveryFile);
    
    // 检查 wiki 中是否已存在对应的文件
    const wikiFile = path.join(WIKI, '02-knowledge', `${discoveryKey}.md`);
    
    if (fs.existsSync(wikiFile)) {
      // 检查修改时间
      const wikiStat = fs.statSync(wikiFile);
      
      if (wikiStat.mtime > discoveryStat.mtime) {
        console.log(`⏭️  跳过: ${discoveryKey} (Wiki 版本更新)`);
        skipped++;
        continue;
      }
      
      // 检查内容是否相同
      const wikiContent = fs.readFileSync(wikiFile, 'utf8');
      if (wikiContent === discoveryContent) {
        console.log(`✅ 跳过: ${discoveryKey} (内容相同)`);
        skipped++;
        continue;
      }
    }
    
    // 需要同步
    console.log(`📥 同步: ${discoveryKey}`);
    
    // 转换为 wiki 格式
    const wikiContent = convertToWikiFormat(discoveryContent, discoveryKey, discoveryFile);
    
    if (!opts.dryRun) {
      fs.writeFileSync(wikiFile, wikiContent, 'utf8');
      console.log(`   ✅ 已写入: ${wikiFile}`);
    } else {
      console.log(`   [DRY RUN] 将写入: ${wikiFile}`);
    }
    
    synced++;
  }
  
  return { synced, skipped };
}

function convertToWikiFormat(discoveryContent, key, sourceFile) {
  // 提取标题
  const titleMatch = discoveryContent.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : key;
  
  // 构建前导
  const now = new Date().toISOString().slice(0, 10);
  
  const wikiContent = `---
id: HERMES-DISCOVERY-${key.toUpperCase()}
title: ${title}
type: knowledge
tags: [discovery, imported]
trust: 0.5
use_cases: ["从 discovery 同步的知识"]
source: discovery_sync:${now}:${sourceFile}
last_updated: ${now}
---

# ${title}

> 从 discovery/ 自动同步

${discoveryContent}

---

## 同步信息

- **来源**: discovery/${path.basename(sourceFile)}
- **同步时间**: ${now}
- **同步模式**: 自动 discovery → wiki
`;
  
  return wikiContent;
}

function syncWikiToDiscovery() {
  console.log('🔄 Wiki → Discovery 同步');
  
  // 查找所有标记为从 discovery 同步的文件
  const wikiDir = path.join(WIKI, '02-knowledge');
  
  if (!fs.existsSync(wikiDir)) {
    console.log('📭 Wiki 目录不存在');
    return { synced: 0, skipped: 0 };
  }
  
  const files = fs.readdirSync(wikiDir).filter(f => f.endsWith('.md'));
  let synced = 0;
  let skipped = 0;
  
  for (const file of files) {
    const wikiFile = path.join(wikiDir, file);
    const content = fs.readFileSync(wikiFile, 'utf8');
    
    // 检查是否是 discovery 同步的
    const sourceMatch = content.match(/^source:\s*(.+)$/m);
    if (!sourceMatch || !sourceMatch[1].includes('discovery_sync:')) {
      skipped++;
      continue;
    }
    
    console.log(`📤 反向同步: ${file}`);
    
    // 提取原始 discovery 内容
    const originalMatch = content.match(/^>\s+从 discovery 自动同步\s*([\s\S]*?)^---\s*$/m);
    if (!originalMatch) {
      console.log(`⚠️ 无法提取原始内容: ${file}`);
      skipped++;
      continue;
    }
    
    const discoveryContent = originalMatch[1].trim();
    const sourcePathMatch = sourceMatch[1].match(/discovery\/(.+)$/);
    
    if (sourcePathMatch) {
      const targetPath = path.join(DISCOVERY_PATH, sourcePathMatch[1]);
      
      if (!opts.dryRun) {
        // 确保目标目录存在
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        fs.writeFileSync(targetPath, discoveryContent, 'utf8');
        console.log(`   ✅ 已写入: ${targetPath}`);
      } else {
        console.log(`   [DRY RUN] 将写入: ${targetPath}`);
      }
      
      synced++;
    } else {
      console.log(`⚠️ 无法解析源路径: ${sourceMatch[1]}`);
      skipped++;
    }
  }
  
  return { synced, skipped };
}

function logSyncResult(direction, results) {
  const now = new Date().toISOString().slice(0, 10);
  const time = new Date().toTimeString().slice(0, 8);
  
  let content = '';
  
  if (fs.existsSync(SYNC_LOG)) {
    content = fs.readFileSync(SYNC_LOG, 'utf8');
    if (!content.endsWith('\n')) content += '\n';
  } else {
    const dir = path.dirname(SYNC_LOG);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    content = `# Discovery 同步日志\n\n> 自动生成 by discovery-sync.js\n\n`;
  }
  
  const entry = `
## ${now} ${time} — ${direction}

- **同步文件**: ${results.synced}
- **跳过文件**: ${results.skipped}
- **模式**: ${opts.dryRun ? 'DRY RUN' : '实际执行'}
`;
  
  content += entry;
  fs.writeFileSync(SYNC_LOG, content, 'utf8');
  
  console.log(`📝 同步结果已记录: ${path.relative(ROOT, SYNC_LOG)}`);
}

function main() {
  const opts = parseArgs();
  
  console.log('🚀 Discovery 同步工具');
  console.log(`   方向: ${opts.direction}`);
  console.log(`   模式: ${opts.dryRun ? 'DRY RUN' : '实际执行'}`);
  console.log('');
  
  if (opts.direction === 'discovery-to-wiki' || opts.direction === 'both') {
    const results = syncDiscoveryToWiki();
    logSyncResult('Discovery → Wiki', results);
    
    if (!opts.dryRun) {
      console.log('✅ Discovery → Wiki 同步完成');
    } else {
      console.log('✅ Discovery → Wiki 同步完成 (DRY RUN)');
    }
  }
  
  if (opts.direction === 'wiki-to-discovery' || opts.direction === 'both') {
    if (opts.direction === 'both') {
      console.log('');
    }
    
    const results = syncWikiToDiscovery();
    logSyncResult('Wiki → Discovery', results);
    
    if (!opts.dryRun) {
      console.log('✅ Wiki → Discovery 同步完成');
    } else {
      console.log('✅ Wiki → Discovery 同步完成 (DRY RUN)');
    }
  }
}

main();
