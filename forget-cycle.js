'use strict';

const fs = require('fs');
const path = require('path');
const {
  ROOT,
  WIKI,
  ARCHIVE,
  ensureBaseDirs,
  walkMarkdown,
  parseFrontmatter,
  writeMarkdown,
  upsertIndexEntry,
  appendLog
} = require('./wiki-utils');

function parseArgs() {
  const args = process.argv.slice(2);
  return { 
    dryRun: args.includes('--dry-run'),
    quick: args.includes('--quick')
  };
}

function collectCandidates() {
  const factsDir = path.join(WIKI, '04-facts');
  const now = Date.now();
  const threshold = 14 * 24 * 60 * 60 * 1000;
  const candidates = [];

  for (const file of walkMarkdown(factsDir)) {
    const content = fs.readFileSync(file, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed.data) continue;
    const trust = Number(parsed.data.trust || 1);
    const updated = new Date(parsed.data.last_updated || 0);
    if (trust < 0.3 && now - updated.getTime() > threshold) {
      candidates.push({ file, content, title: parsed.data.title || path.basename(file, '.md') });
    }
  }

  return candidates;
}

/**
 * 清理 99-temp 候选文件
 * >7天 → 标记待晋升 | >14天 → 自动移入 98-archive
 */
function cleanTempCandidates(dryRun) {
  const tempDir = path.join(WIKI, '99-temp');
  const now = Date.now();
  const promoteThreshold = 7 * 86400000;
  const archiveThreshold = 14 * 86400000;
  const results = { pending: [], moved: [] };

  if (!fs.existsSync(tempDir)) return results;

  for (const file of fs.readdirSync(tempDir)) {
    const fullPath = path.join(tempDir, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;
    
    // 跳过非候选文件（日志、json）
    if (file.startsWith('lint-') || file.endsWith('.log') || file.endsWith('.json')) continue;
    
    const age = now - stat.mtimeMs;
    
    if (age > archiveThreshold) {
      if (!dryRun) {
        const dest = path.join(ARCHIVE, file);
        fs.renameSync(fullPath, dest);
        appendLog('forget', `候选 ${file} 归档 (${Math.floor(age/86400000)}天)`);
      }
      results.moved.push(file);
      console.log(`  📦 ${dryRun?'[DRY]':'[MOVE]'} 候选 ${file} → 98-archive (${Math.floor(age/86400000)}天)`);
    } else if (age > promoteThreshold) {
      results.pending.push(file);
      console.log(`  ⏳ [PENDING] 候选 ${file} (${Math.floor(age/86400000)}天，待确认晋升)`);
    }
  }
  return results;
}

/**
 * 清理超过 7 天的 .backup 文件
 */
function cleanBackupFiles(dryRun) {
  const searchPaths = [
    'C:/Users/YANG/AppData/Local/hermes/',
    ROOT
  ];
  const threshold = 7 * 86400000;
  const now = Date.now();
  const results = { deleted: [] };

  for (const dir of searchPaths) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.includes('.backup')) continue;
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (!stat.isFile()) continue;
      const age = now - stat.mtimeMs;
      if (age > threshold) {
        if (!dryRun) {
          fs.unlinkSync(fullPath);
          appendLog('forget', `删除备份 ${f}`);
        }
        results.deleted.push(f);
        console.log(`  🗑️ ${dryRun?'[DRY]':'[DEL]'} 备份 ${f} (${Math.floor(age/86400000)}天)`);
      } else {
        console.log(`  ⏸️  备份 ${f} (${Math.floor(age/86400000)}天，未超期)`);
      }
    }
  }
  return results;
}

/**
 * 报告 .disabled 文件（只报告不删除）
 */
function checkDisabledFiles() {
  const checkDirs = [
    'C:/Users/YANG/AppData/Local/hermes/cron_jobs/',
    'C:/Users/YANG/AppData/Local/hermes/scripts/'
  ];
  const results = [];

  for (const dir of checkDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.disabled')) continue;
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      const age = Date.now() - stat.mtimeMs;
      results.push({ path: dir + f, days: Math.floor(age / 86400000) });
      console.log(`  ⚪ [DISABLED] ${f} (${Math.floor(age/86400000)}天) — 待 YANG 确认删除`);
    }
  }
  return results;
}

/**
 * 报告 Git 脏状态
 */
function gitStatusReport() {
  try {
    const execSync = require('child_process').execSync;
    const status = execSync('git status --short', { cwd: ROOT, encoding: 'utf8', timeout: 5000 });
    const lines = status.trim().split('\n').filter(l => l);
    if (lines.length === 0) {
      console.log('  ✅ 工作目录干净');
      return [];
    }
    console.log(`  📝 脏文件 ${lines.length} 个:`);
    for (const l of lines.slice(0, 15)) {
      console.log(`    ${l}`);
    }
    if (lines.length > 15) {
      console.log(`    ... 还有 ${lines.length - 15} 个`);
    }
    return lines;
  } catch (e) {
    console.log('  ⚠️  Git 状态不可用:', e.message.split('\n')[0]);
    return [];
  }
}

function archiveCandidate(item, dryRun) {
  const target = path.join(ARCHIVE, path.basename(item.file));
  if (!dryRun) {
    writeMarkdown(target, item.content);
    fs.unlinkSync(item.file);
  }
  upsertIndexEntry(target, item.title, 'archived by forget-cycle', dryRun);
  appendLog('forget', path.basename(item.file), dryRun);
  return target;
}

function main() {
  ensureBaseDirs();
  const opts = parseArgs();
  
  console.log('🧹 forget-cycle' + (opts.dryRun ? ' [DRY-RUN]' : '') + (opts.quick ? ' [QUICK]' : ''));
  console.log('');
  
  // 1. Git 状态（quick 模式下跳过）
  if (!opts.quick) {
    console.log('--- Git 状态 ---');
    gitStatusReport();
    console.log('');
  }
  
  // 2. 清理 99-temp 候选
  console.log('--- 99-temp 候选 ---');
  const tempResult = cleanTempCandidates(opts.dryRun);
  if (tempResult.pending.length === 0 && tempResult.moved.length === 0) {
    console.log('  (无待处理候选)');
  }
  console.log('');
  
  // 3. 清理 backup 文件
  console.log('--- 备份文件 ---');
  const backupResult = cleanBackupFiles(opts.dryRun);
  if (backupResult.deleted.length === 0) {
    console.log('  (无过期备份)');
  }
  console.log('');
  
  // 4. 04-facts 低信任归档（quick 模式下跳过）
  if (!opts.quick) {
    console.log('--- 04-facts 低信任归档 ---');
    const candidates = collectCandidates();
    const moved = [];
    for (const item of candidates) {
      moved.push(path.relative(ROOT, archiveCandidate(item, opts.dryRun)).replace(/\\\\/g, '/'));
    }
    if (moved.length === 0) {
      console.log('  (无低信任事实需要归档)');
    } else {
      for (const m of moved) {
        console.log(`  📦 ${opts.dryRun?'[DRY]':'[MOVE]'} ${m}`);
      }
    }
    console.log('');
  }
  
  // 5. 检查 disabled 文件（quick 模式下跳过）
  if (!opts.quick) {
    console.log('--- 已禁用脚本 ---');
    const disabled = checkDisabledFiles();
    if (disabled.length === 0) {
      console.log('  (无)');
    }
    console.log('');
  }
  
  console.log('✅ forget-cycle 完成');
}

main();
