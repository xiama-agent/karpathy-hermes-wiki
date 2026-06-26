// topic-validation.js — topic-detection 实体验证
// 用法：node topic-validation.js --wiki-ids "paths.md, tools-overview.md" --response "response content"
// 功能：验证回复内容是否真的引用了 wiki 页面

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const WIKI = path.join(ROOT, 'wiki');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { wikiIds: '', response: '', checkMode: 'content' };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--wiki-ids') {
      opts.wikiIds = args[++i] || '';
    } else if (args[i] === '--response') {
      opts.response = args[++i] || '';
    } else if (args[i] === '--check-mode') {
      opts.checkMode = args[++i] || 'content';
    }
  }
  
  return opts;
}

function findWikiFile(wikiId) {
  // 支持多种格式：paths.md, wiki/02-knowledge/paths.md, paths
  const cleanId = wikiId.replace(/^wiki\//, '').replace(/\.md$/, '');
  
  // 在 wiki 目录中搜索
  const searchDirs = ['00-core', '01-yang', '02-knowledge', '03-system', '04-facts', '99-temp'];
  
  for (const dir of searchDirs) {
    const fullPath = path.join(WIKI, dir, cleanId + '.md');
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
    
    // 也搜索目录本身
    const dirPath = path.join(WIKI, cleanId);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      return dirPath;
    }
  }
  
  return null;
}

function extractWikiContent(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return '';
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 移除 frontmatter
  const cleanContent = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
  
  return cleanContent;
}

function validateTopicReferences(wikiIds, response, checkMode = 'content') {
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    details: []
  };
  
  // 解析 wiki_ids
  const idList = wikiIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
  
  if (idList.length === 0) {
    results.valid = false;
    results.errors.push('topic-detection 中没有 wiki_ids');
    return results;
  }
  
  // 检查每个 wiki 页面是否存在
  const existingPages = {};
  for (const id of idList) {
    const filePath = findWikiFile(id);
    if (filePath) {
      existingPages[id] = {
        exists: true,
        path: filePath,
        content: extractWikiContent(filePath)
      };
    } else {
      existingPages[id] = { exists: false, path: null, content: '' };
      results.errors.push(`Wiki 页面不存在: ${id}`);
    }
  }
  
  // 内容验证
  if (checkMode === 'content') {
    for (const [id, pageInfo] of Object.entries(existingPages)) {
      if (!pageInfo.exists) continue;
      
      const wikiContent = pageInfo.content.toLowerCase();
      const responseLower = response.toLowerCase();
      
      // 检查回复中是否包含 wiki 内容的关键部分
      let hasContentMatch = false;
      let matchedSegments = [];
      
      // 提取 wiki 中的关键段落
      const wikiSegments = wikiContent.split(/[\n\r]+/).filter(s => s.trim().length > 20);
      
      for (const segment of wikiSegments) {
        const cleanSegment = segment.trim().substring(0, 100); // 取前100字符
        if (cleanSegment.length > 10 && responseLower.includes(cleanSegment.toLowerCase())) {
          hasContentMatch = true;
          matchedSegments.push(cleanSegment.substring(0, 50));
          break; // 找到一个匹配即可
        }
      }
      
      if (hasContentMatch) {
        results.details.push({
          wikiId: id,
          status: 'matched',
          segments: matchedSegments
        });
      } else {
        results.warnings.push(`可能未引用: ${id} - 回复中未发现明显内容匹配`);
        results.details.push({
          wikiId: id,
          status: 'no-match',
          segments: []
        });
      }
    }
  }
  
  // 至少要有一个有效的页面引用
  const validPages = Object.values(existingPages).filter(p => p.exists);
  if (validPages.length === 0) {
    results.valid = false;
    results.errors.push('所有引用的 wiki 页面都不存在');
  }
  
  return results;
}

function main() {
  const opts = parseArgs();
  
  if (opts.wikiIds === '') {
    console.log('用法:');
    console.log('  node topic-validation.js --wiki-ids "paths.md, tools-overview.md" --response "回复内容"');
    console.log('');
    console.log('示例:');
    console.log('  node topic-validation.js --wiki-ids "paths.md" --response "路径设置在 D:\ai_schedule\\"');
    console.log('');
    console.log('检查模式:');
    console.log('  content (默认) - 检查回复内容是否真的引用了 wiki');
    console.log('  existence - 只检查 wiki 页面是否存在');
    process.exit(1);
  }
  
  // 如果没有提供 response，只检查页面存在性
  if (opts.response === '') {
    opts.checkMode = 'existence';
  }
  
  const results = validateTopicReferences(opts.wikiIds, opts.response, opts.checkMode);
  
  console.log('🔍 Topic-Detection 验证结果:');
  console.log('');
  
  if (results.valid) {
    console.log('✅ 基本验证通过');
  } else {
    console.log('❌ 验证失败');
  }
  
  if (results.errors.length > 0) {
    console.log('\n🚨 错误:');
    results.errors.forEach(err => console.log(`  - ${err}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  警告:');
    results.warnings.forEach(warn => console.log(`  - ${warn}`));
  }
  
  if (results.details.length > 0 && opts.checkMode === 'content') {
    console.log('\n📋 详细匹配情况:');
    results.details.forEach(detail => {
      const statusIcon = detail.status === 'matched' ? '✅' : '❓';
      console.log(`  ${statusIcon} ${detail.wikiId}: ${detail.status}`);
    });
  }
  
  process.exit(results.valid && results.warnings.length === 0 ? 0 : 1);
}

main();
