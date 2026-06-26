// mavis-staging.js — Mavis 写入审批流程
// 用法：node mavis-staging.js --action "submit|approve|reject" --file "wiki/02-knowledge/paths.md"
// 功能：Mavis 写入走 staging，审批后才 merge 到正式目录

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const STAGING_DIR = path.join(ROOT, 'wiki', 'staging', 'mavis');
const APPROVAL_LOG = path.join(ROOT, 'wiki', '99-temp', 'mavis-approval-log.md');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { action: '', file: '', reason: '', force: false };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--action') {
      opts.action = args[++i] || '';
    } else if (args[i] === '--file') {
      opts.file = args[++i] || '';
    } else if (args[i] === '--reason') {
      opts.reason = args[++i] || '';
    } else if (args[i] === '--force') {
      opts.force = true;
    }
  }
  
  return opts;
}

function generateStagingId() {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:-T]/g, '');
  return `mavis-${timestamp}`;
}

function submitToStaging(file, content, agent = 'mavis') {
  const stagingId = generateStagingId();
  const stagingPath = path.join(STAGING_DIR, `${stagingId}.md`);
  
  if (!fs.existsSync(STAGING_DIR)) {
    fs.mkdirSync(STAGING_DIR, { recursive: true });
  }
  
  // 创建 staging 文件，包含元信息
  const stagingContent = `---
staging_id: ${stagingId}
target_file: ${file}
submitted_by: ${agent}
submitted_at: ${new Date().toISOString()}
status: pending
---

# Mavis 提交的修改 - ${stagingId}

**目标文件**: ${file}
**提交时间**: ${new Date().toISOString().toLocaleString()}
**状态**: 等待审批

## 修改内容

${content}

## 元信息

- **提交者**: ${agent}
- **提交原因**: ${''}
- **文件哈希**: ${Date.now()}
`;

  fs.writeFileSync(stagingPath, stagingContent, 'utf8');
  
  console.log('✅ Mavis 提交已保存到 staging:');
  console.log(`   Staging ID: ${stagingId}`);
  console.log(`   文件路径: ${stagingPath}`);
  console.log(`   目标文件: ${file}`);
  
  return stagingId;
}

