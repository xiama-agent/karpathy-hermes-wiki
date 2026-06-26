// degraded-mode.js — INDEX 损坏时的降级路径
// 用法：node degraded-mode.js --check 或 --fallback
// 功能：INDEX 损坏时提供降级访问路径

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const WIKI = path.join(ROOT, 'wiki');
const INDEX_FILE = path.join(ROOT, 'index.md');

function checkSystemHealth() {
  console.log('🔍 系统健康检查...\n');
  
  const checks = {
    INDEX: { status: 'unknown', path: INDEX_FILE, exists: false, healthy: false },
    Wiki: { status: 'unknown', path: WIKI, exists: false, healthy: false },
    SOUL: { status: 'unknown', path: path.join('C:\Users\YANG\AppData\Local\hermes', 'SOUL.md'), exists: false, healthy: false },
    AGENTS: { status: 'unknown', path: path.join(ROOT, 'AGENTS.md'), exists: false, healthy: false },
    IRON_RULES: { status: 'unknown', path: path.join(ROOT, 'IRON_RULES.md'), exists: false, healthy: false }
  };
  
  // 检查 INDEX
  checks.INDEX.exists = fs.existsSync(INDEX_FILE);
  if (checks.INDEX.exists) {
    const content = fs.readFileSync(INDEX_FILE, 'utf8');
    checks.INDEX.healthy = content.length > 100 && content.includes('##');
    checks.INDEX.status = checks.INDEX.healthy ? 'healthy' : 'corrupted';
  } else {
    checks.INDEX.status = 'missing';
  }
  
  // 检查 Wiki
  checks.Wiki.exists = fs.existsSync(WIKI);
  if (checks.Wiki.exists) {
    const categories = ['00-core', '01-yang', '02-knowledge', '03-system', '04-facts'];
    const existingCats = categories.filter(cat => fs.existsSync(path.join(WIKI, cat)));
    checks.Wiki.healthy = existingCats.length >= 3;
    checks.Wiki.status = checks.Wiki.healthy ? 'healthy' : 'partial';
    checks.Wiki.categories = existingCats;
  } else {
    checks.Wiki.status = 'missing';
  }
  
  // 检查核心文件
  for (const key of ['SOUL', 'AGENTS', 'IRON_RULES']) {
    checks[key].exists = fs.existsSync(checks[key].path);
    if (checks[key].exists) {
      const content = fs.readFileSync(checks[key].path, 'utf8');
      checks[key].healthy = content.length > 50;
      checks[key].status = checks[key].healthy ? 'healthy' : 'corrupted';
    } else {
      checks[key].status = 'missing';
    }
  }
  
  return checks;
}

function determineDegradationLevel(checks) {
  if (checks.INDEX.status === 'healthy' && checks.Wiki.status === 'healthy') {
    return { level: 0, mode: 'normal', description: '系统正常' };
  }
  
  if (checks.INDEX.status !== 'healthy' && checks.Wiki.status === 'healthy') {
    return { level: 1, mode: 'wiki-direct', description: 'INDEX 不可用，使用 Wiki 直接访问' };
  }
  
  if (checks.Wiki.status !== 'healthy' && (checks.SOUL.status === 'healthy' || checks.AGENTS.status === 'healthy')) {
    return { level: 2, mode: 'core-only', description: 'Wiki 损坏，使用核心配置文件' };
  }
  
  return { level: 3, mode: 'emergency', description: '严重损坏，紧急模式' };
}

