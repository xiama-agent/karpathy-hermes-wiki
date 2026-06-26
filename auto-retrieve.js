'use strict';

const path = require('path');
const {
  ROOT,
  listWikiPages,
  readMarkdown,
  parseFrontmatter,
  summarizeText
} = require('./wiki-utils');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { query: '', limit: 3, format: 'json' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--query') opts.query = args[++i] || '';
    else if (args[i] === '--limit') opts.limit = parseInt(args[++i], 10) || 3;
    else if (args[i] === '--format') opts.format = args[++i] || 'json';
  }
  return opts;
}

function scoreContent(content, query) {
  const lower = content.toLowerCase();
  const lowerQ = query.toLowerCase();
  let score = 0;
  if (lower.includes(lowerQ)) score += 10;

  const words = query.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (word.length < 2) continue;
    if (lower.includes(word.toLowerCase())) score += 3;
  }

  const zh = query.match(/[\u4e00-\u9fa5]/g) || [];
  for (let i = 0; i < zh.length - 1; i++) {
    if (lower.includes(zh[i] + zh[i + 1])) score += 2;
  }

  const titleMatch = content.match(/^title:\s*(.+)$/m) || content.match(/^#\s+(.+)$/m);
  if (titleMatch && titleMatch[1].toLowerCase().includes(lowerQ)) score += 5;
  return score;
}

function extractSnippet(content, query) {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx < 0) return summarizeText(content, 140);
  const start = Math.max(0, idx - 60);
  const end = Math.min(content.length, idx + 120);
  return content.slice(start, end).replace(/\s+/g, ' ').trim();
}

function search(query, limit) {
  const hits = [];
  for (const file of listWikiPages()) {
    const content = readMarkdown(file);
    const score = scoreContent(content, query);
    if (score <= 0) continue;
    const parsed = parseFrontmatter(content);
    const title = parsed.data && parsed.data.title ? parsed.data.title : path.basename(file, '.md');
    hits.push({
      page: path.relative(ROOT, file).replace(/\\/g, '/'),
      title,
      snippet: extractSnippet(content, query),
      score
    });
  }

  hits.sort((a, b) => b.score - a.score || a.page.localeCompare(b.page));
  return hits.slice(0, limit);
}

function main() {
  const opts = parseArgs();
  if (!opts.query) {
    console.error('Usage: node auto-retrieve.js --query "..." [--limit 3] [--format json]');
    process.exit(1);
  }

  const payload = { query: opts.query, results: search(opts.query, opts.limit) };
  if (opts.format === 'json') {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  for (const item of payload.results) {
    console.log(`${item.page}\t${item.title}\t${item.score}`);
    console.log(`  ${item.snippet}`);
  }
}

main();