function approveStaging(stagingId, reason = '') {
  const stagingFile = path.join(STAGING_DIR, `${stagingId}.md`);
  
  if (!fs.existsSync(stagingFile)) {
    console.error('❌ Staging 文件不存在:', stagingFile);
    return false;
  }
  
  const content = fs.readFileSync(stagingFile, 'utf8');
  const targetFileMatch = content.match(/^target_file:\s*(.+)$/m);
  
  if (!targetFileMatch) {
    console.error('❌ 找不到目标文件信息');
    return false;
  }
  
  const targetFile = targetFileMatch[1].trim();
  const contentSectionMatch = content.match(/## 修改内容\s*\n([\s\S]*?)(?=##|\Z)/);
  
  if (!contentSectionMatch) {
    console.error('❌ 找不到修改内容');
    return false;
  }
  
  const newContent = contentSectionMatch[1].trim();
  
  // 写入到目标文件
  const targetPath = path.isAbsolute(targetFile) ? targetFile : path.join(ROOT, targetFile);
  
  // 确保目标目录存在
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // 写入时使用 write-guard
  const { execSync } = require('child_process');
  try {
    const guardCmd = `node write-guard.js --file "${targetFile}" --content "${newContent.replace(/\n/g, '\n')}" --agent "hermes"`;
    execSync(guardCmd, { cwd: ROOT, stdio: 'inherit' });
    
    // 更新 staging 状态
    const updatedContent = content.replace(/status: pending/, 'status: approved');
    fs.writeFileSync(stagingFile, updatedContent, 'utf8');
    
    console.log('✅ Staging 提交已批准并合并');
    console.log(`   目标文件: ${targetFile}`);
    
    // 记录到审批日志
    logApproval(stagingId, 'approved', reason);
    
    return true;
  } catch (e) {
    console.error('❌ 合并失败:', e.message);
    return false;
  }
}

function rejectStaging(stagingId, reason) {
  const stagingFile = path.join(STAGING_DIR, `${stagingId}.md`);
  
  if (!fs.existsSync(stagingFile)) {
    console.error('❌ Staging 文件不存在:', stagingFile);
    return false;
  }
  
  // 更新 staging 状态
  const content = fs.readFileSync(stagingFile, 'utf8');
  const updatedContent = content.replace(/status: pending/, 'status: rejected');
  fs.writeFileSync(stagingFile, updatedContent, 'utf8');
  
  console.log('✅ Staging 提交已拒绝');
  console.log(`   Staging ID: ${stagingId}`);
  console.log(`   拒绝原因: ${reason}`);
  
  // 记录到审批日志
  logApproval(stagingId, 'rejected', reason);
  
  return true;
}

function listPendingApprovals() {
  if (!fs.existsSync(STAGING_DIR)) {
    console.log('📋 没有 pending 的 staging 提交');
    return;
  }
  
  const files = fs.readdirSync(STAGING_DIR).filter(f => f.endsWith('.md'));
  
  if (files.length === 0) {
    console.log('📋 Staging 目录为空');
    return;
  }
  
  console.log('📋 待审批的 Staging 提交:\n');
  
  for (const file of files) {
    const stagingFile = path.join(STAGING_DIR, file);
    const content = fs.readFileSync(stagingFile, 'utf8');
    
    const stagingId = file.replace('.md', '');
    const targetFileMatch = content.match(/^target_file:\s*(.+)$/m);
    const statusMatch = content.match(/^status:\s*(.+)$/m);
    const submittedAtMatch = content.match(/^submitted_at:\s*(.+)$/m);
    
    const targetFile = targetFileMatch ? targetFileMatch[1].trim() : 'unknown';
    const status = statusMatch ? statusMatch[1].trim() : 'unknown';
    const submittedAt = submittedAtMatch ? submittedAtMatch[1].trim() : 'unknown';
    
    const statusIcon = status === 'pending' ? '⏳' : (status === 'approved' ? '✅' : '❌');
    
    console.log(`${statusIcon} ${stagingId}`);
    console.log(`   目标: ${targetFile}`);
    console.log(`   状态: ${status}`);
    console.log(`   提交时间: ${submittedAt}`);
    console.log('');
  }
}

function logApproval(stagingId, status, reason = '') {
  const now = new Date().toISOString().slice(0, 10);
  let content = '';
  
  if (fs.existsSync(APPROVAL_LOG)) {
    content = fs.readFileSync(APPROVAL_LOG, 'utf8');
    if (!content.endsWith('\n')) content += '\n';
  } else {
    const dir = path.dirname(APPROVAL_LOG);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    content = `# Mavis 审批日志\n\n> 自动生成 by mavis-staging.js\n\n`;
  }
  
  const statusIcon = status === 'approved' ? '✅' : '❌';
  const entry = `
## ${now} ${statusIcon} ${stagingId}

- **状态**: ${status}
- **理由**: ${reason || '无'}
- **时间**: ${new Date().toISOString()}
`;
  
  content += entry;
  fs.writeFileSync(APPROVAL_LOG, content, 'utf8');
}

function main() {
  const opts = parseArgs();
  
  if (opts.action === '') {
    console.log('用法:');
    console.log('  node mavis-staging.js --action submit --file "wiki/02-knowledge/paths.md"');
    console.log('  node mavis-staging.js --action approve --id "mavis-20260626..."');
    console.log('  node mavis-staging.js --action reject --id "mavis-20260626..." --reason "原因"');
    console.log('  node mavis-staging.js --action list');
    process.exit(1);
  }
  
  if (opts.action === 'list') {
    listPendingApprovals();
  } else if (opts.action === 'submit') {
    const file = opts.file;
    if (file === '') {
      console.error('❌ 请指定目标文件: --file "wiki/xx.md"');
      process.exit(1);
    }
    
    // 这里简化处理，实际应该读取待提交的内容
    const content = '示例内容 - 实际应从 Mavis 输出获取';
    submitToStaging(file, content);
  } else if (opts.action === 'approve') {
    const stagingId = opts.file; // 这里复用 file 参数作为 stagingId
    if (stagingId === '') {
      console.error('❌ 请指定 staging ID: --id "mavis-xxx"');
      process.exit(1);
    }
    
    approveStaging(stagingId, opts.reason);
  } else if (opts.action === 'reject') {
    const stagingId = opts.file;
    if (stagingId === '') {
      console.error('❌ 请指定 staging ID: --id "mavis-xxx"');
      process.exit(1);
    }
    
    rejectStaging(stagingId, opts.reason || '未提供理由');
  } else {
    console.error('❌ 未知的操作:', opts.action);
    process.exit(1);
  }
}

main();
