// recall.js — Wiki 召回统一入口
// 用法：node recall.js <query> [--category user_pref|project|tool|knowledge|general] [--limit N] [--inject]
// 模式：
//   --inject  返回每轮 prompt 注入用的精简 INDEX (≤800 字)
//   正常模式 返回匹配的事实列表
//
// 依赖：Node.js 内置模块，无需安装

const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\ai_schedule\\hermes-brain';
const INDEX_FILE = path.join(ROOT, 'index.md');

function readInject() {
  // Read index.md and return its content (already ≤800 字 by design)
  if (!fs.existsSync(INDEX_FILE)) {
    console.error('INDEX.md not found:', INDEX_FILE);
    process.exit(1);
  }
  return fs.readFileSync(INDEX_FILE, 'utf8');
}

function listPages(category) {
  const wikiDir = path.join(ROOT, 'wiki', category);
  if (!fs.existsSync(wikiDir)) return [];
  return fs.readdirSync(wikiDir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(wikiDir, f));
}

function searchInFile(filePath, query) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lower = content.toLowerCase();
    const lowerQ = query.toLowerCase();

    // Direct match (fastest)
    if (lower.includes(lowerQ)) {
      return extractHit(filePath, content, lowerQ);
    }

    // Multi-word AND match: split query on space, all words must hit (anywhere)
    const words = query.split(/\s+/).filter(w => w.length >= 2);
    if (words.length >= 2) {
      const positions = [];
      for (const w of words) {
        const idx = lower.indexOf(w.toLowerCase());
        if (idx < 0) {
          positions.length = 0;
          break;
        }
        positions.push({ idx, word: w });
      }
      if (positions.length > 0) {
        // Use earliest position
        positions.sort((a, b) => a.idx - b.idx);
        return extractHit(filePath, content, positions[0].word);
      }
    }

    // Chinese bigram match: split query into 2-char substrings, match if ANY bigram found
    const chineseChars = (query.match(/[\u4e00-\u9fa5]/g) || []);
    if (chineseChars.length >= 2) {
      // Extract all bigrams
      const bigrams = [];
      for (let i = 0; i < chineseChars.length - 1; i++) {
        bigrams.push(chineseChars[i] + chineseChars[i + 1]);
      }
      // If query is 2 Chinese chars, also try the exact pair
      if (chineseChars.length === 2) {
        bigrams.push(query);
      }
      // Count how many bigrams hit
      let hitCount = 0;
      let firstHit = null;
      for (const bg of bigrams) {
        const idx = lower.indexOf(bg);
        if (idx >= 0) {
          hitCount++;
          if (!firstHit) firstHit = { idx, snippet: bg };
        }
      }
      // Require at least 1 bigram hit (relaxed from full match)
      if (hitCount > 0) {
        return extractHit(filePath, content, firstHit.snippet);
      }
    }

    // Single English word: also try word-boundary match (more precise)
    if (/^[a-z][a-z0-9_-]+$/i.test(query)) {
      const re = new RegExp('\\b' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      const m = re.exec(content);
      if (m) return extractHit(filePath, content, m[0]);
    }
  } catch (e) {}
  return null;
}

function extractHit(filePath, content, query) {
  const lower = content.toLowerCase();
  const titleMatch = content.match(/^title:\s*(.+)$/m) || content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath);
  const idx = lower.indexOf(query.toLowerCase());
  const start = Math.max(0, idx - 50);
  const end = Math.min(content.length, idx + 100);
  const snippet = content.slice(start, end).replace(/\n+/g, ' ');
  return { file: filePath, title, snippet };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { query: '', category: null, limit: 5, inject: false, rebuildIndex: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category') opts.category = args[++i];
    else if (args[i] === '--limit') opts.limit = parseInt(args[++i]);
    else if (args[i] === '--inject') opts.inject = true;
    else if (args[i] === '--rebuild-index') opts.rebuildIndex = true;
    else opts.query += (opts.query ? ' ' : '') + args[i];
  }
  return opts;
}

function recall(opts) {
  if (opts.inject) {
    console.log(readInject());
    return;
  }
  if (!opts.query) {
    console.error('Usage: node recall.js <query> [--category X] [--limit N] [--inject]');
    process.exit(1);
  }

  const categories = opts.category
    ? [opts.category]
    : ['00-core', '01-yang', '02-knowledge', '03-system', '04-facts'];

  let allHits = [];
  for (const cat of categories) {
    const files = listPages(cat);
    for (const f of files) {
      const hit = searchInFile(f, opts.query);
      if (hit) allHits.push({ category: cat, ...hit });
    }
  }

  // Sort by relevance (snippet position - earlier = more relevant)
  allHits.sort((a, b) => a.snippet.indexOf(opts.query) - b.snippet.indexOf(opts.query));
  const top = allHits.slice(0, opts.limit);

  console.log(`\n=== Recall: "${opts.query}" ===`);
  console.log(`Hits: ${top.length} of ${allHits.length} total\n`);

  for (const hit of top) {
    console.log(`[${hit.category}] ${hit.title}`);
    console.log(`  File: ${path.relative(ROOT, hit.file)}`);
    console.log(`  Snippet: ...${hit.snippet.trim()}...`);
    console.log('');
  }

  // Update retrieval_count in frontmatter (mock - real feedback is via fact_feedback)
  if (top.length === 0) {
    console.log('NO HITS. Consider creating a new wiki page for this query.');
    logMissedRecall(opts.query);
  }
}

