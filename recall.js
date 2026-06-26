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
    if (lower.includes(lowerQ)) {
      // Extract title from frontmatter or H1
      const titleMatch = content.match(/^title:\s*(.+)$/m) || content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath);
      // Extract snippet around match
      const idx = lower.indexOf(lowerQ);
      const start = Math.max(0, idx - 50);
      const end = Math.min(content.length, idx + 100);
      const snippet = content.slice(start, end).replace(/\n+/g, ' ');
      return { file: filePath, title, snippet };
    }
  } catch (e) {}
  return null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { query: '', category: null, limit: 5, inject: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category') opts.category = args[++i];
    else if (args[i] === '--limit') opts.limit = parseInt(args[++i]);
    else if (args[i] === '--inject') opts.inject = true;
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
    console.log('Append to wiki/99-temp/missed-recall-' + new Date().toISOString().slice(0, 10) + '.md');
  }
}

// Main
const opts = parseArgs();
recall(opts);