function generateFallbackIndex() {
  console.log('🔄 生成降级 INDEX...\n');
  
  const categories = ['00-core', '01-yang', '02-knowledge', '03-system', '04-facts'];
  let indexContent = `# 降级模式 INDEX\n\n> 自动生成 by degraded-mode.js\n> 生成时间: ${new Date().toISOString()}\n> 模式: LEVEL 1 (Wiki 直接访问)\n\n---\n\n`;
  
  for (const cat of categories) {
    const catPath = path.join(WIKI, cat);
    if (!fs.existsSync(catPath)) continue;
    
    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.md'));
    if (files.length === 0) continue;
    
    const catName = cat.replace(/-/g, ' ');
    indexContent += `## ${catName} (${files.length})\n\n`;
    
    for (const file of files.sort()) {
      const fullPath = path.join(catPath, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      const titleMatch = content.match(/^title:\s*(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : file.replace(/\.md$/, '');
      
      indexContent += `- [[wiki/${cat}/${file}]] — ${title}\n`;
    }
    
    indexContent += '\n';
  }
  
  indexContent += `---\n\n**注意**: 这是降级模式生成的 INDEX，可能不完整。\n`;
  indexContent += `建议运行: \`node recall.js --rebuild-index\` 重建完整 INDEX。\n`;
  
  try {
    fs.writeFileSync(INDEX_FILE, indexContent, 'utf8');
    console.log('✅ 降级 INDEX 已生成');
    console.log(`   文件: ${INDEX_FILE}`);
    console.log(`   页面数: ${indexContent.split('---').length - 2}`);
    return true;
  } catch (e) {
    console.log('❌ 降级 INDEX 生成失败:', e.message);
    return false;
  }
}

function generateCoreKnowledge() {
  console.log('📋 生成核心知识摘要...\n');
  
  const coreInfo = {
    identity: [],
    capabilities: [],
    paths: [],
    tools: []
  };
  
  // 尝试从 SOUL.md 提取
  const soulPath = 'C:\Users\YANG\AppData\Local\hermes\SOUL.md';
  if (fs.existsSync(soulPath)) {
    const soulContent = fs.readFileSync(soulPath, 'utf8');
    const identityMatch = soulContent.match(/你是\s*([^,，]+)/);
    if (identityMatch) coreInfo.identity.push('我是' + identityMatch[1]);
    
    const capabilityMatch = soulContent.match(/核心.*：([\s\S]*?)(?=\n\n|\n\*\*|$)/);
    if (capabilityMatch) {
      const caps = capabilityMatch[1].split('|').map(c => c.trim());
      coreInfo.capabilities.push(...caps.slice(0, 3));
    }
  }
  
  // 尝试从 IRON_RULES.md 提取
  const ironPath = path.join(ROOT, 'IRON_RULES.md');
  if (fs.existsSync(ironPath)) {
    const ironContent = fs.readFileSync(ironPath, 'utf8');
    const rules = ironContent.match(/^\d+\.\s+(.+)$/gm);
    if (rules) coreInfo.paths.push(...rules.slice(0, 3));
  }
  
  console.log('📝 核心信息:');
  console.log('   身份:', coreInfo.identity.join(', ') || '未知');
  console.log('   能力:', coreInfo.capabilities.slice(0, 2).join(', ') || '基础功能');
  console.log('   规则:', coreInfo.paths.length + ' 条铁律');
  
  return coreInfo;
}

function handleDegradedMode(level) {
  console.log(`⚠️  降级模式 LEVEL ${level} 已激活\n`);
  
  switch (level) {
    case 1: // Wiki 直接访问
      console.log('🔄 生成降级 INDEX...');
      generateFallbackIndex();
      console.log('📚 当前模式: 可以直接访问 Wiki 文件');
      console.log('🔍 建议: 运行 `node recall.js --rebuild-index` 恢复');
      break;
      
    case 2: // 核心文件模式
      console.log('📚 当前模式: 仅核心配置可用');
      const coreInfo = generateCoreKnowledge();
      console.log('🔍 建议: 检查 Wiki 目录完整性');
      console.log('🚨 重要: 知识库功能受限');
      break;
      
    case 3: // 紧急模式
      console.log('🚨 紧急模式: 系统严重损坏');
      console.log('🔧 建议: 从备份恢复');
      console.log('💾 备份位置: D:\ai_schedule\backup\');
      break;
  }
}

function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--check';
  
  if (mode === '--check') {
    const checks = checkSystemHealth();
    const degradation = determineDegradationLevel(checks);
    
    console.log('📊 系统状态:');
    console.log(`   INDEX: ${checks.INDEX.status} ${checks.INDEX.healthy ? '✅' : '❌'}`);
    console.log(`   Wiki: ${checks.Wiki.status} ${checks.Wiki.healthy ? '✅' : '❌'}`);
    console.log(`   SOUL: ${checks.SOUL.status} ${checks.SOUL.healthy ? '✅' : '❌'}`);
    console.log(`   AGENTS: ${checks.AGENTS.status} ${checks.AGENTS.healthy ? '✅' : '❌'}`);
    console.log(`   IRON_RULES: ${checks.IRON_RULES.status} ${checks.IRON_RULES.healthy ? '✅' : '❌'}`);
    console.log('');
    
    console.log('🎯 系统状态:', degradation.description);
    console.log('   降级级别:', degradation.level);
    console.log('   当前模式:', degradation.mode);
    
    if (degradation.level > 0) {
      console.log('');
      handleDegradedMode(degradation.level);
    } else {
      console.log('✅ 系统运行正常');
    }
    
  } else if (mode === '--fallback') {
    const checks = checkSystemHealth();
    const degradation = determineDegradationLevel(checks);
    
    handleDegradedMode(degradation.level);
    
    process.exit(degradation.level);
  } else {
    console.log('用法:');
    console.log('  node degraded-mode.js --check     # 检查系统状态');
    console.log('  node degraded-mode.js --fallback   # 启动降级模式');
    console.log('');
    console.log('降级级别:');
    console.log('  0 - 正常模式');
    console.log('  1 - Wiki 直接访问 (INDEX 不可用)');
    console.log('  2 - 核心文件模式 (Wiki 损坏)');
    console.log('  3 - 紧急模式 (严重损坏)');
    process.exit(1);
  }
}

main();