// ===== v3.1.5 新增：召回失败自动记录 (missed-recall + RSI hook) =====
function logMissedRecall(query) {
  const today = new Date().toISOString().slice(0, 10);
  const missedFile = path.join(ROOT, 'wiki', '99-temp', `missed-recall-${today}.md`);

  // 1. 写入/追加 missed-recall-{date}.md
  let md = '';
  if (fs.existsSync(missedFile)) {
    md = fs.readFileSync(missedFile, 'utf8');
    if (!md.endsWith('\n')) md += '\n';
  } else {
    md = `# Missed Recall — ${today}\n\n> 由 \`recall.js\` 自动记录。每次召回失败时追加。\n\n`;
  }
  const time = new Date().toTimeString().slice(0, 8);
  md += `- \`${time}\` query="${query}"\n`;
  fs.writeFileSync(missedFile, md, 'utf8');
  console.log(`📝 Logged to: ${path.relative(ROOT, missedFile)}`);

  // 2. 每天第一次写入时,同步追加一条 RSI 到 rsi-ledger.md
  const rsiFile = path.join(ROOT, 'wiki', '03-system', 'rsi-ledger.md');
  const patternKey = `recall-missed-${today}`;
  if (fs.existsSync(rsiFile)) {
    const rsiContent = fs.readFileSync(rsiFile, 'utf8');
    if (!rsiContent.includes(patternKey)) {
      appendRsiEntry(rsiFile, today, patternKey, query);
      console.log(`📊 RSI entry added: ${patternKey}`);
    }
  }
}

function appendRsiEntry(rsiFile, date, patternKey, sampleQuery) {
  let content = fs.readFileSync(rsiFile, 'utf8');
  const entry = `
### ${date} {${patternKey}}

- **error**: Wiki 召回失败,query 无对应页面（样例: \`${sampleQuery.slice(0, 60)}\`）
- **root-cause**: Wiki 知识缺口 — 现有页面无法覆盖用户查询
- **fix**: review \`wiki/99-temp/missed-recall-${date}.md\` 看当天所有 query,如反复出现同样 query 集群 → 新建对应 wiki 页面
- **status**: monitoring
- **recurrence**: 见 missed-recall 文件计数
`;
  // 插到 "## 🔧 自动处理规则" 之前
  const marker = '## 🔧 自动处理规则';
  if (content.includes(marker)) {
    content = content.replace(marker, entry.trimStart() + '\n\n' + marker);
  } else {
    content += '\n' + entry;
  }
  fs.writeFileSync(rsiFile, content, 'utf8');
}

// ===== v3.0 F4 新增：INDEX 重建功能 =====
function rebuildIndex() {
  console.log('开始重建 INDEX.md...');
  
  const wikiDir = path.join(ROOT, 'wiki');
  const categories = ['00-core', '01-yang', '02-knowledge', '03-system', '04-facts', '99-temp'];
  
  let indexContent = `# Hermes Wiki INDEX\n\n> 自动生成 by recall.js --rebuild-index\n> 生成时间: ${new Date().toISOString()}\n\n`;
  indexContent += `> 警告: 本文件是自动生成的，不应手动修改。如需更新，重新运行 \`node recall.js --rebuild-index\`\n\n`;
  indexContent += `---\n\n`;
  
  let totalCount = 0;
  
  for (const cat of categories) {
    const catDir = path.join(wikiDir, cat);
    if (!fs.existsSync(catDir)) continue;
    
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));
    if (files.length === 0) continue;
    
    // Category header
    const catName = cat.replace(/-/g, ' ').replace(/^(\d)/, '$1. ');
    indexContent += `## ${catName} (${files.length})\n\n`;
    
    for (const f of files.sort()) {
      const fullPath = path.join(catDir, f);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Extract title from frontmatter or use filename
      const titleMatch = content.match(/^title:\s*(.+)$/m);
      const h1Match = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : (h1Match ? h1Match[1] : f.replace(/\.md$/, ''));
      
      // Extract brief description (first paragraph after frontmatter)
      const afterFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '').trim();
      const firstParaMatch = afterFrontmatter.match(/^(.+?)(?=\n|$)/);
      const description = firstParaMatch ? firstParaMatch[1].trim().slice(0, 60) + (firstParaMatch[1].length > 60 ? '...' : '') : '';
      
      // Create link
      const link = `[[wiki/${cat}/${f}]]`;
      totalCount++;
      
      indexContent += `- ${link} — ${title}: ${description}\n`;
    }
    
    indexContent += '\n';
  }
  
  // Footer
  indexContent += `---\n\n**总计**: ${totalCount} 个页面\n`;
  indexContent += `**最后更新**: ${new Date().toISOString().slice(0, 10)}\n`;
  
  // Write to index.md
  const indexPath = path.join(ROOT, 'index.md');
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  
  console.log(`✅ INDEX.md 已重建`);
  console.log(`   路径: ${indexPath}`);
  console.log(`   总页面数: ${totalCount}`);
  console.log(`   字节数: ${Buffer.byteLength(indexContent, 'utf8')}`);
}

// Main
const opts = parseArgs();

// Handle --rebuild-index mode
if (process.argv.includes('--rebuild-index')) {
  rebuildIndex();
  process.exit(0);
}

recall(opts);