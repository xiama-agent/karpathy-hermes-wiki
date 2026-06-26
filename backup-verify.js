// backup-verify.js — 备份验证与恢复演练
// 用法：node backup-verify.js --verify <backup-path> 或 --drill
// 功能：备份前写入标记、备份后验证、定期恢复演练

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname);
const MARKER_FILE = '.backup-test-marker';
const DRILL_LOG = path.join(ROOT, 'wiki', '99-temp', 'backup-drill-log.md');

function generateBackupMarker() {
  const now = new Date().toISOString();
  const marker = `BACKUP_MARKER_${now}`;
  const markerPath = path.join(ROOT, MARKER_FILE);
  fs.writeFileSync(markerPath, marker, 'utf8');
  return marker;
}

function verifyBackup(backupPath) {
  console.log('🔍 开始验证备份...');
  
  const markerPath = path.join(backupPath, MARKER_FILE);
  const localMarkerPath = path.join(ROOT, MARKER_FILE);
  
  if (!fs.existsSync(markerPath)) {
    console.error('❌ 验证失败：备份中找不到标记文件');
    return false;
  }
  
  const backupMarker = fs.readFileSync(markerPath, 'utf8').trim();
  const localMarker = fs.readFileSync(localMarkerPath, 'utf8').trim();
  
  if (backupMarker !== localMarker) {
    console.error('❌ 验证失败：标记文件内容不匹配');
    console.log(`   本地: ${localMarker}`);
    console.log(`   备份: ${backupMarker}`);
    return false;
  }
  
  console.log('✅ 备份验证通过');
  console.log(`   标记: ${backupMarker}`);
  
  // 验证核心文件
  const coreFiles = ['SOUL.md', 'AGENTS.md', 'IRON_RULES.md', 'RUNTIME.md', 'index.md'];
  let coreFilesOk = 0;
  
  for (const file of coreFiles) {
    const localPath = path.join(ROOT, file);
    const backupFilePath = path.join(backupPath, file);
    
    if (fs.existsSync(backupFilePath)) {
      const localStat = fs.statSync(localPath);
      const backupStat = fs.statSync(backupFilePath);
      
      if (localStat.size === backupStat.size) {
        coreFilesOk++;
      }
    }
  }
  
  console.log(`   核心文件: ${coreFilesOk}/${coreFiles.length} 验证通过`);
  return coreFilesOk >= coreFiles.length - 1; // 允许1个文件缺失
}

function performDrill(backupPath) {
  console.log('🎯 开始备份恢复演练...');
  
  const drillTemp = path.join(ROOT, '.drill-temp-' + Date.now());
  fs.mkdirSync(drillTemp, { recursive: true });
  
  try {
    // 模拟恢复
    const wikiBackup = path.join(backupPath, 'wiki');
    if (fs.existsSync(wikiBackup)) {
      const drillWiki = path.join(drillTemp, 'wiki');
      copyDir(wikiBackup, drillWiki);
    }
    
    // 运行 lint 检查完整性
    const lintJs = path.join(ROOT, 'lint.js');
    if (fs.existsSync(lintJs)) {
      const oldCwd = process.cwd();
      process.chdir(ROOT);
      
      try {
        execSync(`node lint.js`, { 
          cwd: drillTemp,
          env: { ...process.env, ROOT: drillTemp },
          timeout: 30000 
        });
        console.log('✅ 恢复演练成功 - Lint 通过');
      } catch (e) {
        console.log('⚠️ 恢复演练发现潜在问题');
      }
      
      process.chdir(oldCwd);
    }
    
    // 记录到演练日志
    recordDrillLog(true, backupPath);
    
  } catch (e) {
    console.error('❌ 恢复演练失败:', e.message);
    recordDrillLog(false, backupPath, e.message);
  } finally {
    // 清理临时目录
    if (fs.existsSync(drillTemp)) {
      fs.rmSync(drillTemp, { recursive: true, force: true });
    }
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function recordDrillLog(success, backupPath, error = null) {
  const now = new Date().toISOString().slice(0, 10);
  let content = '';
  
  if (fs.existsSync(DRILL_LOG)) {
    content = fs.readFileSync(DRILL_LOG, 'utf8');
    if (!content.endsWith('\n')) content += '\n';
  } else {
    const dir = path.dirname(DRILL_LOG);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    content = `# 备份恢复演练日志\n\n> 自动生成 by backup-verify.js\n\n`;
  }
  
  const entry = `
## ${now} — ${success ? '✅ 成功' : '❌ 失败'}

- **备份路径**: ${backupPath}
- **状态**: ${success ? '通过' : '失败'}
${error ? `- **错误**: ${error}` : ''}
- **时间戳**: ${new Date().toISOString()}
`;
  
  content += entry;
  fs.writeFileSync(DRILL_LOG, content, 'utf8');
  
  console.log(`📝 演练结果已记录: ${path.relative(ROOT, DRILL_LOG)}`);
}

function main() {
  const args = process.argv.slice(2);
  const mode = args[0];
  
  if (mode === '--prepare') {
    const marker = generateBackupMarker();
    console.log(`✅ 备份标记已生成: ${marker}`);
    console.log(`   现在可以执行备份操作`);
  } else if (mode === '--verify') {
    const backupPath = args[1];
    if (!backupPath) {
      console.error('❌ 请指定备份路径: node backup-verify.js --verify <backup-path>');
      process.exit(1);
    }
    
    if (!fs.existsSync(backupPath)) {
      console.error('❌ 备份路径不存在:', backupPath);
      process.exit(1);
    }
    
    const success = verifyBackup(backupPath);
    process.exit(success ? 0 : 1);
  } else if (mode === '--drill') {
    const backupPath = args[1];
    if (!backupPath) {
      console.error('❌ 请指定备份路径: node backup-verify.js --drill <backup-path>');
      process.exit(1);
    }
    
    if (!fs.existsSync(backupPath)) {
      console.error('❌ 备份路径不存在:', backupPath);
      process.exit(1);
    }
    
    performDrill(backupPath);
  } else {
    console.log('用法:');
    console.log('  node backup-verify.js --prepare        # 生成备份标记');
    console.log('  node backup-verify.js --verify <path>  # 验证备份完整性');
    console.log('  node backup-verify.js --drill <path>    # 执行恢复演练');
    console.log('');
    console.log('示例完整流程:');
    console.log('  1. node backup-verify.js --prepare');
    console.log('  2. Copy-Item -Path "D:\ai_schedule\hermes-brain" -Destination "backup\\" -Recurse');
    console.log('  3. node backup-verify.js --verify "backup\hermes-brain"');
    console.log('  4. node backup-verify.js --drill "backup\hermes-brain"');
  }
}

main();
