'use strict';

const fs = require('fs');
const path = require('path');
const {
  ROOT,
  INDEX_FILE,
  listWikiPages,
  readMarkdown,
  parseFrontmatter,
  summarizeText,
  getLocalDateString
} = require('./wiki-utils');

const FRESHNESS_FILE = path.join(ROOT, 'freshness.json');

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

function loadFreshness() {
  if (!fs.existsSync(FRESHNESS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(FRESHNESS_FILE, 'utf8'));
  } catch (_) {
    return {};
  }
}

function loadIndexText() {
  if (!fs.existsSync(INDEX_FILE)) return '';
  return fs.readFileSync(INDEX_FILE, 'utf8');
}

function extractRelatedLinks(content) {
  const match = content.match(/^## 相关链接\s*\n([\s\S]*?)(?:\n## |$)/m);
  if (!match) return [];
  return match[1]
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('- [['))
    .map(line => line.replace(/^-\s+/, ''));
}

function extractLead(body) {
  const lines = body.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  for (const line of lines) {
    if (!line.startsWith('#') && !line.startsWith('##')) return line;
  }
  return summarizeText(body, 140);
}

function computeFreshnessScore(lastUpdated) {
  if (!lastUpdated) return 0.5;
  const updated = new Date(lastUpdated);
  if (Number.isNaN(updated.getTime())) return 0.5;
  const now = new Date(`${getLocalDateString()}T00:00:00`);
  const days = Math.max(0, Math.floor((now - updated) / (24 * 60 * 60 * 1000)));
  return Math.max(0, 1 - days / 90);
}

function scoreContent(content, query, metadata, freshnessScore, indexText) {
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

  const title = metadata.title || '';
  if (title.toLowerCase().includes(lowerQ)) score += 5;
  if (indexText.toLowerCase().includes(path.basename(metadata.page || '').toLowerCase())) score += 1;
  score += Math.round((Number(metadata.trust || 0.3) || 0.3) * 10);
  score += Math.round(freshnessScore * 5);
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
  const freshness = loadFreshness();
  const indexText = loadIndexText();
  for (const file of listWikiPages()) {
    const content = readMarkdown(file);
    const parsed = parseFrontmatter(content);
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const body = parsed.body || content;
    const title = parsed.data && parsed.data.title ? parsed.data.title : path.basename(file, '.md');
    const trust = parsed.data && parsed.data.trust !== undefined ? Number(parsed.data.trust) : 0.3;
    const source = parsed.data && parsed.data.source ? parsed.data.source : null;
    const lastUpdated = parsed.data && parsed.data.last_updated ? parsed.data.last_updated : null;
    const freshInfo = freshness[rel.replace(/^wiki\//, '')] || null;
    const freshnessScore = freshInfo ? computeFreshnessScore(freshInfo.last_updated || lastUpdated) : computeFreshnessScore(lastUpdated);
    const metadata = { page: rel, title, trust };
    const score = scoreContent(content, query, metadata, freshnessScore, indexText);
    if (score <= 0) continue;
    hits.push({
      page: rel,
      title,
      snippet: extractSnippet(content, query),
      lead: extractLead(body),
      score,
      trust,
      source,
      last_updated: lastUpdated,
      freshness: Number(freshnessScore.toFixed(2)),
      related_links: extractRelatedLinks(content),
      verified: trust >= 0.5
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
    console.log(`${item.page}\t${item.title}\t${item.score}\ttrust=${item.trust}\tfreshness=${item.freshness}`);
    console.log(`  ${item.snippet}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { search };
