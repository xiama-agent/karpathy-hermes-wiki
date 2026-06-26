// write-guard.js — 写入冲突检测和防护
// 用法：node write-guard.js --file "wiki/02-knowledge/paths.md" --content "new content" --agent "hermes"
// 功能：检测并发写入冲突，防止多智能体覆盖

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname);
const LOCK_DIR = path.join(ROOT, '.locks');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { file: '', content: '', agent: 'unknown', mode: 'check' };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file') {
      opts.file = args[++i] || '';
    } else if (args[i] === '--content') {
      opts.content = args[++i] || '';
    } else if (args[i] === '--agent') {
      opts.agent = args[++i] || 'unknown';
    } else if (args[i] === '--mode') {
      opts.mode = args[++i] || 'check';
    }
  }
  
  return opts;
}

function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) {
    return 'null';
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

function getLockFilePath(filePath) {
  const relativePath = path.relative(ROOT, filePath).replace(/[\/\]/g, '_');
  return path.join(LOCK_DIR, relativePath + '.lock');
}

function acquireLock(filePath, agent) {
  if (!fs.existsSync(LOCK_DIR)) {
    fs.mkdirSync(LOCK_DIR, { recursive: true });
  }
  
  const lockFile = getLockFilePath(filePath);
  
  // 检查是否已有锁
  if (fs.existsSync(lockFile)) {
    try {
      const lockData = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
      const lockTime = new Date(lockData.timestamp);
      const now = new Date();
      const age = (now - lockTime) / 1000; // 秒
      
      // 锁超过5分钟视为过期
      if (age > 300) {
        console.log(`⏰ 锁已过期 (${age.toFixed(0)}秒)，自动清理`);
        fs.unlinkSync(lockFile);
      } else {
        return {
          success: false,
          lockedBy: lockData.agent,
          lockedAt: lockTime,
          reason: 'file_locked'
        };
      }
    } catch (e) {
      // 锁文件损坏，删除重试
      fs.unlinkSync(lockFile);
    }
  }
  
  // 创建新锁
  const lockData = {
    agent: agent,
    timestamp: new Date().toISOString(),
    fileHash: getFileHash(filePath)
  };
  
  try {
    fs.writeFileSync(lockFile, JSON.stringify(lockData, null, 2), 'utf8');
    return {
      success: true,
      lockFile: lockFile
    };
  } catch (e) {
    return {
      success: false,
      reason: 'lock_failed',
      error: e.message
    };
  }
}

function releaseLock(lockFile) {
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
    return true;
  }
  return false;
}

function detectConflict(filePath, content) {
  const result = {
    hasConflict: false,
    conflictType: null,
    currentHash: null,
    expectedHash: null,
    message: ''
  };
  
  if (!fs.existsSync(filePath)) {
    result.message = '文件不存在，可以创建';
    return result;
  }
  
  const currentContent = fs.readFileSync(filePath, 'utf8');
  const currentHash = getFileHash(filePath);
  result.currentHash = currentHash;
  
  // 检查 frontmatter 中的 last_updated 是否变化
  const updatedMatch = content.match(/^last_updated:\s*(.+)$/m);
  if (updatedMatch) {
    const currentUpdatedMatch = currentContent.match(/^last_updated:\s*(.+)$/m);
    if (currentUpdatedMatch) {
      const newUpdated = new Date(updatedMatch[1]);
      const currentUpdated = new Date(currentUpdatedMatch[1]);
      
      // 如果新的更新时间早于当前更新时间，可能是冲突
      if (newUpdated < currentUpdated) {
        result.hasConflict = true;
        result.conflictType = 'timestamp_conflict';
        result.message = `更新时间冲突: 新=${updatedMatch[1]}, 当前=${currentUpdatedMatch[1]}`;
        return result;
      }
    }
  }
  
  result.message = '无冲突检测到';
  return result;
}

function performWriteGuarded(filePath, content, agent) {
  console.log(`🔒 写入防护检查 - Agent: ${agent}`);
  console.log(`   文件: ${filePath}`);
  
  // 获取锁
  const lockResult = acquireLock(filePath, agent);
  
  if (!lockResult.success) {
    console.log('❌ 锁获取失败:');
    
    if (lockResult.reason === 'file_locked') {
      console.log(`   已被锁定: ${lockResult.lockedBy}`);
      console.log(`   锁定时间: ${lockResult.lockedAt.toISOString()}`);
    } else {
      console.log(`   原因: ${lockResult.reason}`);
      if (lockResult.error) {
        console.log(`   错误: ${lockResult.error}`);
      }
    }
    
    return { success: false, reason: lockResult.reason };
  }
  
  console.log('✅ 锁获取成功');
  
  try {
    // 冲突检测
    const conflictResult = detectConflict(filePath, content);
    
    if (conflictResult.hasConflict) {
      console.log('⚠️ 检测到冲突:');
      console.log(`   类型: ${conflictResult.conflictType}`);
      console.log(`   详情: ${conflictResult.message}`);
      
      // 释放锁
      releaseLock(lockResult.lockFile);
      
      return { success: false, reason: 'conflict_detected', conflict: conflictResult };
    }
    
    // 执行写入
    const backupPath = filePath + '.backup-' + Date.now();
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log('✅ 写入成功');
    console.log(`   备份: ${backupPath}`);
    
    // 释放锁
    releaseLock(lockResult.lockFile);
    
    return { 
      success: true, 
      backup: backupPath,
      conflictCheck: conflictResult.message
    };
    
  } catch (e) {
    console.log('❌ 写入失败:', e.message);
    
    // 释放锁
    if (lockResult.lockFile) {
      releaseLock(lockResult.lockFile);
    }
    
    return { success: false, reason: 'write_failed', error: e.message };
  }
}

function main() {
  const opts = parseArgs();
  
  if (opts.file === '') {
    console.log('用法:');
    console.log('  node write-guard.js --file "wiki/02-knowledge/paths.md" --content "内容" --agent "hermes"');
    console.log('');
    console.log('检查模式: node write-guard.js --file "wiki/02-knowledge/paths.md" --mode check');
    console.log('');
    console.log('模式说明:');
    console.log('  write - 执行写入 (默认)');
    console.log('  check - 只检查冲突，不写入');
    process.exit(1);
  }
  
  const filePath = path.isAbsolute(opts.file) ? opts.file : path.join(ROOT, opts.file);
  
  if (opts.mode === 'check') {
    const conflictResult = detectConflict(filePath, '');
    console.log('🔍 冲突检测结果:');
    console.log(`   状态: ${conflictResult.hasConflict ? '⚠️ 冲突' : '✅ 无冲突'}`);
    console.log(`   详情: ${conflictResult.message}`);
    if (conflictResult.currentHash) {
      console.log(`   当前文件哈希: ${conflictResult.currentHash}`);
    }
    process.exit(0);
  }
  
  const result = performWriteGuarded(filePath, opts.content, opts.agent);
  
  if (result.success) {
    console.log('');
    console.log('🎉 写入操作完成');
  } else {
    console.log('');
    console.log('❌ 写入操作被阻止');
    process.exit(1);
  }
}

main();
