'use strict';

const fs = require('fs');
const path = require('path');
const {
  ROOT,
  WIKI,
  TEMP,
  ensureDir,
  listWikiPages,
  readMarkdown,
  parseFrontmatter,
  summarizeText
} = require('./wiki-utils');

const OUT_FILE = path.join(TEMP, 'scene-index.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { rebuild: false, query: '' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--rebuild') opts.rebuild = true;
    else if (args[i] === '--query') opts.query = args[++i] || '';
  }
  return opts;
}

function splitKeywords(text) {
  const words = new Set();
  const raw = String(text || '')
    .toLowerCase()
    .replace(/[\[\](){}`"'，。！？、：；|]/g, ' ')
    .split(/\s+|(?=[\u4e00-\u9fa5])|(?<=[\u4e00-\u9fa5])/)
    .map(x => x.trim())
    .filter(Boolean);

  for (const word of raw) {
    if (word.length >= 2 || /[\u4e00-\u9fa5]/.test(word)) words.add(word);
  }
  return [...words].filter(word => !['的', '了', '和', '与', '在', '是', 'to', 'the', 'and'].includes(word));
}

function pageRecord(file) {
  const content = readMarkdown(file);
  const parsed = parseFrontmatter(content);
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const title = parsed.data && parsed.data.title ? parsed.data.title : path.basename(file, '.md');
  const tags = parsed.data && Array.isArray(parsed.data.tags) ? parsed.data.tags : [];
  const lead = summarizeText(parsed.body || content, 180);
  const keywords = splitKeywords([title, tags.join(' '), lead].join(' '));
  return { page: rel, title, tags, lead, keywords };
}

function rebuild() {
  ensureDir(TEMP);
  const pages = listWikiPages().map(pageRecord);
  const index = {};
  for (const page of pages) {
    for (const key of page.keywords) {
      if (!index[key]) index[key] = [];
      if (!index[key].some(item => item.page === page.page)) {
        index[key].push({ page: page.page, title: page.title });
      }
    }
  }
  const payload = {
    generated_at: new Date().toISOString(),
    pages: pages.length,
    scenes: index
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

function loadOrBuild() {
  if (!fs.existsSync(OUT_FILE)) return rebuild();
  return JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
}

function queryScene(queryText) {
  const payload = loadOrBuild();
  const keys = splitKeywords(queryText);
  const scores = new Map();
  for (const key of keys) {
    const matches = payload.scenes[key] || [];
    for (const item of matches) {
      const current = scores.get(item.page) || { ...item, score: 0 };
      current.score += 1;
      scores.set(item.page, current);
    }
  }
  return [...scores.values()].sort((a, b) => b.score - a.score || a.page.localeCompare(b.page)).slice(0, 10);
}

function main() {
  const opts = parseArgs();
  if (opts.rebuild) {
    const payload = rebuild();
    console.log(JSON.stringify({ written: path.relative(ROOT, OUT_FILE).replace(/\\/g, '/'), pages: payload.pages, scenes: Object.keys(payload.scenes).length }, null, 2));
    return;
  }
  if (opts.query) {
    console.log(JSON.stringify({ query: opts.query, results: queryScene(opts.query) }, null, 2));
    return;
  }
  console.error('Usage: node scene-index.js --rebuild | --query "cron"');
  process.exit(1);
}

if (require.main === module) main();
module.exports = { rebuild, queryScene };
